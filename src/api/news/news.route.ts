import { Router } from "express";
import { add, deleteNews, edit,getNews,updateNewsImage,uploadNews } from "./news.controller";
import verifyJwt from "../../middleware/auth.middleware";
import { upload } from "../../middleware/multer.middleware";
import { requirePermission } from "../../middleware/permission.middleware";
import { EPermission } from "../users/permisssion";

const newsRouter: Router = Router();
newsRouter.get("/",getNews);
newsRouter.post("/", [verifyJwt,requirePermission(EPermission.NEWS)],add);
newsRouter.put("/:id", [verifyJwt],edit);

newsRouter.put("/upload/:id", [verifyJwt,requirePermission(EPermission.RECOGNITION)],upload.single("image"),uploadNews);
newsRouter.put("/update-image/:id", [verifyJwt,requirePermission(EPermission.RECOGNITION)],upload.single("image"),updateNewsImage);
newsRouter.delete("/:id", [verifyJwt,requirePermission(EPermission.RECOGNITION)],deleteNews);


export default newsRouter;