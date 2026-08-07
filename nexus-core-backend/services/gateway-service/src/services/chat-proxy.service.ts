import { env } from "@/config/env.js";
import { HttpError, USER_ID_HEADER } from "@nexus-core/common";
import axios from "axios";


const chatClient = axios.create({
    baseURL: env.CHAT_SERVICE_URL, timeout: 5000
});

export const chatProxyService = {
    async 
}