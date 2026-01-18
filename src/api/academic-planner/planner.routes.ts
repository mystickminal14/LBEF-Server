import { Router } from "express";
import { uploadPDF } from "../../middleware/pdf.middleware";
import {
  createAcademicPlanner,
  deleteAcademicPlanner,
  getAcademicPlannersPagination,
  getPlanners,
  updateAcademicPlanner,
} from "./planner.controller";
import verifyJwt from "../../middleware/auth.middleware";
import { requirePermission } from "../../middleware/permission.middleware";
import { EPermission } from "../users/permisssion";
import { createAcademicYear, deleteAcademicYear, getAcademicYears, getAcademicYearsPagination, updateAcademicYear } from "./yearplanner.controller";

export const plannerRouter: Router = Router();
plannerRouter.post("/academic_year", [verifyJwt,requirePermission(EPermission.ACADEMIC_PLANNER)],createAcademicYear);
plannerRouter.get("/academic_year", [verifyJwt,requirePermission(EPermission.ACADEMIC_PLANNER)],getAcademicYears);
plannerRouter.get("/academic_year/pagination", [verifyJwt,requirePermission(EPermission.ACADEMIC_PLANNER)],getAcademicYearsPagination);
plannerRouter.put("/academic_year/:id", [verifyJwt,requirePermission(EPermission.ACADEMIC_PLANNER)],updateAcademicYear);
plannerRouter.delete("/academic_year/:id", [verifyJwt,requirePermission(EPermission.ACADEMIC_PLANNER)],deleteAcademicYear);


plannerRouter.post("/", [verifyJwt,requirePermission(EPermission.ACADEMIC_PLANNER)], uploadPDF.single("files"), createAcademicPlanner);
plannerRouter.delete("/:id", [verifyJwt,requirePermission(EPermission.ACADEMIC_PLANNER)], deleteAcademicPlanner);
plannerRouter.put("/:id", [verifyJwt,requirePermission(EPermission.ACADEMIC_PLANNER)],uploadPDF.single("files"), updateAcademicPlanner);
plannerRouter.get("/", getAcademicPlannersPagination);
plannerRouter.get("/all", getPlanners);
