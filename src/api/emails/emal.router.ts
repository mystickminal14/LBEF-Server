import express, { Router } from "express";
import { studentLead } from "./email.controller";


const emailRoute: Router = express();
emailRoute.post("/", studentLead);

export default emailRoute;
