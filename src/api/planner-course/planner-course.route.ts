import express, { Router } from "express";
import {
  addPlannerCourse,
  deleteUser,
  editUser,
  getAll,
  
} from "./planner-course.controller";
import verifyJwt from "../../middleware/auth.middleware";
import { requirePermission } from "../../middleware/permission.middleware";
import { EPermission } from "../users/permisssion";

const plannerCourseRoute: Router = express();
plannerCourseRoute.get("/",[verifyJwt,requirePermission(EPermission.PLANNER_COURSE)], getAll);
plannerCourseRoute.post("/", [verifyJwt,requirePermission(EPermission.PLANNER_COURSE)], addPlannerCourse);
plannerCourseRoute.put("/:id", [verifyJwt,requirePermission(EPermission.PLANNER_COURSE)], editUser);
plannerCourseRoute.delete("/:id", [verifyJwt,requirePermission(EPermission.PLANNER_COURSE)], deleteUser);

export default plannerCourseRoute;
