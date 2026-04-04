const oauthService = require("../services/oauthService");
const { ValidationError } = require("../utils/error");

/**
 * OAuth Controller - Handles HTTP requests for social login
 */

class OAuthController {
  /**
   * GET /auth/oauth/:provider
   * Initiate OAuth flow - returns URL to redirect user to
   */
  async initiateOAuth(req, res, next) {
    try {
      const { provider } = req.params;
      const { redirectUrl } = req.query;

      const result = await oauthService.initiateOAuth(provider, redirectUrl);
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /auth/oauth/callback
   * Handle OAuth callback from provider
   * This is where the provider redirects back to
   */
  async handleCallback(req, res, next) {
    try {
      const { code, flowId, mode, linkUserId } = req.query;

      const result = await oauthService.handleOAuthCallback(
        code,
        flowId,
        mode === "link" ? linkUserId : null
      );
      
      if (req.query.format === "json") {
        return res.json(result);
      }

      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

      if (mode === "link") {
        return res.redirect(`${frontendUrl}/auth/link-success?provider=${encodeURIComponent(result.user.provider)}`);
      }

      const redirectUrl = `${frontendUrl}/auth/success?token=${result.token}&refreshToken=${result.refreshToken}`;

      return res.redirect(redirectUrl);
    } catch (error) {
      // Redirect to error page
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      return res.redirect(`${frontendUrl}/auth/error?message=${encodeURIComponent(error.message)}`);
    }
  }

  /**
   * POST /auth/oauth/link
   * Link OAuth provider to existing account
   * Returns an OAuth URL - user must be redirected to it
   */
  async linkProvider(req, res, next) {
    try {
      const { provider, redirectUrl } = req.body || {};

      if (!provider) {
        throw new ValidationError("provider is required in request body");
      }

      const result = await oauthService.linkOAuthProvider(
        req.user.id,
        provider,
        redirectUrl
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /auth/oauth/unlink/:provider
   * Unlink OAuth provider from account
   */
  async unlinkProvider(req, res, next) {
    try {
      const { provider } = req.params;
      
      const result = await oauthService.unlinkOAuthProvider(
        req.user.id,
        provider
      );
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /auth/oauth/providers
   * Get list of linked OAuth providers
   */
  async getLinkedProviders(req, res, next) {
    try {
      const result = await oauthService.getLinkedProviders(req.user.id);
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new OAuthController();