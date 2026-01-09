import { Router } from "express";
import verifyJwt from "../../middleware/auth.middleware";
import { upload } from "../../middleware/multer.middleware";
import { add, deleteAlumni, edit, getAllAlumni, getAlumni, updateAlumniImage, uploadAlumni } from "./alumni.controller";
import { EPermission } from "../users/permisssion";
import { requirePermission } from "../../middleware/permission.middleware";

const alumniRouter: Router = Router();
alumniRouter.get("/", [verifyJwt,requirePermission(EPermission.ALUMNI)],getAlumni);
alumniRouter.get("/all", getAllAlumni);

alumniRouter.post("/", [verifyJwt,requirePermission(EPermission.ALUMNI)],add);
alumniRouter.put("/:id", [verifyJwt,requirePermission(EPermission.ALUMNI)],edit);

alumniRouter.put("/upload/:id", [verifyJwt,requirePermission(EPermission.ALUMNI)],upload.single("image"),uploadAlumni);
alumniRouter.put("/update-image/:id", [verifyJwt,requirePermission(EPermission.ALUMNI)],upload.single("image"),updateAlumniImage);
alumniRouter.delete("/:id", [verifyJwt,requirePermission(EPermission.ALUMNI)],deleteAlumni);


export default alumniRouter;