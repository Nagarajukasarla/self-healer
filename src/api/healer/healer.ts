import { HealingRequest, HealingResponse } from "@/types/healer";
import { env } from "@/config/env";
import { logger } from "@/utils/logger";


export async function heal(request: HealingRequest): Promise<HealingResponse> {
    try {
        logger.info(`calling healer at ${env.HEALER_AI_SERVICE_URL}`);

        const response = await fetch(`${env.HEALER_AI_SERVICE_URL}/heal`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            throw new Error("Failed to heal locator");
        }

        return await response.json();
    } catch (error) {
        console.error("Error healing locator:", error);
        throw error;
    }
}