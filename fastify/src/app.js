import Fastify from "fastify";
import cors from "./plugins/cors.js";
import routes from "./routes/checkout.routes.js";
import { httpRequestDuration, register } from "./metrics.js";

const app = Fastify({
  logger: true
});

await app.register(cors);

app.addHook("onResponse", async (request, reply) => {
  const diff = process.hrtime(request.startTime);
  const duration = diff[0] + diff[1] / 1e9;

  httpRequestDuration
    .labels(
      request.method,
      request.routerPath || request.url,
      reply.statusCode
    )
    .observe(duration);
});

app.get("/metrics", async (request, reply) => {
  reply.header("Content-Type", register.contentType);
  return register.metrics();
});


await app.register(routes, { prefix: "/checkout" });

export default app;