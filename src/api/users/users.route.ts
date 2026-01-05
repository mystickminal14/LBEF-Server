import express, { Router } from "express";
import {
  addUser,
  deleteUser,
  editUser,
  getUser,
  resetPassword,
  updateUserRole,
} from "./users.controller";
import verifyJwt from "../../middleware/auth.middleware";
import adminMiddleware from "../../middleware/admin.middleware";

const userRoute: Router = express();
userRoute.get("/", [verifyJwt, adminMiddleware], getUser);
userRoute.post("/add", [verifyJwt, adminMiddleware], addUser);
userRoute.put("/edit/:id", [verifyJwt, adminMiddleware], editUser);
userRoute.put("/reset/:id", [verifyJwt, adminMiddleware], resetPassword);
userRoute.put("/update-role/:id", [verifyJwt, adminMiddleware], updateUserRole);
userRoute.delete("/delete/:id", [verifyJwt, adminMiddleware], deleteUser);

export default userRoute;
