import { Router } from "express";
import { EPermission } from "@prisma/client";
import { requirePermission } from "../../middleware/permission.middleware";
import verifyJwt from "../../middleware/auth.middleware";
import { createFeeYear, deleteFeeYear, getFeeYears, getFeeYearsPagination, updateFeeYear } from "./yearplanner.controller";
import { uploadPDF } from "../../middleware/pdf.middleware";
import { createFeePlanner, deleteFeePlanner, getFeePlannersPagination, getPlanners, updateFeePlanner } from "./planner.controller";

export const feePlannerRouter: Router = Router();
feePlannerRouter.post("/fee_year", [verifyJwt,requirePermission(EPermission.FEE_PLANNER)],createFeeYear);
feePlannerRouter.get("/fee_year", [verifyJwt,requirePermission(EPermission.FEE_PLANNER)],getFeeYears);
feePlannerRouter.get("/fee_year/pagination", [verifyJwt,requirePermission(EPermission.FEE_PLANNER)],getFeeYearsPagination);
feePlannerRouter.put("/fee_year/:id", [verifyJwt,requirePermission(EPermission.FEE_PLANNER)],updateFeeYear);
feePlannerRouter.delete("/fee_year/:id", [verifyJwt,requirePermission(EPermission.FEE_PLANNER)],deleteFeeYear);


feePlannerRouter.post("/", [verifyJwt,requirePermission(EPermission.FEE_PLANNER)], uploadPDF.single("files"), createFeePlanner);
feePlannerRouter.delete("/:id", [verifyJwt,requirePermission(EPermission.FEE_PLANNER)], deleteFeePlanner);
feePlannerRouter.put("/:id", [verifyJwt,requirePermission(EPermission.FEE_PLANNER)],uploadPDF.single("files"), updateFeePlanner);
feePlannerRouter.get("/", getFeePlannersPagination);
feePlannerRouter.get("/all", getPlanners);
