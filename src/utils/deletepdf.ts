import fs from "fs";
import path from "path";

export const deletePDF = (filePath?: string): void => {
  if (!filePath) return;

  try {
    const cleaned = filePath.startsWith("/")
      ? filePath.slice(1)
      : filePath;

    const fullPath = path.join(process.cwd(), cleaned);

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log("PDF deleted:", fullPath);
    } else {
      console.log("PDF not found:", fullPath);
    }
  } catch (error) {
    console.error("Error deleting PDF:", error);
  }
};
