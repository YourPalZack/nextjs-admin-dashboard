import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import { client } from './sanity.client';

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          // Check if user exists in Sanity
          const existingUser = await client.fetch(
            `*[_type == "user" && email == $email][0]`,
            { email: user.email }
          );

          if (!existingUser) {
            // Create new user in Sanity
            await client.create({
              _type: 'user',
              email: user.email,
              name: user.name,
              image: user.image,
              role: 'jobseeker', // Default role
              createdAt: new Date().toISOString(),
            });
          }
          return true;
        } catch (error) {
          console.error('Error during sign in:', error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user?.email) {
        // Fetch user data from Sanity
        const userData = await client.fetch(
          `*[_type == "user" && email == $email][0]{
            _id,
            email,
            name,
            role,
            companyId
          }`,
          { email: session.user.email }
        );

        if (userData) {
          session.user = {
            ...session.user,
            id: userData._id,
            role: userData.role,
            companyId: userData.companyId,
          };
        }
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (account && user) {
        token.id = user.id;
      }
      return token;
    },
  },
  session: {
    strategy: 'jwt',
  },
};