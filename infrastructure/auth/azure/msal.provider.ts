import {
  AuthenticationResult,
  //   AuthorizationCodeRequest,
  AuthorizationUrlRequest,
  ConfidentialClientApplication,
  CryptoProvider,
} from "@azure/msal-node";
import msalConfig from "./msal.config.ts";

// Define interface for Auth options
interface AuthOptions {
  successRedirect?: string;
  scopes?: string[];
  redirectUri?: string;
}

export class AuthProvider {
  private msalConfig: any;
  private cryptoProvider: CryptoProvider;
  private readonly FRONTEND_REDIRECT_URI: string;

  constructor(msalConfig: any) {
    this.msalConfig = msalConfig;
    this.cryptoProvider = new CryptoProvider();
    this.FRONTEND_REDIRECT_URI = Deno.env.get("FRONTEND_REDIRECT_URI") ||
      "http://localhost:3000/auth/callback";
  }

  /**
   * Generates an authentication URL for signing in with Azure AD
   */
  async getAuthUrl(options: AuthOptions = {}): Promise<string> {
    const state = this.cryptoProvider.base64Encode(
      JSON.stringify({
        successRedirect: options.successRedirect || "/",
      }),
    );

    const authCodeUrlRequestParams: AuthorizationUrlRequest = {
      state,
      scopes: options.scopes || [],
      redirectUri: options.redirectUri || this.FRONTEND_REDIRECT_URI,
    };

    const msalInstance = this.getMsalInstance(this.msalConfig);
    const authCodeUrlResponse = await msalInstance.getAuthCodeUrl(
      authCodeUrlRequestParams,
    );
    return authCodeUrlResponse;
  }

  /**
   * Handles the authorization code returned from Azure AD
   */
  async handleAuthCode(
    code: string,
    redirectUri?: string,
  ): Promise<AuthenticationResult> {
    const msalInstance = this.getMsalInstance(this.msalConfig);

    const tokenResponse = await msalInstance.acquireTokenByCode({
      code,
      redirectUri: redirectUri || this.FRONTEND_REDIRECT_URI,
      scopes: [],
    });

    return tokenResponse;
  }

  /**
   * Gets an instance of ConfidentialClientApplication
   */
  getMsalInstance(msalConfig: any): ConfidentialClientApplication {
    return new ConfidentialClientApplication(msalConfig);
  }

  /**
   * Retrieves user photo from Microsoft Graph API
   */
  async getUserPhoto(accessToken: string): Promise<string> {
    const graphEndpoint = "https://graph.microsoft.com/v1.0/me/photo/$value";
    const options = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };

    try {
      const response = await fetch(graphEndpoint, options);
      if (!response.ok) {
        throw new Error(`Failed to fetch user photo: ${response.status}`);
      }

      // In Deno we can't use URL.createObjectURL directly
      // Instead we'll return the photo as a base64 string
      const photoArrayBuffer = await response.arrayBuffer();
      const photoBase64 = btoa(
        String.fromCharCode(...new Uint8Array(photoArrayBuffer)),
      );
      return `data:image/jpeg;base64,${photoBase64}`;
    } catch (error) {
      console.error("Error fetching user photo:", error);
      throw new Error(
        error instanceof Error ? error.message : "Unknown error fetching photo",
      );
    }
  }
}

// Create and export a singleton instance
const authProvider = new AuthProvider(msalConfig);

export default authProvider;
