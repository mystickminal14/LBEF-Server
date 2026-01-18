import express, { Router } from "express";
import {
  addContact,
  deleteUser,
  editUser,
  getAll,
  getContact,
  toggleContactStatus,
  
} from "./contact.controller";
import verifyJwt from "../../middleware/auth.middleware";
import { requirePermission } from "../../middleware/permission.middleware";
import { EPermission } from "../users/permisssion";

const contactRoute: Router = express();
contactRoute.get("/", [verifyJwt,requirePermission(EPermission.CONTACT)], getContact);
contactRoute.get("/all", getAll);

contactRoute.post("/", [verifyJwt,requirePermission(EPermission.CONTACT)], addContact);
contactRoute.put("/:id", [verifyJwt,requirePermission(EPermission.CONTACT)], editUser);
contactRoute.delete("/:id", [verifyJwt,requirePermission(EPermission.CONTACT)], deleteUser);
contactRoute.put("/status/:id", [verifyJwt,requirePermission(EPermission.CONTACT)], toggleContactStatus);

export default contactRoute;
