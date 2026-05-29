import Fastify from "fastify";
import { testRoutes } from "./api/routes/test.routes.js";

const app = Fastify({ logger: true });

// Register the test routes plugin
app.register(testRoutes);

const PORT = Number(process.env.PORT || 3000);
const HOST = "0.0.0.0";

app.listen({ port: PORT, host: HOST }, (err, address) => {
    if (err) {
        app.log.error(err);
        process.exit(1);
    }
    console.log(`\nHealer Automator Service running at: ${address}\n`);
});
