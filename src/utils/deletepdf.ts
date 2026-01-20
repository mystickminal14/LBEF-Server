import fs from "fs";
import path from "path";

export const deletePDF = (filePath?: string): void => {
  if (!filePath) return;

  try {
    const cleaned = filePath.startsWith("/") ? filePath.slice(1) : filePath;
    const fullPath = path.join(process.cwd(), cleaned);

    // Optional: Only allow PDF or Word files
    const allowedExts = [".pdf", ".doc", ".docx"];
    if (!allowedExts.includes(path.extname(fullPath))) {
      console.warn("File type not allowed to delete:", fullPath);
      return;
    }

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log("File deleted:", fullPath);
    } else {
      console.log("File not found:", fullPath);
    }
  } catch (error) {
    console.error("Error deleting file:", error);
  }
};
