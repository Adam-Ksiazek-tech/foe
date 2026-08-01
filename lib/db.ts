import { Pool } from "pg";

// Jeden globalny pool połączeń do bazy - reużywany między requestami.
// W dev z hot-reloadem Next.js moduł potrafi się przeładować wielokrotnie,
// więc trzymamy pool na globalThis, żeby nie tworzyć nowego przy każdym
// zapisie pliku (inaczej szybko skończą się dostępne połączenia do bazy).
declare global {
  // eslint-disable-next-line no-var
  var _pgPool: Pool | undefined;
}

export const pool =
  global._pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== "production") {
  global._pgPool = pool;
}