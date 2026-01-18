import { asyncHandler } from "../../utils/asyncHandler";
import { Request, Response } from "express";
import { ApiError } from "../../utils/apiError";
import { prismaClient } from "../../server";
import { ApiResponse } from "../../utils/apiResponse";
import { paginationSchema } from "../../validation/pagination.validation";
import { deleteCourseImage } from "../../utils/deleteImage";
const withPublicImage = (item: any) => ({
  ...item,
  image: item.image
    ? `/public/gallery${item.image}`
    : null,
});

const create = asyncHandler(async (req: Request, res: Response) => {
  const { typeId, links } = req.body;

  if (!typeId) throw new ApiError(400, "Gallery typeId is required");

  const type = await prismaClient.galleryType.findUnique({
    where: { id: Number(typeId) },
  });

  if (!type) throw new ApiError(404, "Gallery type not found");

  let imagesData: any[] = [];

  if (req.files && (req.files as Express.Multer.File[]).length) {
    const files = req.files as Express.Multer.File[];

    imagesData.push(
      ...files.map((file) => ({
        typeId: type.id,
        image: `/${file.filename}`,
        link: null,
      }))
    );
  }

  if (links && Array.isArray(links)) {
    imagesData.push(
      ...links.map((url: string) => ({
        typeId: type.id,
        image: null,
        link: url,
      }))
    );
  }

  if (!imagesData.length) {
    throw new ApiError(400, "No image files or links provided");
  }

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

  const typeId = req.query.typeId
    ? Number(req.query.typeId)
    : undefined;

  const whereFilter: any = {};

  if (typeId) {
    whereFilter.typeId = typeId;
  }

  const data = await prismaClient.photoGallery.findMany({
    where: whereFilter,
    skip,
    take: limit,
    include: { type: true },
    orderBy: { createdAt: "desc" },
  });

  const mappedData = data.map(withPublicImage);

  const total = await prismaClient.photoGallery.count({
    where: whereFilter,
  });

  const totalPages = Math.ceil(total / limit);

  return res.status(200).json(
    new ApiResponse(200, mappedData, "Gallery fetched successfully", {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    })
  );
});

export const getGalleryByType = asyncHandler(async (req: Request, res: Response) => {
  const parsed = paginationSchema.safeParse(req.query);
  if (!parsed.success) {
    throw new ApiError(400, "Validation Failed", parsed.error.issues);
  }

  const { page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  const types = await prismaClient.galleryType.findMany({
    where: { status: "ENABLED" },
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      galleries: {
        take: 10,
        orderBy: { createdAt: "desc" },
      },
    },
  });

  const formatted = types.map((type) => ({
    type: {
      id: type.id,
      name: type.name,
     
    },
    images: type.galleries.map(withPublicImage),
  }));

  const total = await prismaClient.galleryType.count({
    where: { status: "ENABLED" },
  });

  const totalPages = Math.ceil(total / limit);

  return res.status(200).json(
    new ApiResponse(
      200,
      formatted,
      "Gallery grouped by type fetched successfully",
      {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      }
    )
  );
});

const getAll = asyncHandler(async (_req: Request, res: Response) => {
  const data = await prismaClient.photoGallery.findMany({
    include: { type: true },
  });

  const mappedData = data.map(withPublicImage);

  res
    .status(200)
    .json(new ApiResponse(200, mappedData, "Gallery fetched successfully"));
});

const deleteImage = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const image = await prismaClient.photoGallery.findUnique({ where: { id } });
  if (!image) throw new ApiError(404, "Image not found");

  if (image.image) {
    deleteCourseImage(image.image);
  }

  await prismaClient.photoGallery.delete({ where: { id } });

  res
    .status(200)
    .json(new ApiResponse(200, null, "Image deleted successfully"));
});

export { create, getData, getAll, deleteImage };
