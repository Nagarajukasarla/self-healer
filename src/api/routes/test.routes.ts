import type { FastifyInstance, FastifyPluginAsync, FastifyRequest, FastifyReply } from "fastify";
import { spawn } from "child_process";
import { clearTestResults, getTestResults } from "@/utils/test-results.js";

const executeTests = (): Promise<void> => {
    return new Promise((resolve) => {
        const child = spawn("pnpm", ["test"], {
            stdio: "inherit",
            shell: true,
        });

        child.on("close", () => {
            resolve();
        });

        child.on("error", (error) => {
            console.error("Test execution process error:", error);
            resolve();
        });
    });
};

export const testRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
    
    const handleRunTests = async (request: FastifyRequest, reply: FastifyReply) => {
        clearTestResults();
        await executeTests();
        const results = getTestResults();

        if (!results) {
            return reply.status(500).send({
                success: false,
                message: "No test results generated"
            });
        }

        return reply.send({
            success: results.status === "passed",
            results
        });
    };

    // POST /run-tests
    // This will be called from CI/CD pipeline 
    fastify.post("/run-tests", handleRunTests);

    // GET /run-tests
    fastify.get("/run-tests", handleRunTests);
};
