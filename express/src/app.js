import express from "express";
import cors from "cors";
import checkoutRoutes from "./routes/checkout.route.js";
import { httpRequestDuration, register } from "./metrics.js";

const app = express();

app.use(cors());

app.use(express.json({
  limit: "1mb"
}));

app.use((req, res, next) => {
  const start = process.hrtime();

  res.on("finish", () => {
    const diff = process.hrtime(start);
    const duration = diff[0] + diff[1] / 1e9;

    httpRequestDuration
      .labels(req.method, req.baseUrl + req.path, res.statusCode)
      .observe(duration);
  });

  next();
});

app.use("/checkout", checkoutRoutes);

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

export default app;