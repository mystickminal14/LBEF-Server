import { Router } from "express";
import verifyJwt from "../../middleware/auth.middleware";
import { uploadPDF } from "../../middleware/pdf.middleware";
import {  createFile, getFiles, deleteFile, uploadImage, updateconnectImage  } from "./connect.controller";
import { upload } from "../../middleware/multer.middleware";

const connectRouter: Router = Router();
connectRouter.get("/",getFiles);
connectRouter.post("/", [verifyJwt],uploadPDF.single("file"),createFile);
connectRouter.put("/upload/:id", [verifyJwt],upload.single("image"),uploadImage);
connectRouter.put("/update/:id", [verifyJwt],upload.single("image"),updateconnectImage);
connectRouter.delete("/:id", [verifyJwt],deleteFile);

export default connectRouter;