import {User} from "./user.model";

export type UserCreationRequest = Omit<User, 'id' | 'role'>;
export type LoginRequest = Pick<User, 'email' | 'password'>;