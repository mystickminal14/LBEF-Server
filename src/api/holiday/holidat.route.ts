import { Router } from "express";
import { createHoliday, getAllHolidays, getHolidayByType, deleteHoliday } from "./holiday.controller";
import verifyJwt from "../../middleware/auth.middleware";
import { upload } from "../../middleware/multer.middleware";

const holdayRouter: Router = Router();
holdayRouter.get("/",getAllHolidays);
holdayRouter.get("/type", [verifyJwt],getHolidayByType);
holdayRouter.post("/", [verifyJwt],upload.single("image"),createHoliday);
holdayRouter.delete("/:id", [verifyJwt],deleteHoliday);


export default holdayRouter;