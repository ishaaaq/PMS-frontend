import { createContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';
import { MfaService } from '../services/mfa.service';

// Temporarily forced to true to debug SSO Vercel issues
const DEBUG_AUTH = true;
const log = (...args: unknown[]) => { if (DEBUG_AUTH) console.log('[Auth]', new Date().toISOString(), ...args); };

export type UserRole = 'ADMIN' | 'CONSULTANT' | 'CONTRACTOR';

export interface AppUser {
    id: string;
    email: string;
    full_name: string;
    role: UserRole; // Their primary registered role
    activeRole: UserRole; // The role they are currently viewing the app as
    availableRoles: UserRole[]; // All roles they have access to
    phone?: string;
}

export type MfaStatus = {
    currentLevel: string | null;
    nextLevel: string | null;
    hasFactors: boolean;
    verifiedFactors: Array<{ id: string;[key: string]: unknown }>;
};

export interface AuthContextType {
    user: AppUser | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    isLoading: boolean;
    profileError: string | null;
    mfaStatus: MfaStatus | null;
    refreshMfa: () => Promise<void>;
    switchRole: (role: UserRole) => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AppUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [profileError, setProfileError] = useState<string | null>(null);
    const [mfaStatus, setMfaStatus] = useState<MfaStatus | null>(null);
    const mountedRef = useRef(true);

    // -----------------------------------------------------------------------
    // Core: given a valid session, fetch MFA level + profile if AAL2.
    // This must NEVER be called while holding a Supabase internal lock.
    // -----------------------------------------------------------------------
    const checkMfaAndProfile = useCallback(async (session: Session) => {
        log('checkMfaAndProfile start, uid=', session.user.id);
        try {
            log('→ calling MfaService.getStatus()...');
            const status = await MfaService.getStatus();
            log('← MfaService.getStatus() done, currentLevel=', status.currentLevel);

            if (!mountedRef.current) return;
            setMfaStatus(status);

            // Check if the session was authenticated via SSO Magic Link
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let amr = (session.user as any).amr || [];

            // DIAGNOSTICS: Decode JWT directly to see what Supabase actually put in the amr claim
            let rawAmr = null;
            try {
                const parts = session.access_token.split('.');
                if (parts.length === 3) {
                    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
                    const payload = JSON.parse(atob(base64));
                    rawAmr = payload.amr;
                    if (rawAmr && amr.length === 0) amr = rawAmr;
                }
            } catch (e) {
                console.error("JWT Decode error: ", e);
            }

            console.warn("====== DIAGNOSTICS: MFA BYPASS CHECK ======");
            console.warn("session.user.amr: ", (session.user as any).amr);
            console.warn("Raw JWT Payload AMR Claim: ", rawAmr);
            console.warn("Session provider: ", session.user.app_metadata?.provider);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const isMagicLink = amr.some((a: any) =>
                ['magiclink', 'otp', 'sso', 'recovery'].includes(a.method)
            );

            console.warn("isMagicLink Evaluated to: ", isMagicLink);
            console.warn("MFA Status Evaluated to: ", status.currentLevel);
            console.warn("===========================================");

            if (status.currentLevel !== 'aal2' && !isMagicLink) {
                log('Not AAL2 and not SSO – skipping profile fetch');
                setUser(null);
                setProfileError(null);
                return;
            }

            log('→ fetching profile...');
            const { data, error } = await supabase
                .from('profiles')
                .select('user_id, role, full_name')
                .eq('user_id', session.user.id)
                .single();

            log('← profile fetch done, error=', error, 'data=', data);
            if (!mountedRef.current) return;

            if (error || !data) {
                setUser(null);
                setProfileError('Account not provisioned. Contact Admin.');
                return;
            }

            // --- Multi-Role Computation ---
            const roles: Set<UserRole> = new Set([data.role as UserRole]);

            // Check if they are a consultant
            if (data.role !== 'CONSULTANT') {
                const { data: cData } = await supabase.from('project_consultants').select('project_id').eq('consultant_user_id', session.user.id).limit(1);
                if (cData && cData.length > 0) roles.add('CONSULTANT');
            }

            // Check if they are a contractor
            if (data.role !== 'CONTRACTOR') {
                const { data: ctData } = await supabase.from('project_contractors').select('project_id').eq('contractor_user_id', session.user.id).limit(1);
                if (ctData && ctData.length > 0) roles.add('CONTRACTOR');

                const { data: saData } = await supabase.from('section_assignments').select('section_id').eq('contractor_user_id', session.user.id).limit(1);
                if (saData && saData.length > 0) roles.add('CONTRACTOR');
            }

            // If they are admin, they get everything mostly anyway, but we keep it clean.

            const availableRoles = Array.from(roles);

            // Determine active role based on saved preference or fallback to primary
            const savedRole = localStorage.getItem('promos_active_role') as UserRole;
            const activeRole = availableRoles.includes(savedRole) ? savedRole : (data.role as UserRole);

            setProfileError(null);
            setUser({
                id: data.user_id,
                email: session.user.email ?? '',
                full_name: data.full_name,
                role: data.role as UserRole,
                activeRole,
                availableRoles
            });
            log('✓ User set:', data.role, 'Available:', availableRoles, 'Active:', activeRole);
        } catch (err) {
            log('✗ checkMfaAndProfile error:', err);
            if (!mountedRef.current) return;
            setUser(null);
            setMfaStatus(null);
        }
    }, []);

    useEffect(() => {
        mountedRef.current = true;

        // 1. Initial session check
        log('useEffect: calling getSession()');
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            log('getSession result: session=', !!session);
            if (!mountedRef.current) return;
            if (session) {
                await checkMfaAndProfile(session);
            } else {
                setMfaStatus(null);
                setUser(null);
            }
            if (mountedRef.current) setIsLoading(false);
        });

        // 2. Auth state change listener.
        //    CRITICAL: The callback must return synchronously. Any async work
        //    that calls Supabase auth APIs (like listFactors) MUST be deferred
        //    with setTimeout(0) to run AFTER the current Supabase call stack
        //    completes and releases its internal lock.
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            log('onAuthStateChange: event=', event, 'session=', !!session);

            if (!mountedRef.current) return;

            if (!session) {
                setUser(null);
                setMfaStatus(null);
                setProfileError(null);
                setIsLoading(false);
                return;
            }

            // Defer the MFA check entirely outside this call stack using
            // setTimeout(0). This guarantees we don't call listFactors()
            // or any other Supabase API while signInWithPassword (or any
            // upstream caller) still holds an internal session lock.
            const capturedSession = session;
            setTimeout(() => {
                if (!mountedRef.current) return;
                void checkMfaAndProfile(capturedSession).finally(() => {
                    if (mountedRef.current) setIsLoading(false);
                });
            }, 0);
        });

        return () => {
            mountedRef.current = false;
            subscription.unsubscribe();
        };
    }, [checkMfaAndProfile]);

    // -----------------------------------------------------------------------
    // login: signs in via Supabase, then uses the returned session directly
    // (no extra getSession call needed) to immediately load MFA status.
    // -----------------------------------------------------------------------
    const login = async (email: string, password: string) => {
        log('login: start, email=', email);
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        log('login: signInWithPassword returned, error=', error?.message, 'session=', !!data.session);
        if (error) throw error;
        if (data.session) {
            // checkMfaAndProfile is safe here because we are NOT inside any
            // Supabase lock — signInWithPassword has already fully resolved.
            await checkMfaAndProfile(data.session);
        }
        log('login: done');
    };

    // -----------------------------------------------------------------------
    // logout: explicit cleanup, no listener dependency needed.
    // -----------------------------------------------------------------------
    const logout = async () => {
        log('logout: start');
        try {
            await supabase.auth.signOut();
        } catch (err) {
            log('logout: error (non-fatal)', err);
        } finally {
            setUser(null);
            setMfaStatus(null);
            setProfileError(null);
            setIsLoading(false);
            log('logout: state cleared');
        }
    };

    // -----------------------------------------------------------------------
    // refreshMfa: called after TOTP setup/challenge to re-check AAL level.
    // -----------------------------------------------------------------------
    const refreshMfa = async () => {
        log('refreshMfa: start');
        try {
            const { data: { session } } = await supabase.auth.getSession();
            log('refreshMfa: session=', !!session);
            if (session) await checkMfaAndProfile(session);
        } catch (err) {
            log('refreshMfa: error', err);
        }
        log('refreshMfa: done');
    };

    // -----------------------------------------------------------------------
    // switchRole: updates the active role in state and storage
    // -----------------------------------------------------------------------
    const switchRole = useCallback((newRole: UserRole) => {
        if (!user || !user.availableRoles.includes(newRole)) return;
        localStorage.setItem('promos_active_role', newRole);
        setUser({ ...user, activeRole: newRole });
        log('switchRole:', newRole);
    }, [user]);

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading, profileError, mfaStatus, refreshMfa, switchRole }}>
            {children}
        </AuthContext.Provider>
    );
}
