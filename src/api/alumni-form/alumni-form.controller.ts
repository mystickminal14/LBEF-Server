import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/apiError";
import { prismaClient } from "../../server";
import { ApiResponse } from "../../utils/apiResponse";
import { paginationSchema } from "../../validation/pagination.validation";
import { AlumniFormSchema } from "./alumni-form.validation";

const addAlumni = asyncHandler(async (req: Request, res: Response) => {
  const parsed = AlumniFormSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new ApiError(400, "Validation Failed", parsed.error.issues);
  }

  const {
    collegeRollNo,
    uniRollNo,
    prefix,
    fullName,
    content,
    degree,
    yearOfPassing,
    mode,
    email,
    mobileNo,
    presentEmployer,
    designation,
    presentCountry,
  } = parsed.data;

  // ✅ Prevent duplicate registration by roll numbers
  const existing = await prismaClient.alumniForm.findFirst({
    where: {
      OR: [
        { collegeRollNo },
        { uniRollNo },
      ],
    },
  });

  if (existing) {
    throw new ApiError(
      400,
      "Alumni already registered with this College Roll No or University Roll No"
    );
  }

  const alumni = await prismaClient.alumniForm.create({
    data: {
      collegeRollNo,
      uniRollNo,
      prefix,
      fullName,
      content,
      degree,
      yearOfPassing,
      mode,
      email,
      mobileNo,
      presentEmployer,
      designation,
      presentCountry,
    },
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      alumni,
      "You have successfully registered Alumni Form"
    )
  );
});

const editAlumni = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const existing = await prismaClient.alumniForm.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new ApiError(404, "Alumni not found");
  }

  const parsed = AlumniFormSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "Validation Failed", parsed.error.issues);
  }

  const updated = await prismaClient.alumniForm.update({
    where: { id },
    data: parsed.data,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updated, "Alumni updated successfully"));
});


const getAlumni = asyncHandler(async (req: Request, res: Response) => {
  const parsed = paginationSchema.safeParse(req.query);

  if (!parsed.success) {
    throw new ApiError(400, "Validation Failed", parsed.error.issues);
  }

  const { page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  const search = req.query.search?.toString().trim() || "";
  const status = req.query.status as "ENABLED" | "DISABLED" | undefined;

  const searchFilter = search
    ? {
        OR: [
          { fullName: { contains: search } },
          { email: { contains: search } },
          { collegeRollNo: { contains: search } },
          { uniRollNo: { contains: search } },
          { degree: { contains: search } },
        ],
      }
    : {};

  const whereFilter = {
    ...searchFilter,
    ...(status ? { status } : {}),
  };

  const alumni = await prismaClient.alumniForm.findMany({
    where: whereFilter,
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  const total = await prismaClient.alumniForm.count({
    where: whereFilter,
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
    .json(
      new ApiResponse(
        200,
        alumni,
        "Alumni list fetched successfully",
        pagination
      )
    );
});


const getAllAlumni = asyncHandler(async (_req: Request, res: Response) => {
  const alumni = await prismaClient.alumniForm.findMany({
    orderBy: { createdAt: "desc" },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, alumni, "All alumni fetched successfully"));
});

const toggleAlumniStatus = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const existing = await prismaClient.alumniForm.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new ApiError(404, "Alumni not found");
  }

  // Toggle status
  const newStatus = existing.status === "ENABLED" ? "DISABLED" : "ENABLED";

  const updatedAlumni = await prismaClient.alumniForm.update({
    where: { id },
    data: { status: newStatus },
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedAlumni,
        `Alumni has been ${newStatus.toLowerCase()} successfully`
      )
    );
});



export {
  addAlumni,
  editAlumni,
  getAlumni,
  getAllAlumni,
  toggleAlumniStatus,
};
