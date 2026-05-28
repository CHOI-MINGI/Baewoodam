import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { db } from './db';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user?.passwordHash) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash,
        );
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          roleType: user.roleType,
          onboardingCompleted: user.onboardingCompleted,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.roleType = (user as any).roleType;
        token.onboardingCompleted = (user as any).onboardingCompleted;
      }
      if (trigger === 'update' && session) {
        token.onboardingCompleted = session.onboardingCompleted ?? token.onboardingCompleted;
        token.roleType = session.roleType ?? token.roleType;
      }
      // 로그인 시 DB에서 최신값 동기화
      if (trigger === 'signIn' && token.id) {
        try {
          const dbUser = await db.user.findUnique({ where: { id: token.id as string } });
          if (dbUser) {
            token.onboardingCompleted = dbUser.onboardingCompleted;
            token.roleType = dbUser.roleType as any;
          }
        } catch {}
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        (session.user as any).roleType = token.roleType;
        (session.user as any).onboardingCompleted = token.onboardingCompleted;
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        const existing = await db.user.findUnique({
          where: { email: user.email! },
        });
        if (!existing) {
          await db.user.create({
            data: {
              email: user.email!,
              name: user.name,
              image: user.image,
              emailVerified: new Date(),
            },
          });
        }
      }
      return true;
    },
  },
  pages: {
    signIn: '/login',
  },
});
