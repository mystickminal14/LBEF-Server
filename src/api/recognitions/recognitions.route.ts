import { Router } from "express";
import verifyJwt from "../../middleware/auth.middleware";
import { upload } from "../../middleware/multer.middleware";
import {
  add,
  uploadRecognition,
  edit,
  deleteRecognition,
  updateRecognitionImage,
  getRecognition,
} from "./recognitions.controller";
import { requirePermission } from "../../middleware/permission.middleware";
import { EPermission } from "../users/permisssion";

const recognitionRouter: Router = Router();
recognitionRouter.get("/", [verifyJwt ,requirePermission(EPermission.RECOGNITION)], getRecognition);
recognitionRouter.get("/all",  getRecognition);

recognitionRouter.post("/", [verifyJwt,requirePermission(EPermission.RECOGNITION)], add);
recognitionRouter.put("/:id", [verifyJwt,requirePermission(EPermission.RECOGNITION)], edit);

recognitionRouter.put(
  "/upload/:id",
  [verifyJwt,requirePermission(EPermission.RECOGNITION)],
  upload.single("image"),
  uploadRecognition
);
recognitionRouter.put(
  "/update-image/:id",
  [verifyJwt,requirePermission(EPermission.RECOGNITION)],
  upload.single("image"),
  updateRecognitionImage
);
recognitionRouter.delete("/:id", [verifyJwt,requirePermission(EPermission.RECOGNITION)], deleteRecognition);

export default recognitionRouter;
