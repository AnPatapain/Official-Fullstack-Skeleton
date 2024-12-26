import {User} from "@app/shared-models/src/user.model";
import {SecurityScope} from "../../src/security/scopes";

declare global {
    namespace Express {
        interface Request {
            securityContext?: {
                user: User,
                scopes: Set<SecurityScope>,
            }
        }
    }
}