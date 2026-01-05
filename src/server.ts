import express, { Express } from "express";
import cors, { CorsOptions } from "cors";
import { PrismaClient } from "@prisma/client";
import rootRouter from "./routes/index.routes";
import cookieParser from "cookie-parser";
import path from "path";
import { errorMiddleware } from "./middleware/error.middleware";
import { notFound } from "./utils/notFound";
import { NODE_ENV } from "./secrets";
import helmet from "helmet";

const app: Express = express();

const corsOptions: CorsOptions = {
  origin: [
    "http://localhost:5173",
    "https://new.lbef.org",

  ],
  credentials: true,
};
const prismaClient = new PrismaClient({
  log: NODE_ENV === "development" ? ["query"] : []
})

export { prismaClient };
if (NODE_ENV === "production") {
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );


}
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use("/public", express.static(path.join(__dirname, "../public")));


app.use("/api", rootRouter);   
app.get("/", (req, res) => {
  res.send("API is running");
});
app.use(notFound);

app.use(errorMiddleware);

export { app };
