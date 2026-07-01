import "dotenv/config";
import cors from "cors";
import express from "express";
import { errorMiddleware } from "@packages/error-handler/error-middleware";
import cookieParser from "cookie-parser";
import router from "./routes/auth.router";
import swaggerUI from "swagger-ui-express";
const swaggerDocument = require("./swagger-output.json");

const app = express();
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:6001"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());
app.use(cookieParser());
app.get("/", (req, res) => {
  res.send({ message: "Hello API" });
});
app.use("/api-docs", swaggerUI.serve,swaggerUI.setup(swaggerDocument));
app.get("/docs-json", (req, res) => {
  res.json(swaggerDocument);
});

app.use('/api',router);
app.use(errorMiddleware);

const port = process.env.PORT || 6001;
const server = app.listen(port, () => {
  console.log(`Auth service is running at http://localhost:${port}/api`);
  console.log(`Swagger docs available at http://localhost:${port}/docs`);
});

server.on("error", (err) => {
  console.log("console error:", err);
  
});
