import { Router } from "express";
import {  create, getData, getAll,  deleteImage } from "./gallery.controller";
import verifyJwt from "../../middleware/auth.middleware";
import { upload } from "../../middleware/multer.middleware";
import { requirePermission } from "../../middleware/permission.middleware";
import { EPermission } from "../users/permisssion";

const galleryRouter: Router = Router();
galleryRouter.get("/", getData);
galleryRouter.get("/all",getAll);
galleryRouter.post("/", [verifyJwt,requirePermission(EPermission.GALLERY)], upload.array("images", 20), create);
galleryRouter.delete("/:id", [verifyJwt,requirePermission(EPermission.GALLERY)],deleteImage);


export default galleryRouter;