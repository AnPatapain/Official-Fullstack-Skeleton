import {Token, TokenCreationData, TokenType} from "@app/shared-models/src/token.model";
import {PRISMA_CLIENT} from "../../prisma";

export class TokenRepository {
    private static instance: TokenRepository | null = null;

    private constructor() {}

    public static getInstance(): TokenRepository {
        if (!TokenRepository.instance) {
            TokenRepository.instance = new TokenRepository();
        }
        return TokenRepository.instance;
    }

    public async findOneByHash(hash: string): Promise<Token | null> {
        const token = await PRISMA_CLIENT.token.findUnique({
            where: {
                hash: hash
            }
        });
        return token ? {
            ...token,
            tokenType: token.tokenType as TokenType
        } : null;
    }

    public async createOne(tokenCreationData: Omit<Token, 'id'>): Promise<Token> {
        const createdToken = await PRISMA_CLIENT.token.create({
            data: {
                hash: tokenCreationData.hash,
                tokenType: tokenCreationData.tokenType,
                userId: tokenCreationData.userId,
                createdAt: tokenCreationData.createdAt,
                expiredAt: tokenCreationData.expiredAt,
            }
        });
        return {
            ...createdToken,
            tokenType: createdToken.tokenType as TokenType,
        }
    }
}