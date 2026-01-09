import { Router } from "express";
import { uploadPDF } from "../../middleware/pdf.middleware";
import {
  addMultipleFiles,
  createSession,
  deleteChild,
  deleteParentWithChildren,
  editSession,
  getChildrenByParentId,
  getParents,
  getParentWithChildren,
} from "./fee.planner.controller";
import verifyJwt from "../../middleware/auth.middleware";
import { requirePermission } from "../../middleware/permission.middleware";
import { EPermission } from "../users/permisssion";

export const feePlannerRouter: Router = Router();

feePlannerRouter.put(
  "/files", 
  [verifyJwt,requirePermission(EPermission.FEE_PLANNER)],
  uploadPDF.array("files", 10),
  addMultipleFiles
);
feePlannerRouter.post("/", [verifyJwt,requirePermission(EPermission.FEE_PLANNER)], uploadPDF.single("files"), createSession);

feePlannerRouter.delete("/child/:id", [verifyJwt,requirePermission(EPermission.FEE_PLANNER)], deleteChild);
feePlannerRouter.delete("/:id", [verifyJwt,requirePermission(EPermission.FEE_PLANNER)], deleteParentWithChildren);
feePlannerRouter.put("/:id", [verifyJwt,requirePermission(EPermission.FEE_PLANNER)], editSession);
feePlannerRouter.get("/", [verifyJwt,requirePermission(EPermission.FEE_PLANNER)], getParents);
feePlannerRouter.get("/child/:id", [verifyJwt,requirePermission(EPermission.FEE_PLANNER)], getChildrenByParentId);

feePlannerRouter.get("/all", getParentWithChildren);
