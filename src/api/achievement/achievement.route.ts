import express, { Router } from "express";
import {
  getAll,
  create,
  edit,
  getachievement,
  deleteachievement,
} from "./achievement.controller";
import verifyJwt from "../../middleware/auth.middleware";
import adminMiddleware from "../../middleware/admin.middleware";

const achievementRoute: Router = express();
achievementRoute.get("/", getAll);
achievementRoute.get("/get", [verifyJwt], getachievement);
achievementRoute.post("/", [verifyJwt, ], create);
achievementRoute.delete("/:id", [verifyJwt, adminMiddleware], deleteachievement);
achievementRoute.put("/:id", [verifyJwt], edit);

export default achievementRoute;
