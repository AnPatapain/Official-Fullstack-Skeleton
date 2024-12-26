export interface Token {
    id: number;
    hash: string;
    tokenType: TokenType;
    userId: number;
    createdAt: Date;
    expiredAt: Date;
}

export type TokenCreationData = Omit<Token, 'id' | 'hash' | 'createdAt' | 'expiredAt'>;

export type TokenType = 'api' | 'account_verification';