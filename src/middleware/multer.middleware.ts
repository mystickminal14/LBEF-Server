import { Request } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const basePublicDir = path.join(__dirname, "../../public");

const storage = multer.diskStorage({
  destination: (req: Request, _file, cb) => {
    let folder = "others";

    if (req.baseUrl.includes("/course")) folder = "courses";
    if (req.baseUrl.includes("/news")) folder = "news";
    if (req.baseUrl.includes("/alumni")) folder = "alumni";
    if (req.baseUrl.includes("/recognition")) folder = "recognitions";
    if (req.baseUrl.includes("/teams")) folder = "teams";
    if (req.baseUrl.includes("/holiday")) folder = "temp";
    if (req.baseUrl.includes("/connect")) folder = "connect";

    // ✅ GALLERY → ALWAYS SINGLE FOLDER
    if (req.baseUrl.includes("/gallery")) {
      folder = "gallery";
    }

    const uploadPath = path.join(basePublicDir, folder);

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },

  filename: (req: Request, file, cb) => {
    const ext = path.extname(file.originalname);

    // ✅ Gallery: slug in filename (NOT folder)
    if (req.baseUrl.includes("/gallery")) {
      const slug = req.body.slug;
      if (!slug) return cb(new Error("Gallery type slug required"), "");

      const filename = `${slug}-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}${ext}`;

      return cb(null, filename);
    }

    // Default filename for other routes
    const filename = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}${ext}`;

    cb(null, filename);
  },
});

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only image files allowed"));
};

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});
