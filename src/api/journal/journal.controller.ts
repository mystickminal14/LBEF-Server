import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/apiError";
import { prismaClient } from "../../server";
import { ApiResponse } from "../../utils/apiResponse";
import { deletePDF } from "../../utils/deletepdf";
import {
  CreateJournalIssueSchema,
  CreatePrentIssueSchema,
} from "./journal.validation";
import { paginationSchema } from "../../validation/pagination.validation";

export const createIssue = asyncHandler(async (req, res) => {
  const parsed = CreatePrentIssueSchema.safeParse(req.body);
  if (!parsed.success)
    throw new ApiError(400, "Validation failed", parsed.error.issues);

  const parent = await prismaClient.journal.create({
    data: {
      type: "PARENT",
      issue: parsed.data.issue,
      year: parsed.data.year,
    },
  });

  res
    .status(201)
    .json(
      new ApiResponse(201, parent, "Journal Issued Year created successfully")
    );
});

export const createJournalIssue = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!id) {
    throw new ApiError(400, "Parent Id Is Required");
  }
  const parsed = CreateJournalIssueSchema.safeParse(req.body);
  if (!parsed.success)
    throw new ApiError(400, "Validation failed", parsed.error.issues);
  const parent = await prismaClient.journal.create({
    data: {
      type: "CHILD",
      parentId: parsed.data.parentId,
      volume: parsed.data.volume,
      month: parsed.data.month,
    },
  });

  res
    .status(201)
    .json(
      new ApiResponse(201, parent, "Journal Issued Year created successfully")
    );
});

export const editParentJournal = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!id) throw new ApiError(400, "Journal ID is required");

  const parsed = CreatePrentIssueSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "Validation failed", parsed.error.issues);
  }

  const existing = await prismaClient.journal.findUnique({
    where: { id },
  });

  if (!existing || existing.type !== "PARENT") {
    throw new ApiError(404, "Parent journal not found");
  }

  const updated = await prismaClient.journal.update({
    where: { id },
    data: {
      issue: parsed.data.issue,
      year: parsed.data.year,
    },
  });

  res
    .status(200)
    .json(new ApiResponse(200, updated, "Parent journal updated successfully"));
});
export const getjournal = asyncHandler(async (req: Request, res: Response) => {
  const parsed = paginationSchema.safeParse(req.query);
  if (!parsed.success) {
    throw new ApiError(400, "Validation Failed", parsed.error.issues);
  }
  const { page, limit } = parsed.data;
  const skip = (page - 1) * limit;


  const journals = await prismaClient.journal.findMany({
    where: { type: "PARENT" },
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
  });
  const total = await prismaClient.journal.count();
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
      new ApiResponse(
        200,
        journals,
        "journals fetched successfully",
        pagination
      )
    );
});
export const getjournalChild = asyncHandler(async (req: Request, res: Response) => {
  if(!req.params.id){
    throw new ApiError(400, "Journal ID is required");
  }
  const parsed = paginationSchema.safeParse(req.query);
  if (!parsed.success) {
    throw new ApiError(400, "Validation Failed", parsed.error.issues);
  }
  const { page, limit } = parsed.data;
  const skip = (page - 1) * limit;


  const journals = await prismaClient.journal.findMany({
    where: { type: "CHILD" ,parentId: Number(req.params.id)},
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
  });
  const total = await prismaClient.journal.count();
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
      new ApiResponse(
        200,
        journals,
        "journals fetched successfully",
        pagination
      )
    );
});
export const editJournalIssue = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!id) throw new ApiError(400, "Journal ID is required");

  const parsed = CreateJournalIssueSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "Validation failed", parsed.error.issues);
  }

  const existing = await prismaClient.journal.findUnique({
    where: { id },
  });

  if (!existing || existing.type !== "CHILD") {
    throw new ApiError(404, "Child journal not found");
  }

  const updated = await prismaClient.journal.update({
    where: { id },
    data: {
      volume: parsed.data.volume,
      month: parsed.data.month,
    },
  });

  res
    .status(200)
    .json(new ApiResponse(200, updated, "Journal issue updated successfully"));
});

export const deleteChild = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!id) throw new ApiError(400, "Child journal ID is required");

  const child = await prismaClient.journal.findUnique({
    where: { id },
    include: { details: true },
  });

  if (!child) throw new ApiError(404, "Child journal not found");

  if (child.details && child.details.length > 0) {
    child.details.forEach((d) => {
      if (d.link) deletePDF(d.link);
    });
  }
  await prismaClient.journal.delete({
    where: { id },
  });

  res
    .status(200)
    .json(new ApiResponse(200, null, "Child journal and details deleted successfully"));
});
export const deleteParentWithChildren = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!id) throw new ApiError(400, "Parent journal ID is required");

  const parent = await prismaClient.journal.findUnique({
    where: { id },
    include: {
      children: { include: { details: true } },
      details: true,
    },
  });

  if (!parent) throw new ApiError(404, "Parent journal not found");

  if (parent.details && parent.details.length > 0) {
    parent.details.forEach((d) => {
      if (d.link) deletePDF(d.link);
    });
  }
  if (parent.children && parent.children.length > 0) {
    parent.children.forEach((child) => {
      if (child.details && child.details.length > 0) {
        child.details.forEach((d) => {
          if (d.link) deletePDF(d.link);
        });
      }
    });
  }
  await prismaClient.journal.delete({
    where: { id },
  });

  res
    .status(200)
    .json(new ApiResponse(200, null, "Parent journal, children, and details deleted successfully"));
});
export const getParentsWithChildren = asyncHandler(
  async (req: Request, res: Response) => {
    const parents = await prismaClient.journal.findMany({
      where: { type: "PARENT" },
      include: {
        children: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: [
        {
          year: "desc", // sort parents by year descending
        },
      ],
    });

    return res.status(200).json(
      new ApiResponse(200, parents, "Parents with children fetched successfully")
    );
  }
);

