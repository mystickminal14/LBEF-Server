import { Router } from "express";
import verifyJwt from "../../middleware/auth.middleware";
import { upload } from "../../middleware/multer.middleware";
import 
{
  addteam,
  editteam,
  getteam,
  getteamName,
  changeteamOrder,
  toggleTeamStatus,
}
from "./team.dept.controller";
import { requirePermission } from "../../middleware/permission.middleware";
import { EPermission } from "../users/permisssion";

const deptRouter: Router = Router();
deptRouter.get("/", [verifyJwt, requirePermission(EPermission.TEAM_DEPT)], getteam);
deptRouter.get("/name", getteamName);

deptRouter.post("/", [verifyJwt, requirePermission(EPermission.TEAM_DEPT)], addteam);
deptRouter.put("/:id", [verifyJwt, requirePermission(EPermission.TEAM_DEPT)], editteam);
deptRouter.put(
  "/change-order/:id",
  [verifyJwt, requirePermission(EPermission.TEAM_DEPT)],
  changeteamOrder
);


deptRouter.put("/toggle/status/:id", [verifyJwt, requirePermission(EPermission.TEAMS)], toggleTeamStatus);


export default deptRouter;
