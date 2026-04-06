const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const oauthConfig = require("../config/oauth");
const userRepository = require("../Repositories/userRepository");
const jwtConfig = require("../config/jwt");
const { ValidationError, UnauthorizedError } = require("../utils/error");

/**
 * OAuth Service - Handles social login flow
 * Clean separation of concerns with proper error handling
 */

class OAuthService {
  isJwtLike(token) {
    return typeof token === "string" && token.trim().split(".").length === 3;
  }

  /**
   * Step 1: Generate OAuth URL for provider
   * @param {string} provider - 'google', 'facebook', 'github', etc.
   * @param {string} redirectUrl - Custom redirect URL (optional)
   * @returns {Promise<object>} { url, provider }
   */
  async initiateOAuth(provider, redirectUrl = null) {
    const validProviders = ["google"];

    if (!validProviders.includes(provider)) {
      throw new ValidationError("Invalid provider. Only google is supported");
    }

    try {
      const url = await oauthConfig.getOAuthUrl(provider, {
        redirectTo: redirectUrl,
      });

      return {
        url,
        provider,
        message: `Redirect user to this URL to authenticate with ${provider}`,
      };
    } catch (error) {
      throw new UnauthorizedError(`Failed to initiate ${provider} OAuth: ${error.message}`);
    }
  }

  /**
   * Step 2: Handle OAuth callback
   * Exchange code for session and sync with our database
   * @param {string} code - OAuth code from provider
   * @param {string} flowId - Flow ID for PKCE storage
   * @param {number} linkUserId - If provided, link the OAuth identity to this existing user
   * @returns {Promise<object>} User data with JWT tokens
   */
  async handleOAuthCallback(code, flowId = null, linkUserId = null) {
    if (!code) {
      throw new ValidationError("OAuth code is required");
    }

    try {
      const session = await oauthConfig.exchangeCodeForSession(code, flowId);
      
      if (!session || !session.user) {
        throw new UnauthorizedError("Failed to authenticate with OAuth provider");
      }

      const supabaseUser = session.user;
      let user;

      if (linkUserId) {
        // Link mode: attach this OAuth identity to the existing user
        user = await userRepository.getById(linkUserId);
        if (!user) {
          throw new UnauthorizedError("User to link not found");
        }
        // Update the existing user's metadata with OAuth info
        user = await this.updateUserOAuthData(user.id, supabaseUser);
      } else {
        // Normal login/signup mode
        user = await userRepository.getByEmail(supabaseUser.email);

        if (!user) {
          user = await this.createUserFromOAuth(supabaseUser);
        } else {
          user = await this.updateUserOAuthData(user.id, supabaseUser);
        }
      }

      // Generate our own JWT tokens
      const token = jwtConfig.generateToken({ 
        userId: user.id, 
        email: user.email 
      });
      
      const refreshToken = jwtConfig.generateRefreshToken({ 
        userId: user.id 
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: supabaseUser.user_metadata?.avatar_url || null,
          provider: supabaseUser.app_metadata?.provider || "email",
          linked: linkUserId ? true : false,
        },
        token,
        refreshToken,
        supabaseSession: {
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        },
      };
    } catch (error) {
      if (error instanceof ValidationError || error instanceof UnauthorizedError) {
        throw error;
      }
      throw new UnauthorizedError(`OAuth callback failed: ${error.message}`);
    }
  }

  /**
   * Sync user from frontend Supabase Session
   * @param {string} accessToken - Supabase access token from frontend
   * @returns {Promise<object>} User data with backend JWT tokens
   */
  async syncUserFromSupabase(accessToken) {
    if (!accessToken) {
      throw new ValidationError("Access token is required");
    }

    try {
      const supabaseUser = await oauthConfig.getUserFromSession(accessToken);
      
      if (!supabaseUser || !supabaseUser.email) {
        throw new UnauthorizedError("Invalid Supabase token");
      }

      let user = await userRepository.getByEmail(supabaseUser.email);

      if (!user) {
        user = await this.createUserFromOAuth(supabaseUser);
      } else {
        user = await this.updateUserOAuthData(user.id, supabaseUser);
      }

      // Generate our own JWT tokens
      const token = jwtConfig.generateToken({ 
        userId: user.id, 
        email: user.email 
      });
      
      const refreshToken = jwtConfig.generateRefreshToken({ 
        userId: user.id 
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: supabaseUser.user_metadata?.avatar_url || null,
          provider: supabaseUser.app_metadata?.provider || "email",
        },
        token,
        refreshToken
      };
    } catch (error) {
      if (error instanceof ValidationError || error instanceof UnauthorizedError) {
        throw error;
      }
      throw new UnauthorizedError(`Failed to sync user: ${error.message}`);
    }
  }

