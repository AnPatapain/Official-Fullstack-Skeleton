import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import {TokenCreationData, TokenType} from "@app/shared-models/src/token.model";
import {TokenRepository} from "../repositories/token.repository";
import {DAY_MS, HOUR_MS, MINUTE_MS} from "@app/shared-utils/src/daytime-utils";
import {CONFIG} from "../backend-config";

const API_TOKEN_DURATION = 10 * DAY_MS;
const VERIFICATION_TOKEN_DURATION = HOUR_MS;

function getTokenDuration(tokenType: TokenType): number {
    if (tokenType === 'api') {
        return API_TOKEN_DURATION;
    } else if (tokenType === 'account_verification') {
        return VERIFICATION_TOKEN_DURATION;
    } else {
        return API_TOKEN_DURATION;
    }
}

export function generatePasswordHashed(password: string): string {
    return bcrypt.hashSync(password, bcrypt.genSaltSync());
}

export function verifyPassword(password: string, hashedPassword: string): boolean {
    return bcrypt.compareSync(password, hashedPassword);
}

export async function generateAndReturnToken(tokenCreationData: TokenCreationData): Promise<string> {
    const rawToken = "sk_" + crypto.randomUUID().toString();
    /**
     * Token is sensitive data => irreversibly hash it and store in database
     * The reason why hmac is used instead of bcrypt is that hmac is deterministic hash algorithm.
     * As we will return raw token to user, at verification step raw token provided by user will be
     * hashed and used to look up in database to find the token entity. The bcrypt algo can not be
     * used because two identical input can have two different output (salt effect).
     */
    const hashedToken = crypto.createHmac('sha256', CONFIG.HMAC_SECRET as string)
        .update(rawToken)
        .digest('hex');

    const tokenRepo = TokenRepository.getInstance();
    await tokenRepo.createOne({
        hash: hashedToken,
        userId: tokenCreationData.userId,
        tokenType: tokenCreationData.tokenType,
        createdAt: new Date(),
        expiredAt: new Date(new Date().getTime() + getTokenDuration(tokenCreationData.tokenType)),
    })
    return rawToken;
}

export async function verifyToken(rawToken: string) {
    const hashedToken = crypto.createHmac('sha256', CONFIG.HMAC_SECRET as string)
        .update(rawToken)
        .digest('hex');
    const tokenRepo = TokenRepository.getInstance();

    const token = await tokenRepo.findOneByHash(hashedToken);

    if (token) {
        // It's up to you what to do with the expired token. Delete them using cronjob may be?
        if (token.expiredAt.getTime() <= new Date().getTime()) {
            return null;
        }
        return token;
    }
    return null;
}