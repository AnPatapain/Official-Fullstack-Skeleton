import {User} from "@app/shared-models/src/user.model.ts";
import {APIError} from "@app/shared-models/src/error.type.ts";

export const apiClient = {
    user: {
        getAll: (token: string): Promise<Array<User>> => sendRequest('GET', 'api/users', undefined, token),
    },
    auth: {
        signup: (data: { name: string; email: string; password: string }) =>
            sendRequest("POST", "api/auth/signup", data),
        signin: (data: { email: string; password: string }) =>
            sendRequest("POST", "api/auth/signin", data),
    },
}

async function sendRequest(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    endpoint: string,
    body?: any,
    token?: string): Promise<any> {
    const options: any = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': token ? token : '',
        }
    }
    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
        options.body = JSON.stringify(body);
    }
    const response = await fetch(endpoint, options);
    if (!response.ok) {
        // Throw an error with the status and status text
        const errorData = await response.json(); // Optionally parse the response body

        throw new APIError(
            response.status,
            errorData.code,
            errorData.message,
        );
    }

    return await response.json();
}