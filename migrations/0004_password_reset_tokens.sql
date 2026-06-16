CREATE TABLE IF NOT EXISTS app_password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS app_password_reset_tokens_user_id_idx ON app_password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS app_password_reset_tokens_token_hash_idx ON app_password_reset_tokens(token_hash);
CREATE INDEX IF NOT EXISTS app_password_reset_tokens_expires_at_idx ON app_password_reset_tokens(expires_at);

-- Limpeza recomendada em rotina periódica:
-- DELETE FROM app_password_reset_tokens WHERE used_at IS NOT NULL OR expires_at < now();
