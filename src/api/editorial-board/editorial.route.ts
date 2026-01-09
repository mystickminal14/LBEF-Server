import { Router } from "express";
import verifyJwt from "../../middleware/auth.middleware";
import { addEditorial, editEditorial, getEditorials, deleteEditorial, getEditorialsAll } from "./editorial.controller";
import { requirePermission } from "../../middleware/permission.middleware";
import { EPermission } from "../users/permisssion";

const editorialRouter: Router = Router();

editorialRouter.get("/", [verifyJwt,requirePermission(EPermission.EDITORIAL_BOARD)], getEditorials);
editorialRouter.get("/all", getEditorialsAll);

editorialRouter.post("/", [verifyJwt,requirePermission(EPermission.EDITORIAL_BOARD)], addEditorial);
editorialRouter.put("/:id", [verifyJwt,requirePermission(EPermission.EDITORIAL_BOARD)], editEditorial);
editorialRouter.delete("/:id", [verifyJwt,requirePermission(EPermission.EDITORIAL_BOARD)], deleteEditorial);

export default editorialRouter;
