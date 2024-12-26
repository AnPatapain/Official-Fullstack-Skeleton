import express from "express";
import {getScopesBasedOnUserRoleOrTokenType, SecurityScope} from "./scopes";
import {APIError} from "@app/shared-models/src/error.type";
import {verifyToken} from "../services/auth.service";
import {UserRepository} from "../repositories/user.repository";
import {User} from "@app/shared-models/src/user.model";

export async function expressAuthentication(
    req: express.Request,
    securityName: string,
    scopes: string[]
): Promise<any> {
    // securityName 'token' were configured in tsoa.json file.
    if (securityName === 'token') {
        const rawToken = req.headers['x-access-token'];
        if (!rawToken || typeof rawToken !== 'string') {
            throw new APIError(403, 'ERR_TOKEN_MISSING_IN_HEADER');
        }

        const token = await verifyToken(rawToken);
        if (!token) {
            throw new APIError(403, 'ERR_TOKEN_INVALID');
        }

        const userRepository = UserRepository.getInstance();
        const user = await userRepository.findOneById(token.userId);
        if (!user) {
            throw new APIError(403, 'ERR_TOKEN_SUBJECT_INVALID');
        }

        const userScopes = getScopesBasedOnUserRoleOrTokenType(user.role, token);
        for (let requiredScope of scopes as SecurityScope[]) {
            if (!userScopes.has(requiredScope)) {
                throw new APIError(403, 'ERR_PERMISSION_DENIED');
            }
        }

        req.securityContext = {
            user: user,
            scopes: userScopes,
        };
    } else {
        console.error("Unknown security method");
    }
}

/**
 * Get current user who performs the request
 */
export function getCurrentUser(req: express.Request): User {
    if (req.securityContext) {
        return req.securityContext.user;
    }
    throw new APIError(403, 'ERR_SECURITY_CONTEXT_NOT_SET');
}

