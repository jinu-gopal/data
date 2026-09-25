import NextAuth from "next-auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,

  providers: [
    {
      id: "max-erp",
      name: "MAX ERP",
      type: "oidc",

      issuer: process.env.MAX_ERP_OIDC_ISSUER,
      clientId: process.env.MAX_ERP_OIDC_CLIENT_ID,

      client: {
        token_endpoint_auth_method: "none",
      },

      checks: ["pkce", "state"],

      authorization: {
        params: {
          scope: "openid profile email",
          response_type: "code",
        },
      },

      profile(profile) {
        return {
          id: profile.sub,
          name:
            profile.name ??
            profile.preferred_username ??
            profile.username ??
            profile.sub,
          email: profile.email ?? null,
          image: profile.picture ?? null,
        };
      },
    },
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        console.log("========== MAX ERP OIDC LOGIN ==========");

        console.log({
          provider: account.provider,
          type: account.type,
          hasAccessToken: !!account.access_token,
          hasIdToken: !!account.id_token,
          hasRefreshToken: !!account.refresh_token,
          expiresAt: account.expires_at ?? null,
        });

        if (account.access_token) {
          token.accessToken = account.access_token;
        }

        if (account.expires_at) {
          token.accessTokenExpires = account.expires_at;
        }

        if (account.refresh_token) {
          token.refreshToken = account.refresh_token;
        }
      }

      return token;
    },

    async session({ session }) {
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
});