import { Router } from "express";
import {  create, getData, getAll,  deleteImage, getGalleryByType } from "./gallery.controller";
import verifyJwt from "../../middleware/auth.middleware";
import { upload } from "../../middleware/multer.middleware";
import { requirePermission } from "../../middleware/permission.middleware";
import { EPermission } from "../users/permisssion";
import { createType, deleteType, getTypes, getTypesPagination, toggleGallery, updateType } from "./gallerytype.controller";

const galleryRouter: Router = Router();

galleryRouter.get("/type", getTypes);
galleryRouter.get("/type/all", getTypesPagination);
galleryRouter.post(
  "/type",
  [verifyJwt, requirePermission(EPermission.GALLERY)],
  createType
);

galleryRouter.put(
  "/type/:id",
  [verifyJwt, requirePermission(EPermission.GALLERY)],
  updateType
);
galleryRouter.put(
  "/status/:id",
  [verifyJwt, requirePermission(EPermission.GALLERY)],
  toggleGallery
);
galleryRouter.delete(
  "/type/:id",
  [verifyJwt, requirePermission(EPermission.GALLERY)],
  deleteType
);
galleryRouter.get("/", getData);
galleryRouter.get("/gallery-type", getGalleryByType);
galleryRouter.get("/all",getAll);
galleryRouter.post("/", [verifyJwt,requirePermission(EPermission.GALLERY)], upload.array("images", 20), create);
galleryRouter.delete("/:id", [verifyJwt,requirePermission(EPermission.GALLERY)],deleteImage);


export default galleryRouter;