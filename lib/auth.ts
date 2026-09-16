// ============================================
// NextAuth.js v5 Configuration
// ============================================

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { getUserByEmail, getUserByGoogleId, createUser, updateUser } from './db';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    // Email + Password
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        const user = getUserByEmail(email);
        if (!user || !user.password_hash) {
          return null;
        }

        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar_url,
        };
      },
    }),

    // Google OAuth
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  pages: {
    signIn: '/login',
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        const email = user.email;
        if (!email) return false;

        // Check if user exists by google ID
        let dbUser = getUserByGoogleId(account.providerAccountId);

        if (!dbUser) {
          // Check if user exists by email (maybe registered with password before)
          dbUser = getUserByEmail(email);

          if (dbUser) {
            // Link Google account to existing user
            updateUser(dbUser.id, {
              google_id: account.providerAccountId,
              avatar_url: (profile as { picture?: string })?.picture || user.image || undefined,
              name: user.name || dbUser.name || undefined,
            });
          } else {
            // Create new user
            dbUser = createUser({
              email,
              name: user.name || undefined,
              google_id: account.providerAccountId,
              avatar_url: (profile as { picture?: string })?.picture || user.image || undefined,
            });
          }
        }

        // Overwrite the user object with our DB user ID
        user.id = dbUser.id;
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },

  session: {
    strategy: 'jwt',
  },

  secret: process.env.AUTH_SECRET,
});
