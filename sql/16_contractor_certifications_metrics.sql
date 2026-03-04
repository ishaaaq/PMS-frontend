-- ============================================================
-- 16_contractor_certifications_metrics.sql
-- New tables: contractor certifications & performance metrics
-- ============================================================

-- ============================================================
-- CONTRACTOR CERTIFICATIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS contractor_certifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contractor_user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    issuer TEXT NOT NULL,
    issue_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'VALID'
        CHECK (status IN ('VALID', 'EXPIRING', 'EXPIRED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE contractor_certifications ENABLE ROW LEVEL SECURITY;

-- Contractor reads own certifications
CREATE POLICY "contractor_read_own_certs"
    ON contractor_certifications FOR SELECT
    USING (contractor_user_id = auth.uid());

-- Admin reads all
CREATE POLICY "admin_read_all_certs"
    ON contractor_certifications FOR SELECT
    USING (is_admin());

-- Consultant reads certs for contractors on their projects
CREATE POLICY "consultant_read_project_certs"
    ON contractor_certifications FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM section_assignments sa
            JOIN sections s ON sa.section_id = s.id
            JOIN project_consultants pc ON pc.project_id = s.project_id
            WHERE sa.contractor_user_id = contractor_certifications.contractor_user_id
              AND pc.consultant_user_id = auth.uid()
        )
    );

-- Contractor can insert/update own certs
CREATE POLICY "contractor_insert_own_certs"
    ON contractor_certifications FOR INSERT
    WITH CHECK (contractor_user_id = auth.uid());

CREATE POLICY "contractor_update_own_certs"
    ON contractor_certifications FOR UPDATE
    USING (contractor_user_id = auth.uid());

CREATE POLICY "contractor_delete_own_certs"
    ON contractor_certifications FOR DELETE
    USING (contractor_user_id = auth.uid());

-- ============================================================
-- CONTRACTOR PERFORMANCE METRICS
-- ============================================================

CREATE TABLE IF NOT EXISTS contractor_performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contractor_user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    value NUMERIC(10, 2) NOT NULL,
    unit TEXT NOT NULL,
    trend TEXT NOT NULL DEFAULT 'stable'
        CHECK (trend IN ('up', 'down', 'stable')),
    change TEXT NOT NULL DEFAULT '0%',
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE contractor_performance_metrics ENABLE ROW LEVEL SECURITY;

-- Contractor reads own metrics
CREATE POLICY "contractor_read_own_metrics"
    ON contractor_performance_metrics FOR SELECT
    USING (contractor_user_id = auth.uid());

-- Admin reads all
CREATE POLICY "admin_read_all_metrics"
    ON contractor_performance_metrics FOR SELECT
    USING (is_admin());

-- Consultant reads metrics for project contractors
CREATE POLICY "consultant_read_project_metrics"
    ON contractor_performance_metrics FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM section_assignments sa
            JOIN sections s ON sa.section_id = s.id
            JOIN project_consultants pc ON pc.project_id = s.project_id
            WHERE sa.contractor_user_id = contractor_performance_metrics.contractor_user_id
              AND pc.consultant_user_id = auth.uid()
        )
    );

-- Admin can insert/update (metrics are managed by admin/system)
CREATE POLICY "admin_insert_metrics"
    ON contractor_performance_metrics FOR INSERT
    WITH CHECK (is_admin());

CREATE POLICY "admin_update_metrics"
    ON contractor_performance_metrics FOR UPDATE
    USING (is_admin());

CREATE POLICY "admin_delete_metrics"
    ON contractor_performance_metrics FOR DELETE
    USING (is_admin());

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_contractor_certs_user
    ON contractor_certifications(contractor_user_id);

CREATE INDEX IF NOT EXISTS idx_contractor_metrics_user
    ON contractor_performance_metrics(contractor_user_id);
