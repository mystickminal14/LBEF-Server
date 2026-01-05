import { Router } from "express";
import { upload } from "../../middleware/multer.middleware";
import { addCourse, deleteCourse, editCourse, getAllCourse, getCourse, getCourseName, updateCourseImage, uploadImage } from "./course.controller";
import verifyJwt from "../../middleware/auth.middleware";
import { addCourseDetails, deleteBlock, editCourseDetails, getCourseDetails, updateBlock } from "./details.controller";

const courseRouter: Router = Router();
courseRouter.get("/",  getCourse);
courseRouter.get("/all", getAllCourse);
courseRouter.get("/name", getCourseName);

courseRouter.post("/", [verifyJwt], addCourse);
courseRouter.put("/:id", [verifyJwt], editCourse);
courseRouter.delete("/:id", [verifyJwt], deleteCourse);

courseRouter.put("/upload/:id", [verifyJwt], upload.single("image"), uploadImage);
courseRouter.put("/update-image/:id", [verifyJwt], upload.single("image"), updateCourseImage);

courseRouter.post("/:courseId/details", [verifyJwt], addCourseDetails);
courseRouter.put("/:courseId/details", [verifyJwt], editCourseDetails);

courseRouter.get("/:courseId/details", getCourseDetails);
courseRouter.put("/:id/details/update", [verifyJwt], updateBlock);
courseRouter.delete("/:id/details", [verifyJwt], deleteBlock);
export default courseRouter;
