import { Router } from "express";
import { upload } from "../../middleware/multer.middleware";
import { addCourse, deleteCourse, editCourse, getAllCourse, getCourse, getCourseName, updateCourseImage, uploadImage } from "./course.controller";
import verifyJwt from "../../middleware/auth.middleware";
import { addCourseDetails, deleteBlock, editCourseDetails, getCourseDetails, updateBlock } from "./details.controller";
import { requirePermission } from "../../middleware/permission.middleware";
import { EPermission } from "../users/permisssion";

const courseRouter: Router = Router();
courseRouter.get("/",  getCourse);
courseRouter.get("/all", getAllCourse);
courseRouter.get("/name", getCourseName);

courseRouter.post("/", [verifyJwt,requirePermission(EPermission.COURSES)], addCourse);
courseRouter.put("/:id", [verifyJwt,requirePermission(EPermission.COURSES)], editCourse);
courseRouter.delete("/:id", [verifyJwt,requirePermission(EPermission.COURSES)], deleteCourse);

courseRouter.put("/upload/:id", [verifyJwt,requirePermission(EPermission.COURSES)], upload.single("image"), uploadImage);
courseRouter.put("/update-image/:id", [verifyJwt,requirePermission(EPermission.COURSES)], upload.single("image"), updateCourseImage);

courseRouter.post("/:courseId/details", [verifyJwt,requirePermission(EPermission.COURSES)], addCourseDetails);
courseRouter.put("/:courseId/details", [verifyJwt,requirePermission(EPermission.COURSES)], editCourseDetails);

courseRouter.get("/:courseId/details", getCourseDetails);
courseRouter.put("/:id/details/update", [verifyJwt,requirePermission(EPermission.COURSES)], updateBlock);
courseRouter.delete("/:id/details", [verifyJwt,requirePermission(EPermission.COURSES)], deleteBlock);
export default courseRouter;
