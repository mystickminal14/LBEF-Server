import { Router } from "express";
import verifyJwt from "../../middleware/auth.middleware";
import { uploadPDF } from "../../middleware/pdf.middleware";
import {  createFile, getFiles, deleteFile, uploadImage, updateconnectImage  } from "./connect.controller";
import { upload } from "../../middleware/multer.middleware";
import { requirePermission } from "../../middleware/permission.middleware";
import { EPermission } from "../users/permisssion";

const connectRouter: Router = Router();
connectRouter.get("/",getFiles);
connectRouter.post("/", [verifyJwt,requirePermission(EPermission.CONNECT)],uploadPDF.single("file"),createFile);
connectRouter.put("/upload/:id", [verifyJwt,requirePermission(EPermission.CONNECT)],upload.single("image"),uploadImage);
connectRouter.put("/update/:id", [verifyJwt,requirePermission(EPermission.CONNECT)],upload.single("image"),updateconnectImage);
connectRouter.delete("/:id", [verifyJwt,requirePermission(EPermission.CONNECT)],deleteFile);

export default connectRouter;