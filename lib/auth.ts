import NextAuth from "next-auth";
import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
  providers: [],
  callbacks: {
    async session({ session, token }) {
      return session;
    },
    async jwt({ token }) {
      return token;
    },
  },
};

export default NextAuth(authOptions);