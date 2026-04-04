const crypto = require("crypto");
const { createClient } = require("@supabase/supabase-js");
const db = require("./database");

const supabaseUrl = process.env.SUPABASE_PROJECT_URL;
const supabaseKey = process.env.SUPABASE_API_KEY;
const oauthFlows = new Map();


/** 
 * OAuth Configuration for Social Login
 * Supports Google
*/

class OAuthConfig {
    constructor() {
        this.db = db;
        this.redirectURL = process.env.OAUTH_REDIRECT_URL;
    }

    createFlowClient(flowId) {
        if (!oauthFlows.has(flowId)) {
            oauthFlows.set(flowId, new Map());
        }

        const flowStorage = oauthFlows.get(flowId);

        return createClient(supabaseUrl, supabaseKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: true,
                detectSessionInUrl: false,
                flowType: "pkce",
                storage: {
                    getItem: async (key) => flowStorage.get(key) ?? null,
                    setItem: async (key, value) => flowStorage.set(key, value),
                    removeItem: async (key) => flowStorage.delete(key),
                },
            },
        });
    }

    buildRedirectUrl(redirectTo, params = {}) {
        const url = new URL(redirectTo || this.redirectURL);

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                url.searchParams.set(key, value);
            }
        });

        return url.toString();
    }

    clearFlow(flowId) {
        if (flowId) {
            oauthFlows.delete(flowId);
        }
    }

    /**
     * Get OAuth URL Provider
     * @param {string} Provider
     * @param {object} options - Optional parameters for the OAuth request
     * @returns {Promise<string>} - OAuth Url
    */

    async getOAuthUrl(provider, options = {}) {
        const flowId = crypto.randomUUID();
        const client = this.createFlowClient(flowId);

        // Build redirect URL params - include mode=link and linkUserId if this is a link flow
        const redirectParams = { flowId };
        if (options.linkUserId) {
            redirectParams.mode = "link";
            redirectParams.linkUserId = options.linkUserId;
        }

        const {data, error} = await client.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: this.buildRedirectUrl(options.redirectTo || this.redirectURL, redirectParams),
                scopes: options.scopes || this.getDefaultScopes(provider),
                queryParams: options.queryParams || {}
            }
        });
        if (error) {
            this.clearFlow(flowId);
            throw error;
        }
        return data.url;
    }

    /**
   * Get default scopes for each provider
   * @param {string} provider
   * @returns {string}
   */
    getDefaultScopes(provider) {
        const scopes = {
        google: "openid email profile",
        facebook: "email public_profile",
        github: "read:user user:email",
        apple: "email name",
        };
        return scopes[provider] || "";
    }
     /**
   * Exchange OAuth code for session
   * This happens in the callback
   * @param {string} code - OAuth code from provider
   * @returns {Promise<object>} Session data
   */
  async initiateIdentityLink({ provider, accessToken, refreshToken, redirectTo }) {
    const flowId = crypto.randomUUID();
    const client = this.createFlowClient(flowId);

    const { error: sessionError } = await client.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (sessionError) {
      this.clearFlow(flowId);
      throw sessionError;
    }

    const { data, error } = await client.auth.linkIdentity({
      provider,
      options: {
        redirectTo: this.buildRedirectUrl(redirectTo, { flowId, mode: "link", format: "json" }),
      },
    });

    if (error) {
      this.clearFlow(flowId);
      throw error;
    }

    return {
      flowId,
      url: data.url,
    };
  }

  async exchangeCodeForSession(code, flowId = null) {
    const client = flowId ? this.createFlowClient(flowId) : this.db;
    const { data, error } = await client.auth.exchangeCodeForSession(code);

    this.clearFlow(flowId);

    if (error) throw error;
    return data;
  }

  /**
   * Get user data from OAuth session
   * @param {string} accessToken - Supabase access token
   * @returns {Promise<object>} User data
   */
  async getUserFromSession(accessToken) {
    const { data, error } = await this.db.auth.getUser(accessToken);

    if (error) throw error;
    return data.user;
  }

  /**
   * Sign out user
   * @returns {Promise<void>}
   */
  async signOut(accessToken) {
    const { error } = await this.db.auth.signOut(accessToken);

    if (error) throw error;
  }
}

module.exports = new OAuthConfig();