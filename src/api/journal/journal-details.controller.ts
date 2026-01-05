import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/apiError";
import { prismaClient } from "../../server";
import { ApiResponse } from "../../utils/apiResponse";
import { deletePDF } from "../../utils/deletepdf";
import {
  CreateJournalDetailsSchema,
  EditJournalDetailsSchema,
} from "./journal.validation";
const parseCommaSeparated = (
  value: string | string[] | null | undefined
): string[] => {
  if (!value) return [];

  if (Array.isArray(value)) return value;

  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
};

export const createJournalDetails = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.params.id) {
      throw new ApiError(404, "Journal Id not found");
    }
    const parsed = CreateJournalDetailsSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, "Validation failed", parsed.error.issues);
    }
    const journal = await prismaClient.journal.findUnique({
      where: { id: parsed.data.journalId },
    });
    if (!journal) {
      throw new ApiError(404, "Journal not found");
    }

    const details = await prismaClient.journalDetails.create({
      data: {
        journalId: parsed.data.journalId,
        title: parsed.data.title,
        authors: parsed.data.authors.join(", "),
        pages: parsed.data.pages,
        subject: parsed.data.subject,
        country: parsed.data.country,
        abstract: parsed.data.abstract,
        availableOnline: parsed.data.availableOnline,
        keywords: parsed.data.keywords.join(", "),
      },
    });

    res
      .status(201)
      .json(
        new ApiResponse(201, details, "Journal details created successfully")
      );
  }
);

export const getJournalDetailsByJournalId = asyncHandler(
  async (req: Request, res: Response) => {
    const journalId = Number(req.params.id);
    if (!journalId) {
      throw new ApiError(400, "Journal ID is required");
    }

    const details = await prismaClient.journalDetails.findMany({
      where: { journalId },
      orderBy: { createdAt: "desc" },
    });

    const formatted = details.map((item) => ({
      ...item,
      authors: parseCommaSeparated(item.authors),
      keywords: parseCommaSeparated(item.keywords),
    }));

    res
      .status(200)
      .json(
        new ApiResponse(200, formatted, "Journal details fetched successfully")
      );
  }
);

export const editJournalDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!id) {
      throw new ApiError(400, "Journal detail ID is required");
    }

    const parsed = EditJournalDetailsSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, "Validation failed", parsed.error.issues);
    }

    const existing = await prismaClient.journalDetails.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new ApiError(404, "Journal detail not found");
    }

    const updated = await prismaClient.journalDetails.update({
      where: { id },
      data: {
        title: parsed.data.title,
        authors: parsed.data.authors
          ? parsed.data.authors.join(", ")
          : undefined,
        pages: parsed.data.pages,
        subject: parsed.data.subject,
        country: parsed.data.country,
        abstract: parsed.data.abstract,
        availableOnline: parsed.data.availableOnline,
        keywords: parsed.data.keywords
          ? parsed.data.keywords.join(", ")
          : undefined,
      },
    });

    res
      .status(200)
      .json(
        new ApiResponse(200, updated, "Journal details updated successfully")
      );
  }
);

export const deleteJournalDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!id) {
      throw new ApiError(400, "Journal detail ID is required");
    }
    const existing = await prismaClient.journalDetails.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new ApiError(404, "Journal detail not found");
    }

    if (existing.link) {
      deletePDF(existing.link);
    }

    await prismaClient.journalDetails.delete({
      where: { id },
    });

    res
      .status(200)
      .json(new ApiResponse(200, null, "Journal details deleted successfully"));
  }
);
export const uploadFile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.params.id) throw new ApiError(400, "Id is required");
  if (!req.file) throw new ApiError(400, "No file provided");
  const filename = req.file.filename;
  const parent = await prismaClient.journalDetails.findUnique({
    where: { id: Number(req.params.id) },
  });
  if (!parent) throw new ApiError(400, "Journal not found");
  if (parent.link) {
    deletePDF(parent.link);
  }
  const file = `/public/journal/${filename}`;
  const updatedholiday = await prismaClient.journalDetails.update({
    where: { id: Number(req.params.id) },
    data: { link: file },
  });
  return res
    .status(200)
    .json(new ApiResponse(200, updatedholiday, "File uploaded successfully"));
});
