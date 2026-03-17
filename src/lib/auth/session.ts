import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const expectedUsername = process.env.DASHBOARD_USERNAME;
        const expectedPassword = process.env.DASHBOARD_PASSWORD;

        if (!credentials?.username || !credentials?.password) return null;
        if (!expectedUsername || !expectedPassword) return null;

        if (credentials.username !== expectedUsername) return null;

        const passwordMatch = expectedPassword.startsWith("$2")
          ? await bcrypt.compare(credentials.password, expectedPassword)
          : credentials.password === expectedPassword;

        if (!passwordMatch) return null;

        return { id: "1", name: expectedUsername };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
