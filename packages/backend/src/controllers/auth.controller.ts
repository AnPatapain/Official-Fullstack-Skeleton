import {Body, Controller, NoSecurity, Post, Res, Route, type TsoaResponse} from "tsoa";
import {type LoginRequest, type UserCreationRequest} from "@app/shared-models/src/api.type";
import {UserRepository} from "../repositories/user.repository";
import {APIErrorType} from "@app/shared-models/src/error.type";
import {generateAndReturnAPIToken, generatePasswordHashed, verifyPassword} from "../services/auth.service";

@Route('/api/auth')
export class AuthController extends Controller {
    private userRepository: UserRepository = UserRepository.getInstance();

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
        });

        return await generateAndReturnAPIToken({
            userId: createdUser.id,
            tokenType: 'api'
        });
    }

    @Post('signin')
    @NoSecurity()
    public async signin(
        @Body() requestBody: LoginRequest,
        @Res() errUserAlreadyExisted: TsoaResponse<401, APIErrorType>
    ) {
        const user = await this.userRepository.findByEmail(requestBody.email);
        if (!user || !verifyPassword(requestBody.password, user.password)) {
            throw errUserAlreadyExisted(401, {
                code: 'ERR_USERNAME_PASSWORD_INVALID'
            });
        }
        return await generateAndReturnAPIToken({
            userId: user.id,
            tokenType: 'api'
        });
    }
}