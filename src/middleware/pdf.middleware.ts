import { Request } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const basePublicDir = path.join(__dirname, "../../public");

const pdfStorage = multer.diskStorage({
  destination: function (req: Request, file, cb) {
    let folder = "others";

    if (req.baseUrl.includes("/downloads")) folder = "downloads";
    if (req.baseUrl.includes("/notice")) folder = "notice";
    if (req.baseUrl.includes("/planner")) folder = "planner";
    if (req.baseUrl.includes("/fee-planner")) folder = "fee-planner";
    if (req.baseUrl.includes("/connect")) folder = "connect";
    if (req.baseUrl.includes("/journal")) folder = "journal";

    const uploadPath = path.join(basePublicDir, folder);

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },

  filename: function (req: Request, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}${ext}`;
    cb(null, filename);
  },
});

/**
 * Allow multiple document types
 */
const pdfFileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimeTypes = [
    "application/pdf",
    "application/msword", // .doc
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    "application/vnd.ms-excel", // .xls
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    "application/vnd.ms-powerpoint", // .ppt
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Allowed: PDF, Word, Excel, PowerPoint, Text files."
      )
    );
  }
};

export const uploadPDF = multer({
  storage: pdfStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: pdfFileFilter,
});
