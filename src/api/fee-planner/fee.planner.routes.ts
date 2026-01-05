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

export const feePlannerRouter: Router = Router();

feePlannerRouter.put(
  "/files", 
  [verifyJwt],
  uploadPDF.array("files", 10),
  addMultipleFiles
);
feePlannerRouter.post("/", [verifyJwt], uploadPDF.single("files"), createSession);

feePlannerRouter.delete("/child/:id", [verifyJwt], deleteChild);
feePlannerRouter.delete("/:id", [verifyJwt], deleteParentWithChildren);
feePlannerRouter.put("/:id", [verifyJwt], editSession);
feePlannerRouter.get("/", [verifyJwt], getParents);
feePlannerRouter.get("/child/:id", [verifyJwt], getChildrenByParentId);

feePlannerRouter.get("/all", getParentWithChildren);
