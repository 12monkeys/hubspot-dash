import NextAuth from "next-auth";
import { NextAuthOptions, Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise, {
    collections: {
      Users: "users",
      Accounts: "accounts",
      Sessions: "sessions",
      VerificationTokens: "verification-tokens"
    }
  }),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
  providers: [],
  callbacks: {
    async session({ session, token }: { session: Session; token: JWT }) {
      return session;
    },
    async jwt({ token }: { token: JWT }) {
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

export default NextAuth(authOptions);