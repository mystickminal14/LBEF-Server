import { Router } from "express";
import verifyJwt from "../../middleware/auth.middleware";
import { addEditorial, editEditorial, getEditorials, deleteEditorial, getEditorialsAll } from "./editorial.controller";

const editorialRouter: Router = Router();

editorialRouter.get("/", [verifyJwt], getEditorials);
editorialRouter.get("/all", getEditorialsAll);

editorialRouter.post("/", [verifyJwt], addEditorial);
editorialRouter.put("/:id", [verifyJwt], editEditorial);
editorialRouter.delete("/:id", [verifyJwt], deleteEditorial);

export default editorialRouter;
