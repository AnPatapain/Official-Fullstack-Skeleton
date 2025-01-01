import { useState } from "react";
import { apiClient } from "../api-client";
import {APIError} from "@app/shared-models/src/error.type.ts";

export const Auth = () => {
    const [isSignup, setIsSignup] = useState(true); // Toggle between Signup and Login
    const [name, setName] = useState(""); // For signup only
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [responseMessage, setResponseMessage] = useState(""); // For displaying token or email preview URL

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isSignup) {
                // Signup logic
                const response = await apiClient.auth.signup({ name, email, password });
                setResponseMessage(
                    `Please verify your email by clicking this link: ${response.mailPreviewUrl}`
                );
            } else {
                // Login logic
                const response = await apiClient.auth.signin({ email, password });
                if (response.mailPreviewUrl) {
                    setResponseMessage(
                        `Please verify your email by clicking this link: ${response.mailPreviewUrl}`
                    );
                } else {
                    setResponseMessage(`Login successful! Your token: ${response.apiAccessToken}`);
                }
            }
        } catch (error) {
            if (error instanceof APIError) {
                setResponseMessage(error.toString());
            } else {
                setResponseMessage("Unknown error");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>{isSignup ? "Signup" : "Login"}</h2>
            <form onSubmit={handleSubmit}>
                {isSignup && (
                    <input
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                )}
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit" disabled={loading} onClick={handleSubmit}>
                    {loading ? (isSignup ? "Signing up..." : "Logging in...") : isSignup ? "Signup" : "Login"}
                </button>
            </form>
            {responseMessage && <p>{responseMessage}</p>}
            <button onClick={() => setIsSignup((prev) => !prev)}>
                {isSignup ? "Switch to Login" : "Switch to Signup"}
            </button>
        </div>
    );
};
