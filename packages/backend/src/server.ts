import express, {json, Request, Response, urlencoded} from "express";
import {RegisterRoutes} from "../tsoa/routes";
import swaggerDocument from "../tsoa/swagger.json" assert {type: "json"};
import swaggerUi from "swagger-ui-express";
import {seed} from "./seed";
import {CONFIG} from "./backend-config";
import {ValidateError} from "tsoa";
import {APIError, APIErrorType} from "@app/shared-models/src/error.type";

const app = express();

// Use body parser to read sent json payloads
app.use(
    urlencoded({
        extended: true,
    })
);
app.use(json());
app.use("/api/docs", swaggerUi.serve, async (_req: Request, res: Response) => {
    return res.send(
        swaggerUi.generateHTML(swaggerDocument)
    );
});
// Register the routes and controller built by Tsoa to application
RegisterRoutes(app);
app.use(function errorHandler(
    err: unknown,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
): express.Response | void {
    if (err instanceof APIError) {
        return res.status(err.httpStatus).send(err.toJSON());
    }
    if (err instanceof ValidateError) {
        console.error(`Caught Validation Error for ${req.path}:`, err.fields);
        return res.status(422).json({
            code: "ERR_VALIDATION",
            message: "Validation error",
        } as APIErrorType);
    }
    if (err instanceof Error) {
        console.error(`Server side error:`, err);
        return res.status(500).json({
            code: "ERR_UNKNOWN",
            message: "Internal Server Error",
        } as APIErrorType);
    }
    next();
});

// Check BackendConfig
console.log("Backend Config::", CONFIG);

// Seed data (only in development environment)
if (CONFIG.NODE_ENV === 'development') {
    await seed();
}

app.listen(8080, () => {
    console.log('Listening on port 8080');
});
