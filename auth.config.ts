import type { NextAuthConfig } from "next-auth";
import Discord from "next-auth/providers/discord";

// Wersja "edge-safe" configu - BEZ PostgresAdapter (który ciągnie za sobą
// pełny Node.js 'pg' + 'crypto', czego Edge Runtime middleware nie obsługuje).
// Używana tylko przez middleware.ts do sprawdzenia czy sesja istnieje.
export const authConfig: NextAuthConfig = {
  providers: [Discord],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth }) {
      return !!auth?.user;
    },
  },
};