import express, { Router } from "express";

import verifyJwt from "../../middleware/auth.middleware";
import { addIntake, deleteIntake, editIntake, getIntake } from "./intake.controller";
import { de } from "zod/v4/locales";
import { requirePermission } from "../../middleware/permission.middleware";
import { EPermission } from "../users/permisssion";

const intakeRoute: Router = express();
intakeRoute.get("/",  getIntake);
intakeRoute.post("/", [verifyJwt,requirePermission(EPermission.INTAKE)], addIntake);
intakeRoute.put("/:id", [verifyJwt,requirePermission(EPermission.INTAKE)], editIntake);
intakeRoute.delete("/:id", [verifyJwt,], deleteIntake);

export default intakeRoute;
