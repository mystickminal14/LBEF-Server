import { Router } from "express";
import verifyJwt from "../../middleware/auth.middleware";
import { upload } from "../../middleware/multer.middleware";
import {
  add,
  uploadTeamImages,
  edit,
  deleteTeam,
  updateteamImage,
  getTeam,
  getTeamsByDepartment,
} from "./teams.controller";
import { requirePermission } from "../../middleware/permission.middleware";
import { EPermission } from "../users/permisssion";

const teamRouter: Router = Router();
teamRouter.get("/", [verifyJwt, requirePermission(EPermission.TEAMS)], getTeam);
teamRouter.get("/department", getTeamsByDepartment);

teamRouter.post("/", [verifyJwt, requirePermission(EPermission.TEAMS)], add);
teamRouter.put("/:id", [verifyJwt, requirePermission(EPermission.TEAMS)], edit);

teamRouter.put(
  "/upload/:id",
  [verifyJwt, requirePermission(EPermission.TEAMS)],
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "portrait", maxCount: 1 },
  ]),
  uploadTeamImages
);
teamRouter.put(
  "/update-image/:id",
  [verifyJwt, requirePermission(EPermission.TEAMS)],
  upload.single("image"),
  updateteamImage
);
teamRouter.delete("/:id", [verifyJwt, requirePermission(EPermission.TEAMS)], deleteTeam);

export default teamRouter;
