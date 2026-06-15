CREATE TABLE IF NOT EXISTS support_ticket_systems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE app_users
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

ALTER TABLE support_tickets
  ADD COLUMN IF NOT EXISTS system_id uuid REFERENCES support_ticket_systems(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS system_name text NOT NULL DEFAULT 'SmileHub';

CREATE TABLE IF NOT EXISTS support_ticket_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  uploaded_by uuid REFERENCES app_users(id) ON DELETE SET NULL,
  file_name text NOT NULL,
  mime_type text NOT NULL,
  size_bytes integer NOT NULL,
  data_base64 text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT support_ticket_attachments_mime_check CHECK (mime_type IN ('image/png', 'image/jpeg', 'image/webp')),
  CONSTRAINT support_ticket_attachments_size_check CHECK (size_bytes > 0 AND size_bytes <= 3145728)
);

INSERT INTO support_ticket_systems (name, active, sort_order)
VALUES
  ('SmileHub', true, 10),
  ('ClassFlow', true, 20),
  ('BuscaCNAE', true, 30)
ON CONFLICT (name) DO UPDATE
SET active = true,
    sort_order = EXCLUDED.sort_order,
    updated_at = now();

UPDATE support_tickets
SET system_name = 'SmileHub'
WHERE system_name IS NULL OR btrim(system_name) = '';

UPDATE support_tickets t
SET system_id = s.id
FROM support_ticket_systems s
WHERE t.system_id IS NULL
  AND t.system_name = s.name;

CREATE INDEX IF NOT EXISTS app_users_is_active_idx ON app_users(is_active);
CREATE INDEX IF NOT EXISTS support_ticket_systems_active_idx ON support_ticket_systems(active);
CREATE INDEX IF NOT EXISTS support_tickets_system_id_idx ON support_tickets(system_id);
CREATE INDEX IF NOT EXISTS support_ticket_attachments_ticket_id_idx ON support_ticket_attachments(ticket_id);

DROP TRIGGER IF EXISTS set_support_ticket_systems_updated_at ON support_ticket_systems;
CREATE TRIGGER set_support_ticket_systems_updated_at
BEFORE UPDATE ON support_ticket_systems
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
