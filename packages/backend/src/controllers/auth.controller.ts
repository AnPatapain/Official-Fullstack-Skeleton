import {Body, Controller, Get, NoSecurity, Post, Request, Res, Route, type TsoaResponse} from "tsoa";
import {type LoginRequest, type UserCreationRequest} from "@app/shared-models/src/api.type";
import {UserRepository} from "../repositories/user.repository";
import {APIErrorType} from "@app/shared-models/src/error.type";
import {generateAndReturnToken, generatePasswordHashed, verifyPassword, verifyToken} from "../services/auth.service";
import {sendEmail} from "../services/mail.service";
import express from "express";
import {User} from "@app/shared-models/src/user.model";
import {VERIFICATION_EMAIL_TEMPLATE} from "../utils/email-template";
import {CONFIG} from "../backend-config";
import {TokenRepository} from "../repositories/token.repository";

@Route('/api/auth')
export class AuthController extends Controller {
    private userRepository: UserRepository = UserRepository.getInstance();
    private tokenRepository: TokenRepository = TokenRepository.getInstance();

    @Post('signup')
    @NoSecurity()
    public async signup(
        @Body() requestBody: UserCreationRequest,
        @Res() errUserAlreadyExisted: TsoaResponse<409, APIErrorType>
    ) {
        const user = await this.userRepository.findByEmail(requestBody.email);
        if (user) {
            throw errUserAlreadyExisted(409, {
                code: 'ERR_USER_ALREADY_EXISTS'
            })
        }
        const hashedPassword = generatePasswordHashed(requestBody.password);

        const createdUser = await this.userRepository.createOne({
            ...requestBody,
            password: hashedPassword,
            verified: false,
        });

        await this._sendVerificationEmail(createdUser);

        return createdUser;
    }

    @Get('verify/{token}')
    @NoSecurity()
    public async verifyAccount(
        token: string,
        @Request() req: express.Request,
        @Res() errTokenInvalid: TsoaResponse<401, APIErrorType>,
    ) {
        const tokenEntity = await verifyToken(token);
        if (!tokenEntity) {
            throw errTokenInvalid(401, {
                code: 'ERR_TOKEN_INVALID',
            })
        }
        const user = await this.userRepository.findOneById(tokenEntity.userId);
        if (!user) {
            throw errTokenInvalid(401, {
                code: 'ERR_TOKEN_INVALID',
            })
        }
        await this.userRepository.updateOne(user.id, {
            verified: true,
        });

        // Before return API access token, we delete all old tokens (api + verification token) of user
        await this.tokenRepository.deleteMany({userId: user.id});

        // Return API access token after user verification
        return await generateAndReturnToken({
            userId: user.id,
            tokenType: 'api'
        });
    }

    @Post('signin')
    @NoSecurity()
    public async signin(
        @Body() requestBody: LoginRequest,
        @Res() errUserAlreadyExisted: TsoaResponse<401, APIErrorType>,
        @Res() errUserNotVerified: TsoaResponse<401, APIErrorType>
    ) {
        const user = await this.userRepository.findByEmail(requestBody.email);
        if (!user || !verifyPassword(requestBody.password, user.password)) {
            throw errUserAlreadyExisted(401, {
                code: 'ERR_USERNAME_PASSWORD_INVALID'
            });
        }
        if (!user.verified) {
            await this._sendVerificationEmail(user);
            throw errUserNotVerified(401, {
                code: 'ERR_USER_NOT_VERIFIED'
            });
        }
        return await generateAndReturnToken({
            userId: user.id,
            tokenType: 'api'
        });
    }

    ////////////////////
    // Private methods
    private async _sendVerificationEmail(user: User) {
        const verificationToken = await generateAndReturnToken({
            tokenType: 'account_verification',
            userId: user.id,
        });

        sendEmail(
            user.email,
            'Verify account',
            `Click this link to verify account: ${CONFIG.PUBLIC_URL + '/api/auth/verify/' + verificationToken}`,
            VERIFICATION_EMAIL_TEMPLATE(verificationToken)
        );
    }
}