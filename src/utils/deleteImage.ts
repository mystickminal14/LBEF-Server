import fs from "fs";
import path from "path";

export const deleteCourseImage = (imagePath: string): void => {
  if (!imagePath) return;

  try {
    let cleaned = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath;

    const fullPath = path.join(process.cwd(), cleaned);

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log("Deleted:", fullPath);
    } else {
      console.log("File not found:", fullPath);
    }
  } catch (error) {
    console.error("Error deleting image:", error);
  }
};
