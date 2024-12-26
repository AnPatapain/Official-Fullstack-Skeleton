type APIErrorCode =
    | 'ERR_UNKNOWN'
    | 'ERR_TOKEN_MISSING_IN_HEADER'
    | 'ERR_TOKEN_INVALID'
    | 'ERR_TOKEN_SUBJECT_INVALID'
    | 'ERR_PERMISSION_DENIED'
    | 'ERR_VALIDATION'
    | 'ERR_USER_ALREADY_EXISTS'
    | 'ERR_USERNAME_PASSWORD_INVALID'

export type APIErrorType = {
    code: APIErrorCode,
    message?: string,
}

export class APIError extends Error {
    httpStatus: number;
    code: APIErrorCode;
    errMessage?: string;

    constructor(httpStatus: number, code: APIErrorCode, errMessage?: string) {
        super();
        this.httpStatus = httpStatus;
        this.code = code;
        this.errMessage = errMessage;
    }

    toJSON(): APIErrorType {
        const errJson: APIErrorType = {
            code: this.code,
        }
        if (this.errMessage) {
            errJson.message = this.errMessage;
        }
        return errJson;
    }
}