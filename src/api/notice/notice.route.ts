import { Router } from "express";
import verifyJwt from "../../middleware/auth.middleware";
import { add, uploadImage, edit, getNotices, deleteNotice }from "./notice.controller";
import { uploadPDF } from "../../middleware/pdf.middleware";

const noticeRouter: Router = Router();
noticeRouter.get("/",  getNotices);
noticeRouter.get("/all", getNotices);

noticeRouter.post("/", [verifyJwt], add);
noticeRouter.put("/:id", [verifyJwt], edit);

noticeRouter.put(
  "/upload/:id",
  [verifyJwt],
  uploadPDF.single("file"),
  uploadImage
);

noticeRouter.delete("/:id", [verifyJwt], deleteNotice);

export default noticeRouter;
