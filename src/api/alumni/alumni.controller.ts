import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/apiError";
import { ApiResponse } from "../../utils/apiResponse";
import { prismaClient } from "../../server";
import { deleteCourseImage } from "../../utils/deleteImage";
import { AlumniSchema } from "./alumni.validation";
import { paginationSchema } from "../../validation/pagination.validation";

const add = asyncHandler(async (req: Request, res: Response) => {
  const parsed = AlumniSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "Validation Failed", parsed.error.issues);
  }
  const alumni = await prismaClient.alumni.create({
    data: parsed.data,
  });
  res
    .status(201)
    .json(new ApiResponse(201, alumni, "Alumni added successfully"));
});

const edit = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  const parsed = AlumniSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "Validation Failed", parsed.error.issues);
  }

  const existing = await prismaClient.alumni.findUnique({
    where: { id },
  });

  if (!existing) throw new ApiError(404, "Alumni not found");

  const updated = await prismaClient.alumni.update({
    where: { id },
    data: parsed.data,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updated, "Alumni updated successfully"));
});
const getAllAlumni = asyncHandler(async (req: Request, res: Response) => {
  const alumni = await prismaClient.alumni.findMany({
    orderBy: { createdAt: "desc" },
  });

  const total = await prismaClient.alumni.count();

  return res
    .status(200)
    .json(new ApiResponse(200, alumni, "Alumni fetched successfully"));
});
const getAlumni = asyncHandler(async (req: Request, res: Response) => {
const parsed = paginationSchema.safeParse(req.query);
  
    if (!parsed.success) {
      throw new ApiError(400, "Validation Failed", parsed.error.issues);
    }
    const { page, limit } = parsed.data;
    const skip = (page - 1) * limit;

    let search = req.query.search?.toString().toLowerCase().trim() || "";

  const searchFilter = search
    ? {
        OR: [
          {
            name: {
              contains: search,
            },
          },
          {
            course: {
              contains: search,
            },
          },
        ],
      }
    : {};

  const alumni = await prismaClient.alumni.findMany({
    where: searchFilter,
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  const total = await prismaClient.alumni.count({
    where: searchFilter,
  });

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
    .json(new ApiResponse(200, alumni, "Alumni fetched successfully", pagination));
});
const uploadAlumni = asyncHandler(async (req: Request, res: Response) => {
   const id = req.params.id;

  if (!req.file) throw new ApiError(400, "No image file provided");

  const filename = req.file.filename;
  const imageUrl = `/public/alumni/${filename}`;

  const alumni = await prismaClient.alumni.findUnique({
    where: { id: parseInt(id) },
  });

  if (alumni?.image) {
    throw new ApiError(400, "Image already exists");
  }

  if (!alumni) throw new ApiError(404, "Alumni not found");

  const updatedAlumni = await prismaClient.alumni.update({
    where: { id: parseInt(id) },
    data: { image: imageUrl },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updatedAlumni, "Image uploaded successfully"));
});

const updateAlumniImage = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  if (!req.file) throw new ApiError(400, "No image file provided");

  const alumni = await prismaClient.alumni.findUnique({ where: { id } });
  if (!alumni) throw new ApiError(404, "Alumni not found");

  const filename = req.file.filename;
  const imageUrl = `/public/alumni/${filename}`;

  if (alumni.image) {
    deleteCourseImage(alumni.image);
  }

  const updatedCourse = await prismaClient.alumni.update({
    where: { id },
    data: { image: imageUrl },
  });

  res
    .status(200)
    .json(
      new ApiResponse(200, updatedCourse, "Alumni image updated successfully")
    );
});

const deleteAlumni = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;
  const alumni = await prismaClient.alumni.findUnique({
    where: { id: parseInt(id) },
  });
  if (!alumni) throw new ApiError(404, "Alumni not found");
   if (alumni.image) {
    deleteCourseImage(alumni.image);
  }
  await prismaClient.alumni.delete({ where: { id: parseInt(id) } });
  res.status(200).json(new ApiResponse(200, null, "Alumni deleted successfully"));
});

export { add, uploadAlumni,getAllAlumni, edit, deleteAlumni, updateAlumniImage, getAlumni };
