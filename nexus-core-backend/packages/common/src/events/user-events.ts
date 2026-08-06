export const USER_REGISTERED_ROUTING_KEY = "user.registered";

export interface UserRegisteredEvent {
    userId: string;
    email: string;
    registeredAt: string;
}