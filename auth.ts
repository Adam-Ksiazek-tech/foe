import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import PostgresAdapter from "@auth/pg-adapter";
import bcrypt from "bcryptjs";
import { pool } from "@/lib/db";
import { authConfig } from "@/auth.config";

import { logLoginEvent } from "@/lib/logLoginEvent";

// Lista e-maili, które WOLNO wpuścić przez logowanie Discord (inaczej każdy
// posiadacz konta Discord na świecie mógłby się zalogować).
// Ustawiana w .env, np: ALLOWED_EMAILS=ja@example.com,zona@example.com
const allowedEmails = (process.env.ALLOWED_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PostgresAdapter(pool),
  // Credentials provider wymaga sesji JWT (Auth.js nie zapisuje sesji
  // logowania hasłem do bazy przez adapter) - to jest zalecany, bezpieczny
  // wariant, nie obejście.
  session: { strategy: "jwt" },
  providers: [
    ...authConfig.providers,
    Credentials({
      name: "Email i hasło",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Hasło", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const { rows } = await pool.query(
          "SELECT id, email, name, password_hash FROM users WHERE email = $1",
          [String(credentials.email).toLowerCase()]
        );
        const user = rows[0];
        
        // Konto istnieje, ale nie ma hasła (np. założone tylko przez Discord)
        if (!user?.password_hash) return null;

        const valid = await bcrypt.compare(
          String(credentials.password),
          user.password_hash
        );
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      
      await logLoginEvent({
          app: "foe",
          email: user.email,
          name: user.name,
          provider: account?.provider ?? "unknown",
          providerAccountId: account?.providerAccountId,
      });
      
      /*if (account?.provider === "discord") {
        const email = user.email?.toLowerCase();

        if (!email || !allowedEmails.includes(email)) {
          return false;
        }
      }*/

      return true;
    },
  },
});