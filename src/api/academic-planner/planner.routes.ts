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
} from "./planner.controller";
import verifyJwt from "../../middleware/auth.middleware";
import { requirePermission } from "../../middleware/permission.middleware";
import { EPermission } from "../users/permisssion";

export const plannerRouter: Router = Router();

plannerRouter.put(
  "/files", 
  [verifyJwt,requirePermission(EPermission.ACADEMIC_PLANNER)],
  uploadPDF.array("files", 10),
  addMultipleFiles
);
plannerRouter.post("/", [verifyJwt,requirePermission(EPermission.ACADEMIC_PLANNER)], uploadPDF.single("files"), createSession);

plannerRouter.delete("/child/:id", [verifyJwt,requirePermission(EPermission.ACADEMIC_PLANNER)], deleteChild);
plannerRouter.delete("/:id", [verifyJwt,requirePermission(EPermission.ACADEMIC_PLANNER)], deleteParentWithChildren);
plannerRouter.put("/:id", [verifyJwt,requirePermission(EPermission.ACADEMIC_PLANNER)], editSession);
plannerRouter.get("/", [verifyJwt,requirePermission(EPermission.ACADEMIC_PLANNER)], getParents);
plannerRouter.get("/child/:id", [verifyJwt,requirePermission(EPermission.ACADEMIC_PLANNER)], getChildrenByParentId);

plannerRouter.get("/all", getParentWithChildren);
