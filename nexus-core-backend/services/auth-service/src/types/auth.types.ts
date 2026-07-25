export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface AuthUserPayload {
    id: string;
    email: string;
    createdAt: string;
}

export interface AuthResponse extends AuthTokens {
    user: AuthUserPayload;
}