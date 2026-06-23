import { NextAuthOptions, Session } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import DiscordProvider from "next-auth/providers/discord";
import { db } from "@/lib/db";
import { nanoid } from "nanoid";
import { SITE_CONFIG } from "@/lib/config";

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  provider?: string;
  providerId?: string;
  admin?: boolean;
}

interface ExtendedSession extends Session {
  user: User;
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID || "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
    error: "/the-end",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!account) return false;

      const providerId = account.providerAccountId;
      const provider = account.provider;

      try {
        const [rows] = await db.query(
          "SELECT * FROM users WHERE providerId = ?",
          [providerId]
        );

        const users = rows as User[];

        if (SITE_CONFIG.PRIVATE_MODE && users.length === 0) {
          return false;
        }

        if (!SITE_CONFIG.PRIVATE_MODE && users.length === 0) {
          const userId = nanoid();
          await db.query(
            "INSERT INTO users (id, name, email, image, provider, providerId) VALUES (?, ?, ?, ?, ?, ?)",
            [userId, user.name, user.email, user.image, provider, providerId]
          );
          (user as User).id = userId;
        } else {
          (user as User).id = users[0].id;
        }

        return true;
      } catch (error) {
        console.error("Error:", error);
        return false;
      }
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = (user as User).id;
        token.authorized = true;
      }
      return token;
    },

    async session({ session, token }): Promise<ExtendedSession> {
      const extendedSession = session as ExtendedSession;

      if (extendedSession.user && token.id) {
        extendedSession.user.id = typeof token.id === "string" ? token.id : "";

        try {
          const [rows] = await db.query(
            "SELECT admin FROM users WHERE id = ?",
            [token.id]
          );

          const adminResult = rows as Pick<User, "admin">[];
          if (adminResult && adminResult.length > 0) {
            extendedSession.user.admin = adminResult[0].admin;
          }
        } catch (error) {
          console.error("Erreur lors de la récupération du statut admin:", error);
          extendedSession.user.admin = false;
        }
      }

      return extendedSession;
    },
  },
};
