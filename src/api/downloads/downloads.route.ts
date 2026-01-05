import { Router } from "express";
import verifyJwt from "../../middleware/auth.middleware";
import { uploadPDF } from "../../middleware/pdf.middleware";
import { getDwnload, uploadFile, deleteImage  } from "./downloads.controller";

const downloadRouter: Router = Router();
downloadRouter.get("/",getDwnload);
downloadRouter.post("/", [verifyJwt],uploadPDF.single("file"),uploadFile);
downloadRouter.delete("/:id", [verifyJwt],deleteImage);


export default downloadRouter;