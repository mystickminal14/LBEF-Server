import { Router } from "express";
import verifyJwt from "../../middleware/auth.middleware";
import { uploadPDF } from "../../middleware/pdf.middleware";
import { getDwnload, uploadFile, deleteImage  } from "./downloads.controller";
import { requirePermission } from "../../middleware/permission.middleware";
import { EPermission } from "../users/permisssion";

const downloadRouter: Router = Router();
downloadRouter.get("/",getDwnload);
downloadRouter.post("/", [verifyJwt,requirePermission(EPermission.DOWNLOADS)],uploadPDF.single("file"),uploadFile);
downloadRouter.delete("/:id", [verifyJwt,requirePermission(EPermission.DOWNLOADS)],deleteImage);


export default downloadRouter;