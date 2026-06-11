DO $$ BEGIN
  CREATE TYPE custom_saas_request_status AS ENUM (
    'requested',
    'under_review',
    'budget_sent',
    'budget_approved',
    'budget_declined',
    'in_build',
    'in_review',
    'completed',
    'cancelled'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS custom_saas_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  project_name text NOT NULL,
  short_description text NOT NULL,
  problem_solved text NOT NULL,
  main_goal text NOT NULL DEFAULT '',
  target_audience text NOT NULL,
  segment text NOT NULL DEFAULT '',
  urgency text NOT NULL DEFAULT '',
  desired_deadline text NOT NULL DEFAULT '',
  desired_features text NOT NULL,
  expected_screens text NOT NULL DEFAULT '',
  user_profiles text NOT NULL DEFAULT '',
  permissions_needed text NOT NULL DEFAULT '',
  main_flows text NOT NULL DEFAULT '',
  desired_automations text NOT NULL DEFAULT '',
  reports_dashboards text NOT NULL DEFAULT '',
  data_to_register text NOT NULL DEFAULT '',
  data_import_export text NOT NULL DEFAULT '',
  required_integrations text NOT NULL DEFAULT '',
  external_apis text NOT NULL DEFAULT '',
  payments_subscriptions text NOT NULL DEFAULT '',
  ai_usage text NOT NULL DEFAULT '',
  notifications_webhooks text NOT NULL DEFAULT '',
  similar_systems text NOT NULL DEFAULT '',
  visual_preference text NOT NULL DEFAULT '',
  device_usage text NOT NULL DEFAULT '',
  responsiveness_need text NOT NULL DEFAULT '',
  accessibility_need text NOT NULL DEFAULT '',
  estimated_budget text NOT NULL DEFAULT '',
  business_model text NOT NULL DEFAULT '',
  multi_tenant_need text NOT NULL DEFAULT '',
  admin_panel_need text NOT NULL DEFAULT '',
  hosting_need text NOT NULL DEFAULT '',
  additional_notes text NOT NULL DEFAULT '',
  attachment_notes text NOT NULL DEFAULT '',
  status custom_saas_request_status NOT NULL DEFAULT 'requested',
  current_stage text NOT NULL DEFAULT 'Solicitação recebida',
  admin_budget_amount numeric(12,2),
  admin_budget_notes text NOT NULL DEFAULT '',
  user_budget_response text NOT NULL DEFAULT '',
  budget_sent_at timestamptz,
  budget_approved_at timestamptz,
  budget_declined_at timestamptz,
  build_started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS custom_saas_request_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES custom_saas_requests(id) ON DELETE CASCADE,
  user_id uuid REFERENCES app_users(id) ON DELETE SET NULL,
  author_type support_message_author_type NOT NULL DEFAULT 'user',
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS custom_saas_requests_user_id_idx ON custom_saas_requests(user_id);
CREATE INDEX IF NOT EXISTS custom_saas_requests_status_idx ON custom_saas_requests(status);
CREATE INDEX IF NOT EXISTS custom_saas_requests_created_at_idx ON custom_saas_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS custom_saas_request_messages_request_id_idx ON custom_saas_request_messages(request_id);

DROP TRIGGER IF EXISTS set_custom_saas_requests_updated_at ON custom_saas_requests;
CREATE TRIGGER set_custom_saas_requests_updated_at
BEFORE UPDATE ON custom_saas_requests
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
