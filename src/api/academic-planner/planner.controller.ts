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
    console.log("=== CREATE ACADEMIC PLANNER CALLED ===");
    console.log("Current time:", new Date().toISOString());
    
    const parsed = CreateAcademicPlannerSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new ApiError(400, "Validation failed", parsed.error.issues);
    }

    const { academicYearId, semester, plannerCourseId, intake } = parsed.data;
    
    console.log("Received data:", { academicYearId, semester, plannerCourseId, intake });
    
    if (!req.file) throw new ApiError(400, "No file provided");
    
    const filename = req.file.filename;
    const file = `/public/planner/${filename}`;
    
    const acaId = Number(academicYearId);
    const plaId = plannerCourseId ? Number(plannerCourseId) : null;
    
    console.log("Converted IDs:", { acaId, plaId });
    
    // Check if Academic Year exists
    const academicYearExists = await prismaClient.academicYear.findUnique({
      where: { id: acaId },
    });
    if (!academicYearExists) {
      throw new ApiError(404, "Academic Year not found");
    }
    console.log("Academic year exists:", academicYearExists);
    
    // Check if Planner Course exists
    if (plaId) {
      const coursePlanner = await prismaClient.plannerCourse.findUnique({
        where: { id: plaId },
      });
      if (!coursePlanner) {
        throw new ApiError(404, "Planner course not found");
      }
      console.log("Planner course exists:", coursePlanner);
    }
  
    console.log("Checking for duplicates with:", {
      semester,
      plannerCourseId: plaId,
      academicYearId: acaId
    });
    
    const semesterCheck = await prismaClient.academicPlanner.findFirst({
      where: { 
        semester: semester,
        ...(plaId ? { plannerCourseId: plaId } : { plannerCourseId: null }),
        academicYearId: acaId
      },
    });

    console.log("Duplicate check result:", semesterCheck);

    if (semesterCheck) {
      console.log("DUPLICATE FOUND - Throwing error");
      throw new ApiError(400, `Academic Planner for semester "${semester}" already exists for academic year ${acaId} with course ${plaId}`);
    }

    // Create the academic planner
    console.log("Creating new academic planner...");
    const academicPlanner = await prismaClient.academicPlanner.create({
      data: { 
        intake, 
        semester, 
        plannerCourseId: plaId, 
        academicYearId: acaId, 
        file: file 
      },
    });

    console.log("Created successfully:", academicPlanner);

    res
      .status(201)
      .json(
        new ApiResponse(
          201,
          academicPlanner,
          "Academic Semester created successfully",
        ),
      );
  },
);
export const getAcademicPlannersPagination = asyncHandler(
  async (req: Request, res: Response) => {
    const parsed = paginationSchema.safeParse(req.query);
  console.log("cjecl")
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
    console.log("=== UPDATE ACADEMIC PLANNER CALLED ===");
    
    const id = Number(req.params.id);
    console.log("Updating planner ID:", id);

    const parsed = CreateAcademicPlannerSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, "Validation failed", parsed.error.issues);
    }

    const { academicYearId, plannerCourseId, semester, intake } = parsed.data;
    console.log("Update data:", { academicYearId, plannerCourseId, semester, intake });
    
    const acaId = Number(academicYearId);
    const plaId = plannerCourseId ? Number(plannerCourseId) : null;
    console.log("Converted IDs:", { acaId, plaId });

    const planner = await prismaClient.academicPlanner.findUnique({
      where: { id },
    });

    if (!planner) {
      throw new ApiError(404, "Academic planner not found");
    }
    console.log("Existing planner:", planner);

    // Check if Planner Course exists
    if (plaId) {
      const coursePlanner = await prismaClient.plannerCourse.findUnique({
        where: { id: plaId },
      });
      if (!coursePlanner) {
        throw new ApiError(404, "Planner course not found");
      }
      console.log("Planner course exists:", coursePlanner);
    }

    // Check for duplicate
    console.log("Checking for duplicates with:", {
      semester,
      plannerCourseId: plaId,
      academicYearId: acaId,
      excludingId: id
    });
    
    const semesterCheck = await prismaClient.academicPlanner.findFirst({
      where: {
        semester: semester,
        academicYearId: acaId,
        ...(plaId ? { plannerCourseId: plaId } : { plannerCourseId: null }),
        NOT: { id },
      },
    });

    console.log("Duplicate check result:", semesterCheck);

    if (semesterCheck) {
      throw new ApiError(409, `Academic Planner for semester "${semester}" already exists for academic year ${acaId} with course ${plaId}`);
    }

    let filePath = planner.file;
    console.log("Current file path:", filePath);

    if (req.file) {
      console.log("New file uploaded:", req.file.filename);
      if (planner.file) {
        console.log("Deleting old file:", planner.file);
        deletePDF(planner.file);
      }
      filePath = `/public/planner/${req.file.filename}`;
    }

    console.log("Final file path:", filePath);

    const updatedPlanner = await prismaClient.academicPlanner.update({
      where: { id },
      data: {
        intake,
        semester,
        plannerCourseId: plaId,
        academicYearId: acaId,
        file: filePath,
      },
    });

    console.log("Updated successfully:", updatedPlanner);

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
