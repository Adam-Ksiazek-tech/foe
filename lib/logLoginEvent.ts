import { pool } from "@/lib/db";

type LogLoginEventParams = {
    app: string;
    email?: string | null;
    name?: string | null;
    provider: string;
    providerAccountId?: string | null;
};

export async function logLoginEvent({
    app,
    email,
    name,
    provider,
    providerAccountId,
}: LogLoginEventParams) {
    try {
        
        await pool.query(
            `INSERT INTO login_events (app, email, name, provider, provider_account_id)
             VALUES ($1, $2, $3, $4, $5)`,
            [app, email ?? null, name ?? null, provider, providerAccountId ?? null]
        );
    } catch (err) {
        // Błąd logowania eventu nie powinien blokować samego logowania usera.
        console.error("Nie udało się zapisać login_events:", err);
    }
}