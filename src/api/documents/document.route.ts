import { Router } from "express";
import { upload } from "../../middleware/multer.middleware";
import { addDocument, deletedocument, editdocument, getAlldocument, getdocument } from "./document.controller";
import verifyJwt from "../../middleware/auth.middleware";

const documentRouter: Router = Router();
documentRouter.get("/", [verifyJwt], getdocument);
documentRouter.get("/all", getAlldocument);
documentRouter.post("/", [verifyJwt], addDocument);
documentRouter.put("/:id", [verifyJwt], editdocument);
documentRouter.delete("/:id", [verifyJwt], deletedocument);

export default documentRouter;
