import { createLogger } from "@nexus-core/common";
import type { Logger } from "@nexus-core/common";

export const logger: Logger = createLogger({
    serviceName: "gateway-service"
});