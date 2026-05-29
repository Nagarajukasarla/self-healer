import type { FastifyInstance, FastifyPluginAsync } from "fastify";

export const testRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
    // POST /run-tests

    // This will called from CI/CD pipeline 
    fastify.post("/run-tests", async (request, reply) => {
        // Using this method you will be calling the test runner, so that test runner will execute the test.
        return reply.send({
            success: true,
            message: "Test runner execution placeholder (POST)"
        });
    });

    // GET /run-tests
    fastify.get("/run-tests", async (request, reply) => {
        // Using this method you will be calling the test runner, so that test runner will execute the test.
        return reply.send({
            success: true,
            message: "Test runner execution placeholder (GET)"
        });
    });
};
