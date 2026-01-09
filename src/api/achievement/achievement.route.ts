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
import { requirePermission } from "../../middleware/permission.middleware";
import { EPermission } from "../users/permisssion";

const achievementRoute: Router = express();
achievementRoute.get("/", getAll);
achievementRoute.get("/get", [verifyJwt,requirePermission(EPermission.ACHIEVEMENT)], getachievement);
achievementRoute.post("/", [verifyJwt,requirePermission(EPermission.ACHIEVEMENT) ], create);
achievementRoute.delete("/:id", [verifyJwt, requirePermission(EPermission.ACHIEVEMENT),adminMiddleware], deleteachievement);
achievementRoute.put("/:id", [verifyJwt,requirePermission(EPermission.ACHIEVEMENT)], edit);

export default achievementRoute;
