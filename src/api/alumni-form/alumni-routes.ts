import express, { Router } from "express";

import verifyJwt from "../../middleware/auth.middleware";
import { requirePermission } from "../../middleware/permission.middleware";
import { EPermission } from "../users/permisssion";

import {
  addAlumni,
  editAlumni,
  getAlumni,
  getAllAlumni,
  toggleAlumniStatus,
} from "./alumni-form.controller";

const alumniRoute: Router = express();

alumniRoute.get(
  "/",
  [verifyJwt, requirePermission(EPermission.ALMUNI_FORM)],
  getAlumni
);

alumniRoute.get("/all", getAllAlumni);

alumniRoute.post(
  "/",
  addAlumni
);

alumniRoute.put(
  "/:id",
  [verifyJwt, requirePermission(EPermission.ALMUNI_FORM)],
  editAlumni
);

alumniRoute.put(
  "/toggle/:id",
  [verifyJwt, requirePermission(EPermission.ALMUNI_FORM)],
  toggleAlumniStatus
);

export default alumniRoute;
