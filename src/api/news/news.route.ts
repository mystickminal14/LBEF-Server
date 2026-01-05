import { Router } from "express";
import { add, deleteNews, edit,getNews,updateNewsImage,uploadNews } from "./news.controller";
import verifyJwt from "../../middleware/auth.middleware";
import { upload } from "../../middleware/multer.middleware";

const newsRouter: Router = Router();
newsRouter.get("/",getNews);
newsRouter.post("/", [verifyJwt],add);
newsRouter.put("/:id", [verifyJwt],edit);

newsRouter.put("/upload/:id", [verifyJwt],upload.single("image"),uploadNews);
newsRouter.put("/update-image/:id", [verifyJwt],upload.single("image"),updateNewsImage);
newsRouter.delete("/:id", [verifyJwt],deleteNews);


export default newsRouter;