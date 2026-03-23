import { Router } from "express";
import { upload } from "../../middleware/multer.middleware";
import verifyJwt from "../../middleware/auth.middleware";
import { requirePermission } from "../../middleware/permission.middleware";
import { EPermission } from "../users/permisssion";
import {
  addHeroSectionImage,
  changeHeroImageOrder,
  deleteHeroSectionImage,
  getActiveHeroSectionImages,
  getHeroSectionImages,
  toggleHeroImageStatus,
  updateHeroSectionImage,
} from "./hero.sectioni.image.controller";

const heroSectionImageRouter: Router = Router();

heroSectionImageRouter.get("/active", getActiveHeroSectionImages);

heroSectionImageRouter.get(
  "/",
  getHeroSectionImages
);

heroSectionImageRouter.post(
  "/",
  [verifyJwt, requirePermission(EPermission.HERO_SECTION)],
  upload.single("thumbnail"),
  addHeroSectionImage
);

heroSectionImageRouter.put(
  "/change-order/:id",
  [verifyJwt, requirePermission(EPermission.HERO_SECTION)],
  changeHeroImageOrder
);

heroSectionImageRouter.put(
  "/toggle-status/:id",
  [verifyJwt, requirePermission(EPermission.HERO_SECTION)],
  toggleHeroImageStatus
);

heroSectionImageRouter.put(
  "/:id",
  [verifyJwt, requirePermission(EPermission.HERO_SECTION)],
  upload.single("thumbnail"),
  updateHeroSectionImage
);

heroSectionImageRouter.delete(
  "/:id",
  [verifyJwt, requirePermission(EPermission.HERO_SECTION)],
  deleteHeroSectionImage
);

export default heroSectionImageRouter;