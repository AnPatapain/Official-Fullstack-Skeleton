export interface User {
    id: number;
    email: string;
    password: string;
    name: string;
    role: UserRole;
    verified: boolean;
}

export type UserRole = 'user' | 'admin';