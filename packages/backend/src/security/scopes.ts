import {UserRole} from "@app/shared-models/src/user.model";
import {Token} from "@app/shared-models/src/token.model";

export type SecurityScope =
    | 'user.read'           // read all users
    | 'user.write'          // write all users
    | 'user:current.read'   // read current user
    | 'user:current.write'  // write current user
    | 'token:current.read'  // read all token belong to you
    | 'token:current.write' // write all token belong to you

export const USER_SCOPES: Set<SecurityScope> = new Set<SecurityScope>([
    'user:current.read',
    'user:current.write',
    'token:current.read',
    'token:current.write',
]);

export const ADMIN_SCOPES: Set<SecurityScope> = new Set<SecurityScope>([
    ...USER_SCOPES,
    'user.read',
    'user.write',
]);

export function getScopesBasedOnUserRoleOrTokenType(userRole: UserRole, token: Token) {
    if (userRole === 'user') {
        return USER_SCOPES;
    } else if (userRole === 'admin') {
        return ADMIN_SCOPES;
    } else {
        return USER_SCOPES;
    }
}