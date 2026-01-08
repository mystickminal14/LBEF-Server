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

const teamRouter: Router = Router();
teamRouter.get("/", [verifyJwt], getTeam);
teamRouter.get("/department", getTeamsByDepartment);

teamRouter.post("/", [verifyJwt], add);
teamRouter.put("/:id", [verifyJwt], edit);

teamRouter.put(
  "/upload/:id",
  [verifyJwt],
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "portrait", maxCount: 1 },
  ]),
  uploadTeamImages
);
teamRouter.put(
  "/update-image/:id",
  [verifyJwt],
  upload.single("image"),
  updateteamImage
);
teamRouter.delete("/:id", [verifyJwt], deleteTeam);

export default teamRouter;
