import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/apiError";
import { ApiResponse } from "../../utils/apiResponse";
import { prismaClient } from "../../server";
import { EditorialValidation, honoraryPositionSchema } from "./editorial.validation";
import { paginationSchema } from "../../validation/pagination.validation";

const addEditorial = asyncHandler(async (req: Request, res: Response) => {
  const parsed = EditorialValidation.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "Validation Failed", parsed.error.issues);
  }

  const editorial = await prismaClient.editorialBoard.create({
    data: parsed.data,
  });

  res.status(201).json(new ApiResponse(201, editorial, "Editorial member added successfully"));
});

const editEditorial = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const parsed = EditorialValidation.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, "Validation Failed", parsed.error.issues);

  const existing = await prismaClient.editorialBoard.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Editorial member not found");

  const updated = await prismaClient.editorialBoard.update({
    where: { id },
    data: parsed.data,
  });

  res.status(200).json(new ApiResponse(200, updated, "Editorial member updated successfully"));
});

const getEditorials = asyncHandler(async (req: Request, res: Response) => {
  const parsedPagination = paginationSchema.safeParse(req.query);
  if (!parsedPagination.success) throw new ApiError(400, "Validation Failed", parsedPagination.error.issues);

  const { page, limit } = parsedPagination.data;
  const skip = (page - 1) * limit;

  const parsedHonorary = honoraryPositionSchema.safeParse(req.query.honoraryPosition?.toString());
  if (!parsedHonorary.success) throw new ApiError(400, "Invalid honorary position", parsedHonorary.error.issues);

  const honoraryPosition = parsedHonorary.data;

  const search = req.query.search?.toString().toLowerCase().trim();
  const searchFilter = search
    ? { OR: [{ name: { contains: search } }, { designation: { contains: search } }, { institution: { contains: search } }] }
    : {};

  const honoraryFilter = honoraryPosition ? { honoraryPosition } : {};

  const whereFilter = { AND: [searchFilter, honoraryFilter] };

  const editorials = await prismaClient.editorialBoard.findMany({
    where: whereFilter,
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  const total = await prismaClient.editorialBoard.count({ where: whereFilter });
  const totalPages = Math.ceil(total / limit);

  const pagination = {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };

  res.status(200).json(new ApiResponse(200, editorials, "Editorial members fetched successfully", pagination));
});
const getEditorialsAll= asyncHandler(async (req: Request, res: Response) => {

  const editorials = await prismaClient.editorialBoard.findMany({
    orderBy: { createdAt: "desc" },
  });



  res.status(200).json(new ApiResponse(200, editorials, "Editorial members fetched successfully", ));
});

const deleteEditorial = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  const editorial = await prismaClient.editorialBoard.findUnique({ where: { id } });
  if (!editorial) throw new ApiError(404, "Editorial member not found");

  await prismaClient.editorialBoard.delete({ where: { id } });

  res.status(200).json(new ApiResponse(200, null, "Editorial member deleted successfully"));
});

export {getEditorialsAll, addEditorial, editEditorial, getEditorials, deleteEditorial };
