import { Router } from "express";
import {
  addCategory,
  editCategory,
  toggleCategoryStatus,
  changeCategoryOrder,
  getCategory,
  getAllCategory,
  getCategoriesWithCourses,
} from "./course-category.controller";

import verifyJwt from "../../../middleware/auth.middleware";
import { requirePermission } from "../../../middleware/permission.middleware";
import { EPermission } from "../../users/permisssion";

const courseCategoryRouter: Router = Router();

courseCategoryRouter.get(
  "/",
  [verifyJwt, requirePermission(EPermission.COURSES)],
  getCategory,
);
courseCategoryRouter.get(
  "/with-courses",
  getCategoriesWithCourses,
);
courseCategoryRouter.get("/all", getAllCategory); 

courseCategoryRouter.post(
  "/",
  [verifyJwt, requirePermission(EPermission.COURSES)],
  addCategory,
);

courseCategoryRouter.put(
  "/:id",
  [verifyJwt, requirePermission(EPermission.COURSES)],
  editCategory,
);

courseCategoryRouter.put(
  "/toggle-status/:id",
  [verifyJwt, requirePermission(EPermission.COURSES)],
  toggleCategoryStatus,
);

courseCategoryRouter.put(
  "/change-order/:id",
  [verifyJwt, requirePermission(EPermission.COURSES)],
  changeCategoryOrder,
);

export default courseCategoryRouter;
