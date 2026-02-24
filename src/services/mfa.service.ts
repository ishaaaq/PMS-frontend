import { supabase } from '../lib/supabase';

export const MfaService = {
    /**
     * Start enrollment process. Returns the QR code SVG and factor ID.
     */
    async enroll() {
        const { data, error } = await supabase.auth.mfa.enroll({
            factorType: 'totp',
            issuer: 'PTDF PMS',
            friendlyName: 'Authenticator App'
        });
        if (error) throw error;
        return {
            factorId: data.id,
            qrCodeSvg: data.totp.qr_code,
            secret: data.totp.secret,
            uri: data.totp.uri
        };
    },

    /**
     * Complete enrollment by verifying the first 6-digit code.
     */
    async verifyEnrollment(factorId: string, code: string) {
        const challengeRes = await supabase.auth.mfa.challenge({ factorId });
        if (challengeRes.error) throw challengeRes.error;

        const { data, error } = await supabase.auth.mfa.verify({
            factorId,
            challengeId: challengeRes.data.id,
            code
        });
        if (error) throw error;
        return data;
    },

    /**
     * Complete a sign-in challenge.
     */
    async verifyChallenge(factorId: string, code: string) {
        const challengeRes = await supabase.auth.mfa.challenge({ factorId });
        if (challengeRes.error) throw challengeRes.error;

        const { data, error } = await supabase.auth.mfa.verify({
            factorId,
            challengeId: challengeRes.data.id,
            code
        });
        if (error) throw error;
        return data;
    },

    /**
     * Unenroll a factor.
     */
    async unenroll(factorId: string) {
        const { data, error } = await supabase.auth.mfa.unenroll({ factorId });
        if (error) throw error;
        return data;
    },

    /**
     * Check current authentication assurance level and enrolled factors.
     */
    async getStatus() {
        const { data: aalData, error: aalErr } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (aalErr) throw aalErr;

        const { data: factorsData, error: factorsErr } = await supabase.auth.mfa.listFactors();
        if (factorsErr) throw factorsErr;

        const totpFactors = factorsData?.totp || [];
        const verifiedFactors = totpFactors.filter(f => f.status === 'verified');

        return {
            currentLevel: aalData.currentLevel,
            nextLevel: aalData.nextLevel,
            hasFactors: verifiedFactors.length > 0,
            verifiedFactors
        };
    }
};
