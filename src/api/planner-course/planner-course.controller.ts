import {  Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/apiError";
import { prismaClient } from "../../server";
import { ApiResponse } from "../../utils/apiResponse";
import { paginationSchema } from "../../validation/pagination.validation";
import { PlannerCourseSchema } from "./planner-course.validation";

 const addPlannerCourse= asyncHandler(async (req: Request, res: Response) => {
  const parsed = PlannerCourseSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "Validation Failed", parsed.error.issues);
  }
  const { name,  } = parsed.data;
  const existingUser = await prismaClient.plannerCourse.findUnique({
    where: { name },
  });
  if (existingUser) {
    throw new ApiError(400, "Course Already exists!!");
  }

  const PlannerCourse= await prismaClient.plannerCourse.create({
    data: { name },
  });
  return res
    .status(201)
    .json(new ApiResponse(201, PlannerCourse, "Course Added successfully"));
});

const editUser = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;
  const { name } = req.body;
  const checkUser = await prismaClient.plannerCourse.findUnique({
    where: { id: parseInt(id) },
  });
  if (!checkUser) throw new ApiError(404, "Course not found");
  const updated = await prismaClient.plannerCourse.update({
    where: { id: parseInt(id) },
    data: {name  },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updated, "Course Updated successfully"));
});


export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const users = await prismaClient.plannerCourse.findMany({
    orderBy: { createdAt: "desc" },
  });
  return res
    .status(200)
    .json(
      new ApiResponse(200, users, "Course List fetched successfully", )
    );
})

const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;
  const user = await prismaClient.plannerCourse.findUnique({
    where: { id: parseInt(id) },
  });
  if (!user) throw new ApiError(404, "Course not found");

  await prismaClient.plannerCourse.delete({ where: { id: parseInt(id) } });
  res.status(200).json(new ApiResponse(200, null, "Course deleted successfully"));
});


export {
  editUser,addPlannerCourse,
  deleteUser,
};
