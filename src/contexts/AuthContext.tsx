import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

export type UserRole = 'ADMIN' | 'CONSULTANT' | 'CONTRACTOR';

export interface AppUser {
    id: string;
    email: string;
    full_name: string;
    role: UserRole;
}

export interface AuthContextType {
    user: AppUser | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    isLoading: boolean;
    profileError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AppUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [profileError, setProfileError] = useState<string | null>(null);

    const fetchProfile = useCallback(async (session: Session) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('user_id, role, full_name')
            .eq('user_id', session.user.id)
            .single();

        if (error || !data) {
            setUser(null);
            setProfileError('Account not provisioned. Contact Admin.');
            return;
        }

        setProfileError(null);
        setUser({
            id: data.user_id,
            email: session.user.email ?? '',
            full_name: data.full_name,
            role: data.role as UserRole,
        });
    }, []);

    useEffect(() => {
        // 1. Check existing session on mount
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                fetchProfile(session).finally(() => setIsLoading(false));
            } else {
                setIsLoading(false);
            }
        });

        // 2. Listen for auth state changes (login, logout, token refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                if (session) {
                    fetchProfile(session).finally(() => setIsLoading(false));
                } else {
                    setUser(null);
                    setProfileError(null);
                    setIsLoading(false);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, [fetchProfile]);

    const login = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // onAuthStateChange will handle profile fetch
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setProfileError(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading, profileError }}>
            {children}
        </AuthContext.Provider>
    );
}
