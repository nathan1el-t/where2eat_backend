import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { swaggerUi, swaggerSpec } from "./swagger.js";
import router from "./routes.js";
import { errorHandler } from "./common/middlewares/errorHandler.js";

const app = express();
const allowedOrigins = ["http://localhost:4173", "http://localhost:5173"];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
};
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan("dev"));

app.use("/api", router);

app.use(errorHandler);

export default app;
