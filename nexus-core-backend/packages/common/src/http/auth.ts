export const USER_ID_HEADER = 'x-user-id';

export interface AuthenticatedUser {
    id: string;
    email: string;
}