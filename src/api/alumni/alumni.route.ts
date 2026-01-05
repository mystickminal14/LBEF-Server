import { Router } from "express";
import verifyJwt from "../../middleware/auth.middleware";
import { upload } from "../../middleware/multer.middleware";
import { add, deleteAlumni, edit, getAllAlumni, getAlumni, updateAlumniImage, uploadAlumni } from "./alumni.controller";

const alumniRouter: Router = Router();
alumniRouter.get("/", [verifyJwt],getAlumni);
alumniRouter.get("/all", getAllAlumni);

alumniRouter.post("/", [verifyJwt],add);
alumniRouter.put("/:id", [verifyJwt],edit);

alumniRouter.put("/upload/:id", [verifyJwt],upload.single("image"),uploadAlumni);
alumniRouter.put("/update-image/:id", [verifyJwt],upload.single("image"),updateAlumniImage);
alumniRouter.delete("/:id", [verifyJwt],deleteAlumni);


export default alumniRouter;