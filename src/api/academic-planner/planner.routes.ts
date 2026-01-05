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

export const plannerRouter: Router = Router();

plannerRouter.put(
  "/files", 
  [verifyJwt],
  uploadPDF.array("files", 10),
  addMultipleFiles
);
plannerRouter.post("/", [verifyJwt], uploadPDF.single("files"), createSession);

plannerRouter.delete("/child/:id", [verifyJwt], deleteChild);
plannerRouter.delete("/:id", [verifyJwt], deleteParentWithChildren);
plannerRouter.put("/:id", [verifyJwt], editSession);
plannerRouter.get("/", [verifyJwt], getParents);
plannerRouter.get("/child/:id", [verifyJwt], getChildrenByParentId);

plannerRouter.get("/all", getParentWithChildren);
