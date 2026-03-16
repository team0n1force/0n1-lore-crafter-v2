-- Create soul deletion audit logs table
CREATE TABLE IF NOT EXISTS soul_deletion_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  soul_id TEXT NOT NULL,
  nft_id TEXT NOT NULL,
  success BOOLEAN NOT NULL,
  reason TEXT,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_soul_deletion_logs_wallet ON soul_deletion_logs(wallet_address);
CREATE INDEX idx_soul_deletion_logs_soul ON soul_deletion_logs(soul_id);
CREATE INDEX idx_soul_deletion_logs_nft ON soul_deletion_logs(nft_id);
CREATE INDEX idx_soul_deletion_logs_attempted ON soul_deletion_logs(attempted_at);

-- Enable Row Level Security
ALTER TABLE soul_deletion_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policy - only allow inserts from the API (no direct access)
CREATE POLICY "Service role can insert deletion logs" ON soul_deletion_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Create RLS policy - authenticated users can only view their own logs
CREATE POLICY "Users can view their own deletion logs" ON soul_deletion_logs
  FOR SELECT
  TO authenticated
  USING (wallet_address = auth.jwt() ->> 'walletAddress');

-- Add comment on table
COMMENT ON TABLE soul_deletion_logs IS 'Audit log for all soul deletion attempts, both successful and failed'; 