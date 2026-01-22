
import { create } from 'zustand';

export type UserRole = 'ADMIN' | 'CONSULTANT' | 'CONTRACTOR';

interface RoleState {
    currentRole: UserRole;
    setRole: (role: UserRole) => void;
}

export const useRoleStore = create<RoleState>((set) => ({
    currentRole: 'ADMIN', // Default to Admin
    setRole: (role) => set({ currentRole: role }),
}));
