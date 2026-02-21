-- Add the missing accepted_at column to the invitations table
ALTER TABLE invitations
ADD COLUMN IF NOT EXISTS accepted_at timestamptz;
