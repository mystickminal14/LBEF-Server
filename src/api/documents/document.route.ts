import { Router } from "express";
import { upload } from "../../middleware/multer.middleware";
import { addDocument, deletedocument, editdocument, getAlldocument, getdocument } from "./document.controller";
import verifyJwt from "../../middleware/auth.middleware";
import { requirePermission } from "../../middleware/permission.middleware";
import { EPermission } from "../users/permisssion";

const documentRouter: Router = Router();
documentRouter.get("/", [verifyJwt,requirePermission(EPermission.DOCUMENTS)], getdocument);
documentRouter.get("/all", getAlldocument);
documentRouter.post("/", [verifyJwt,requirePermission(EPermission.DOCUMENTS)], addDocument);
documentRouter.put("/:id", [verifyJwt,requirePermission(EPermission.DOCUMENTS)], editdocument);
documentRouter.delete("/:id", [verifyJwt,requirePermission(EPermission.DOCUMENTS)], deletedocument);

export default documentRouter;
