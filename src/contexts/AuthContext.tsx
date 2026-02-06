
import { createContext, useState, type ReactNode } from 'react';
import type { UserRole } from '../services/mockRole';

interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, role: UserRole) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Export the context so the hook file can use it
export { AuthContext };

export function AuthProvider({ children }: { children: ReactNode }) {
    // Use lazy initialization to hydrate user from localStorage, avoiding setState in effect
    const [user, setUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem('pms_user');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [isLoading] = useState(false);

    const login = async (email: string, role: UserRole) => {
        // Mock login - in a real app, this would call the API
        const mockUser: User = {
            id: 'u1',
            email,
            name: email.split('@')[0].split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
            role: role
        };

        setUser(mockUser);
        localStorage.setItem('pms_user', JSON.stringify(mockUser));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('pms_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}
