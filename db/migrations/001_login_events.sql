CREATE TABLE IF NOT EXISTS login_events (
    id SERIAL PRIMARY KEY,
    app TEXT NOT NULL,
    email TEXT,
    name TEXT,
    provider TEXT NOT NULL,
    provider_account_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);