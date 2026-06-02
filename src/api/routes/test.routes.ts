import type {
    FastifyInstance,
    FastifyPluginAsync,
    FastifyRequest,
    FastifyReply
} from "fastify";

import { spawn } from "child_process";

import { clearTestResults, getTestResults } from "@/utils/test-results.js";

interface RunTestsRequestBody {
    targetUrl: string;
}

const executeTests = (targetUrl: string): Promise<void> => {

    return new Promise((resolve) => {

        const child = spawn(
            "pnpm",
            ["test"],
            {
                stdio: "inherit",
                shell: true,
                env: {
                    ...process.env,
                    TARGET_URL: targetUrl,
                },
            }
        );

        child.on("close", () => {
            resolve();
        });

        child.on("error", (error) => {
            console.error("Test execution process error:", error);
            resolve();
        });
    });
};

export const testRoutes: FastifyPluginAsync = async (
    fastify: FastifyInstance
) => {

    const handleRunTests = async (
        request: FastifyRequest<{
            Body: RunTestsRequestBody;
        }>,
        reply: FastifyReply
    ) => {

        const { targetUrl } = request.body;

        if (!targetUrl) {
            return reply.status(400).send({
                success: false,
                message: "targetUrl is required",
            });
        }

        console.log("Running healer tests against:", targetUrl);

        clearTestResults();

        await executeTests(targetUrl);

        const results = getTestResults();

        if (!results) {
            return reply.status(500).send({
                success: false,
                message: "No test results generated",
            });
        }

        return reply.send({
            success: results.status === "passed",
            targetUrl,
            results,
        });
    };

    const handleHealthCheck = async (
        request: FastifyRequest,
        reply: FastifyReply
    ) => {

        return reply.status(200).send({
            status: "ok",
        });
    };

    // Health check endpoints
    fastify.get("/", handleHealthCheck);

    fastify.get("/health", handleHealthCheck);

    // Trigger healer tests
    fastify.post("/run-tests", handleRunTests);
};

