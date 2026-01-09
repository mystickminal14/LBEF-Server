import express, { Router } from "express";
import {
  addUser,
  assignUserPermissions,
  deleteUser,
  editUser,
  getUser,
  resetPassword,
  updateUserRole,
} from "./users.controller";
import verifyJwt from "../../middleware/auth.middleware";
import adminMiddleware from "../../middleware/admin.middleware";
import { requirePermission } from "../../middleware/permission.middleware";
import { EPermission } from "./permisssion";

const userRoute: Router = express();
userRoute.get("/", [verifyJwt, adminMiddleware, requirePermission(EPermission.USERS)], getUser);
userRoute.post("/add", [verifyJwt, adminMiddleware, requirePermission(EPermission.USERS)], addUser);
userRoute.put("/edit/:id", [verifyJwt, adminMiddleware, requirePermission(EPermission.USERS)], editUser);
userRoute.put("/reset/:id", [verifyJwt, adminMiddleware, requirePermission(EPermission.USERS)], resetPassword);
userRoute.put("/update-role/:id", [verifyJwt, adminMiddleware, requirePermission(EPermission.USERS)], updateUserRole);
userRoute.delete("/delete/:id", [verifyJwt, adminMiddleware, requirePermission(EPermission.USERS)], deleteUser);
userRoute.post("/:id/permissions", [verifyJwt, adminMiddleware, requirePermission(EPermission.USERS)], assignUserPermissions);

export default userRoute;