  /**
   * Create new user from OAuth provider data
   * @param {object} supabaseUser - User data from Supabase
   * @returns {Promise<object>} Created user
   */
  async createUserFromOAuth(supabaseUser) {
    const provider = supabaseUser.app_metadata?.provider || "google";

    const userData = {
      email: supabaseUser.email,
      password: await bcrypt.hash(crypto.randomUUID(), 10),
      name: supabaseUser.user_metadata?.full_name || 
            supabaseUser.user_metadata?.name || 
            supabaseUser.email.split("@")[0],
      role: "user",
      profile_image_url: supabaseUser.user_metadata?.avatar_url || null,
      oauth_providers: JSON.stringify([provider]),
    };

    return await userRepository.create(userData);
  }

  /**
   * Update existing user's OAuth metadata
   * @param {number} userId - User ID
   * @param {object} supabaseUser - Updated user data from Supabase
   * @returns {Promise<object>} Updated user
   */
  async updateUserOAuthData(userId, supabaseUser) {
    const provider = supabaseUser.app_metadata?.provider || "google";
    const avatarUrl = supabaseUser.user_metadata?.avatar_url;
    const name = supabaseUser.user_metadata?.full_name || 
                 supabaseUser.user_metadata?.name;

    const updates = {};
    if (name) updates.name = name;
    if (avatarUrl) updates.profile_image_url = avatarUrl;

    // Update user fields if there's anything to update
    if (Object.keys(updates).length > 0) {
      await userRepository.update(userId, updates);
    }

    // Add the provider to linked providers list
    await userRepository.addOAuthProvider(userId, provider);

    return await userRepository.getById(userId);
  }

  /**
   * Link OAuth provider to existing account
   * Works for ALL users (email/password or OAuth) by initiating a new OAuth
   * flow with mode=link. The callback will link the provider to the existing user.
   * @param {number} userId - User ID
   * @param {string} provider - OAuth provider
   * @param {string} redirectUrl - Custom redirect URL (optional)
   * @returns {Promise<object>} { url, provider, message }
   */
  async linkOAuthProvider(userId, provider, redirectUrl = null) {
    const validProviders = ["google"];

    if (!validProviders.includes(provider)) {
      throw new ValidationError("Invalid provider. Only google is supported");
    }

    try {
      const user = await userRepository.getById(userId);

      if (!user) {
        throw new UnauthorizedError("User not found");
      }

      // Generate an OAuth URL that includes mode=link and the userId
      // so the callback knows to link rather than create/login
      const url = await oauthConfig.getOAuthUrl(provider, {
        redirectTo: redirectUrl,
        linkUserId: userId,
      });

      return {
        url,
        provider,
        message: `Redirect user to this URL to link ${provider} to their account`,
      };
    } catch (error) {
      if (error instanceof ValidationError || error instanceof UnauthorizedError) {
        throw error;
      }
      throw new UnauthorizedError(`Failed to initiate ${provider} link: ${error.message}`);
    }
  }

  /**
   * Unlink OAuth provider from account
   * @param {number} userId - User ID
   * @param {string} provider - OAuth provider
   * @returns {Promise<object>} Success message
   */
  async unlinkOAuthProvider(userId, provider) {
    // This is handled by Supabase, we just need to verify the user
    const user = await userRepository.getById(userId);
    
    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    return {
      message: `${provider} unlinked successfully`,
      userId: user.id,
    };
  }

  /**
   * Get user's linked OAuth providers
   * @param {number} userId - User ID
   * @returns {Promise<array>} List of linked providers
   */
  async getLinkedProviders(userId) {
    const user = await userRepository.getById(userId);
    
    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    const providers = await userRepository.getOAuthProviders(userId);

    return {
      userId: user.id,
      providers,
    };
  }
}

module.exports = new OAuthService();