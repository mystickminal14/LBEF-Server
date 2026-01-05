import express, { Router } from "express";
import {
  addContact,
  deleteUser,
  editUser,
  getAll,
  getContact,
  
} from "./contact.controller";
import verifyJwt from "../../middleware/auth.middleware";
import adminMiddleware from "../../middleware/admin.middleware";

const contactRoute: Router = express();
contactRoute.get("/", [verifyJwt ], getContact);
contactRoute.get("/all", getAll);

contactRoute.post("/", [verifyJwt ], addContact);
contactRoute.put("/:id", [verifyJwt, adminMiddleware], editUser);
contactRoute.delete("/:id", [verifyJwt, adminMiddleware], deleteUser);

export default contactRoute;
