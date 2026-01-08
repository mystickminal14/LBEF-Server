import { asyncHandler } from "../../utils/asyncHandler";
import { Request, Response } from "express";
import { ApiError } from "../../utils/apiError";
import { prismaClient } from "../../server";
import { ApiResponse } from "../../utils/apiResponse";
import { deleteCourseImage } from "../../utils/deleteImage";
import { paginationSchema } from "../../validation/pagination.validation";

const create = asyncHandler(async (req: Request, res: Response) => {
  if (!req.files || !(req.files as Express.Multer.File[]).length) {
    throw new ApiError(400, "No image files provided");
  }

  const files = req.files as Express.Multer.File[];

  const imagesData = files.map((file) => ({
    image: `/public/gallery/${file.filename}`,
  }));

  const images = await prismaClient.photoGallery.createMany({
    data: imagesData,
  });

  res
    .status(201)
    .json(new ApiResponse(201, images, "Images uploaded successfully"));
});
const getData = asyncHandler(async (req: Request, res: Response) => {
   const parsed = paginationSchema.safeParse(req.query);
 
   if (!parsed.success) {
     throw new ApiError(400, "Validation Failed", parsed.error.issues);
   }  
 const { page, limit } = parsed.data;
   const skip = (page - 1) * limit;
 



  const users = await prismaClient.photoGallery.findMany({
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  const total = await prismaClient.photoGallery.count();

  const totalPages = Math.ceil(total / limit);

  const pagination = {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };

  return res
    .status(200)
    .json(
      new ApiResponse(200, users, "Gallery fetched successfully", pagination)
    );
});
const getAll = asyncHandler(async (req: Request, res: Response) => {
  const users = await prismaClient.photoGallery.findMany();
  return res
    .status(200)
    .json(
      new ApiResponse(200, users, "Gallery fetched successfully")
    );
});
const deleteImage = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  const image = await prismaClient.photoGallery.findUnique({ where: { id } });
  if (!image) throw new ApiError(404, "image not found");

  if (image.image) deleteCourseImage(image.image);

  await prismaClient.photoGallery.delete({ where: { id } });

  res
    .status(200)
    .json(new ApiResponse(200, null, "Image deleted successfully"));
});

export { create, getData, getAll, deleteImage };
