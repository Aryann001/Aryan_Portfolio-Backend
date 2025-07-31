import express from "express";
import cors from "cors";
import errorMiddleware from "./middlewares/error.js";
import cookieParser from "cookie-parser";

const app = express();

// Middleware
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ limit: "16kb", extended: true }));
app.use(cors());
app.use(cookieParser());

// Routers
import userRouter from "./routes/user.route.js";
import projectRouter from "./routes/project.route.js";

app.use("/api/v1", userRouter);
app.use("/api/v1", projectRouter);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy.",
  });
});

// Error Middleware
app.use(errorMiddleware);

export default app;
