import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/apiError";
import { ApiResponse } from "../../utils/apiResponse";
import { prismaClient } from "../../server";
import { deletePDF } from "../../utils/deletepdf";
import { JournalSchema } from "./journal.validation";
import { paginationSchema } from "../../validation/pagination.validation";


export const createJournal = asyncHandler(async (req: Request, res: Response) => {
  const parsed = JournalSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "Validation failed", parsed.error.issues);
  }

  const journal = await prismaClient.journal.create({
    data: parsed.data,
  });

  res
    .status(201)
    .json(new ApiResponse(201, journal, "Journal created successfully"));
});


export const editJournal = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!id) throw new ApiError(400, "Journal ID is required");

  const parsed = JournalSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "Validation failed", parsed.error.issues);
  }

  const updated = await prismaClient.journal.update({
    where: { id },
    data: parsed.data,
  });

  res
    .status(200)
    .json(new ApiResponse(200, updated, "Journal updated successfully"));
});

export const deleteJournal = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!id) throw new ApiError(400, "Journal ID is required");

  const journal = await prismaClient.journal.findUnique({
    where: { id },
    include: { details: true },
  });

  if (!journal) throw new ApiError(404, "Journal not found");

  journal.details.forEach((d) => {
    if (d.link) deletePDF(d.link);
  });

  await prismaClient.journal.delete({ where: { id } });

  res
    .status(200)
    .json(new ApiResponse(200, null, "Journal deleted successfully"));
});
export const getAllJournals = asyncHandler(
  async (req: Request, res: Response) => {
    const parsed = paginationSchema.safeParse(req.query);
    if (!parsed.success) {
      throw new ApiError(400, "Validation failed", parsed.error.issues);
    }

    const { page, limit } = parsed.data;
    const skip = (page - 1) * limit;

    const journals = await prismaClient.journal.findMany({
      skip,
      take: limit,
      orderBy: [
        { year: "desc" },   // newest year first
        { month: "asc" },   // Jan → Dec (can be desc if you want)
        { createdAt: "desc" },
      ],
    });

    const total = await prismaClient.journal.count();

    res.status(200).json(
      new ApiResponse(200, journals, "All journals fetched successfully", {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      })
    );
  }
);


export const getJournalsGroupedByYear = asyncHandler(
  async (req: Request, res: Response) => {
    const { year } = req.query;

    const journals = await prismaClient.journal.findMany({
      where: year ? { year: String(year) } : undefined,
      orderBy: [
        { year: "desc" },
        { month: "desc" },
        { createdAt: "desc" },
      ],
    });

    const grouped = journals.reduce<Record<string, typeof journals>>(
      (acc, journal) => {
        if (!acc[journal.year]) acc[journal.year] = [];
        acc[journal.year].push(journal);
        return acc;
      },
      {}
    );

    res
      .status(200)
      .json(
        new ApiResponse(200, grouped, "Journals grouped by year fetched successfully")
      );
  }
);
