import { Router } from "express";
import verifyJwt from "../middleware/auth.middleware";
import { login, logout, me } from "../api/auth/auth.controller";

const authRoutes: Router = Router();
authRoutes.post('/login',login)
authRoutes.get('/me',[verifyJwt],me)
authRoutes.delete('/logout',logout)


export default authRoutes;
