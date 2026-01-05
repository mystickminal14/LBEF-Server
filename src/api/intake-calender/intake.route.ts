import express, { Router } from "express";

import verifyJwt from "../../middleware/auth.middleware";
import { addIntake, deleteIntake, editIntake, getIntake } from "./intake.controller";
import { de } from "zod/v4/locales";

const intakeRoute: Router = express();
intakeRoute.get("/",  getIntake);
intakeRoute.post("/", [verifyJwt], addIntake);
intakeRoute.put("/:id", [verifyJwt,], editIntake);
intakeRoute.delete("/:id", [verifyJwt,], deleteIntake);

export default intakeRoute;
