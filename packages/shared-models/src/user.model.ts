export interface User {
    id: number;
    email: string;
    password: string;
    name: string;
    role: UserRole;
}

export type UserRole = 'user' | 'admin';