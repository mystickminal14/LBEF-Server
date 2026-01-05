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

const recognitionRouter: Router = Router();
recognitionRouter.get("/", [verifyJwt], getRecognition);
recognitionRouter.get("/all",  getRecognition);

recognitionRouter.post("/", [verifyJwt], add);
recognitionRouter.put("/:id", [verifyJwt], edit);

recognitionRouter.put(
  "/upload/:id",
  [verifyJwt],
  upload.single("image"),
  uploadRecognition
);
recognitionRouter.put(
  "/update-image/:id",
  [verifyJwt],
  upload.single("image"),
  updateRecognitionImage
);
recognitionRouter.delete("/:id", [verifyJwt], deleteRecognition);

export default recognitionRouter;
