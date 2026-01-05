import { Router } from "express";
import {  create, getData, getAll,  deleteImage } from "./gallery.controller";
import verifyJwt from "../../middleware/auth.middleware";
import { upload } from "../../middleware/multer.middleware";

const galleryRouter: Router = Router();
galleryRouter.get("/", getData);
galleryRouter.get("/all",getAll);
galleryRouter.post("/", [verifyJwt],upload.single("image"),create);
galleryRouter.delete("/:id", [verifyJwt],deleteImage);


export default galleryRouter;