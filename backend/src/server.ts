import cookieParser from "cookie-parser";
import cors from "cors";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { config } from "./lib/env.js";
import { apiRouter } from "./routes/api.js";
import { authRouter } from "./routes/auth.js";

const app = express();

// CORS: tells the BROWSER which website may call this API.
app.use(cors({ origin: config.clientOrigin, credentials: true }));

app.use(express.json());
app.use(cookieParser());

// Log every request: method, path, status and time. Handy while debugging.
app.use((req, res, next) => {
  const start = performance.now();
  res.on("finish", () => {
    const ms = (performance.now() - start).toFixed(1);
    console.log(
      `${req.method} ${req.originalUrl} → ${res.statusCode} (${ms} ms)`,
    );
  });
  next();
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRouter);
app.use("/api", apiRouter);

// No route matched → 404
app.use((_req, res) => {
  res
    .status(404)
    .json({ error: "not_found", message: "This endpoint does not exist." });
});

// Any thrown error ends up here → 500 (the real error stays in the server log, not in the response)
app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(error);
  res.status(500).json({
    error: "server_error",
    message: "Something went wrong on the server.",
  });
});

app.listen(config.port, () => {
  console.log(`API running on http://localhost:${config.port}`);
  console.log(`CORS allows: ${config.clientOrigin}`);
});
