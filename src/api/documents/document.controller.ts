import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/apiError";
import { prismaClient } from "../../server";
import { ApiResponse } from "../../utils/apiResponse";
import { DegreeSchema, documentTypeSchema } from "./document.validation";
import { EDegree } from "@prisma/client";
import { paginationSchema } from "../../validation/pagination.validation";

const addDocument = asyncHandler(async (req: Request, res: Response) => {
  const parsed = DegreeSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "Validation Failed", parsed.error.issues);
  }
  const { type, document } = parsed.data;

  const documentData = await prismaClient.documents.create({
    data: {
      type,
      document,
    },
  });

  res
    .status(201)
    .json(new ApiResponse(201, documentData, "document Added Successfully"));
});
const editdocument = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;
  console.log(req.body);
  const parsed = DegreeSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "Validation Failed", parsed.error.issues);
  }

 const { type, document } = parsed.data;

  const existingdocument = await prismaClient.documents.findUnique({
    where: { id: parseInt(id) },
  });

  if (!existingdocument) {
    throw new ApiError(404, "document does not exist");
  }

  const updateddocument = await prismaClient.documents.update({
    where: { id: parseInt(id) },
    data: {
        type,
      document,
    },
  });

  res
    .status(200)
    .json(
      new ApiResponse(200, updateddocument, "document Updated Successfully")
    );
});

const getdocument = asyncHandler(async (req: Request, res: Response) => {
  // Validate pagination
  const parsedPagination = paginationSchema.safeParse(req.query);
  if (!parsedPagination.success) {
    throw new ApiError(400, "Validation Failed", parsedPagination.error.issues);
  }
  const { page, limit } = parsedPagination.data;
  const skip = (page - 1) * limit;

  // Validate document type (search)
  const typeQuery = req.query.search?.toString().toUpperCase().trim();
  let type: EDegree | undefined = undefined;

  if (typeQuery) {
    const parsedType = documentTypeSchema.safeParse(typeQuery);
    if (!parsedType.success) {
      throw new ApiError(400, "Invalid document type", parsedType.error.issues);
    }
    type = parsedType.data;
  }

  const filter = type ? { type } : {};

  // Fetch documents
  const documents = await prismaClient.documents.findMany({
    where: filter,
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  // Count total
  const total = await prismaClient.documents.count({ where: filter });
  const totalPages = Math.ceil(total / limit);

  const pagination = {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };

  return res.status(200).json(
    new ApiResponse(200, documents, "Documents fetched successfully", pagination)
  );
});

const getAlldocument = asyncHandler(async (req: Request, res: Response) => {
  const documents = await prismaClient.documents.findMany({
    orderBy: { createdAt: "desc" },
  });


  return res
    .status(200)
    .json(new ApiResponse(200, documents, "documents fetched successfully"));
});


const deletedocument = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const document = await prismaClient.documents.findUnique({
    where: { id },
  });

  if (!document) throw new ApiError(404, "document not found");

 

  await prismaClient.documents.delete({
    where: { id },
  });

  res
    .status(200)
    .json(new ApiResponse(200, null, "document deleted successfully"));
});

export {
  addDocument,
  getdocument,
  getAlldocument,
  editdocument,
  deletedocument,
};
