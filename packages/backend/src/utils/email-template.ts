import {CONFIG} from "../backend-config";
import {base64Logo} from "./base64Logo";

export const VERIFICATION_EMAIL_TEMPLATE = (token: string) => {
    return `
        <img alt='logo' width="50" src=${base64Logo} style="border-radius: 5%"/>
        
        <br/>
        
        <h3>Verify your email</h3>
        <p>Click the button below to verify your account. This button will expire in 1 hour</p>
        <a href=${CONFIG.PUBLIC_URL + '/api/auth/verify/' + token}><button>Verify</button></a>
        <p>
            Ofs team,
            <br/>
            Thank you
        </p>
    `
};