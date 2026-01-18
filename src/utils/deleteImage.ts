import fs from "fs";
import path from "path";

export const deleteCourseImage = (imagePath: string): void => {
  if (!imagePath) return;

  try {
    const filename = imagePath.startsWith("/")
      ? imagePath.slice(1)
      : imagePath;

    const fullPath = path.join(
      process.cwd(),
      "public",
      "gallery",
      filename
    );

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log("Gallery image deleted:", fullPath);
    } else {
      console.log("Gallery image not found:", fullPath);
    }
  } catch (error) {
    console.error("Error deleting gallery image:", error);
  }
};
