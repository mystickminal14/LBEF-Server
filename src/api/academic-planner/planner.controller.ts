import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";

import { ApiError } from "../../utils/apiError";
import { prismaClient } from "../../server";
import { ApiResponse } from "../../utils/apiResponse";
import { deletePDF } from "../../utils/deletepdf";
import { CreateAcademicPlannerSchema } from "./planner.validation";
import { paginationSchema } from "../../validation/pagination.validation";

export const createAcademicPlanner = asyncHandler(
  async (req: Request, res: Response) => {
    const parsed = CreateAcademicPlannerSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new ApiError(400, "Validation failed", parsed.error.issues);
    }

    const { academicYearId, semester,plannerCourseId, intake } = parsed.data;
    if (!req.file) throw new ApiError(400, "No file provided");
    const filename = req.file.filename;
    const file = `/public/planner/${filename}`;
    const course = await prismaClient.academicYear.findUnique({
      where: { id: Number(academicYearId) },
    });
  if (!course) {
      throw new ApiError(404, "Academic Year not found");
    }
        const coursePlanner = await prismaClient.plannerCourse.findUnique({
      where: { id: Number(plannerCourseId) },
    });

    if (!coursePlanner) {
      throw new ApiError(404, "Planner course not found");
    }
  
     const semesterCheck = await prismaClient.academicPlanner.findFirst({
      where: { semester: semester,plannerCourseId:Number(plannerCourseId) },
    });

    if (semesterCheck) {
      throw new ApiError(404, "Acdemic Planner for this semester already exists not found");
    }
    const acaId=Number(academicYearId)
    const pla=Number(plannerCourseId)

    const academicYear = await prismaClient.academicPlanner.create({
      data: { intake, semester, plannerCourseId:pla,academicYearId:acaId ,file: file},
    });

    res
      .status(201)
      .json(
        new ApiResponse(
          201,
          academicYear,
          "Academic Semester created successfully",
        ),
      );
  },
);
export const getAcademicPlannersPagination = asyncHandler(
  async (req: Request, res: Response) => {
    const parsed = paginationSchema.safeParse(req.query);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid pagination parameters",
        errors: parsed.error.issues,
      });
    }

    const { page, limit } = parsed.data;
    const skip = (page - 1) * limit;

    // Fetch paginated data
    const planners = await prismaClient.academicPlanner.findMany({
      skip,
      take: limit,
      include: {
        academicYear: true,
        plannerCourse: true,
      },
      orderBy: [
        { academicYear: { year: "desc" } },
        { semester: "asc" },
      ],
    });

    // Total count
    const total = await prismaClient.academicPlanner.count();
    const totalPages = Math.ceil(total / limit);

    res.json(
      new ApiResponse(
        200,
        planners,
        "Academic planners fetched successfully",
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
  })
  export const getPlanners = asyncHandler(
  async (req: Request, res: Response) => {

    const planners = await prismaClient.academicPlanner.findMany({
      include: {
        academicYear: true,
        plannerCourse: true,
      },
      orderBy: [
        { academicYear: { year: "desc" } },
        { semester: "asc" },
      ],
    });


    res.json(
      new ApiResponse(
        200,
        planners,
        "Academic planners fetched successfully",
        
      )
    );
  })
export const updateAcademicPlanner = asyncHandler(
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    const parsed = CreateAcademicPlannerSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, "Validation failed", parsed.error.issues);
    }

    const { academicYearId,plannerCourseId, semester, intake } = parsed.data;
    const acaId = Number(academicYearId);

    const planner = await prismaClient.academicPlanner.findUnique({
      where: { id },
    });

    if (!planner) {
      throw new ApiError(404, "Academic planner not found");
    }
    const pla=Number(plannerCourseId)

    const semesterCheck = await prismaClient.academicPlanner.findFirst({
      where: {
        semester,
        academicYearId: acaId,
        NOT: { id },
      },
    });

    if (semesterCheck) {
      throw new ApiError(409, "Academic planner for this semester already exists");
    }

    let filePath = planner.file;

    if (req.file) {
      if (planner.file) {
        deletePDF(planner.file);
      }
      filePath = `/public/planner/${req.file.filename}`;
    }

    const updatedPlanner = await prismaClient.academicPlanner.update({
      where: { id },
      data: {
        intake,
        semester,
        plannerCourseId:pla,
        academicYearId: acaId,
        file: filePath,
      },
    });

    res.json(
      new ApiResponse(200, updatedPlanner, "Academic planner updated successfully")
    );
  }
);


export const deleteAcademicPlanner = asyncHandler(
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    const planner = await prismaClient.academicPlanner.findUnique({
      where: { id },
    });

    if (!planner) {
      throw new ApiError(404, "Academic planner not found");
    }

    if (planner.file) {
      deletePDF(planner.file);
    }

    await prismaClient.academicPlanner.delete({
      where: { id },
    });

    res.json(
      new ApiResponse(200, null, "Academic planner deleted successfully")
    );
  }
);
