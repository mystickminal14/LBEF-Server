import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/apiError";
import { prismaClient } from "../../server";
import { ApiResponse } from "../../utils/apiResponse";
import bcrypt from "bcryptjs";
import { IntakeSchema } from "./intake.validation";
import { EIntakeStatus } from "@prisma/client";

const addIntake = asyncHandler(async (req: Request, res: Response) => {
  const parsed = IntakeSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "Validation Failed", parsed.error.issues);
  }

  const { status, intake, duration, lastdate,  } = parsed.data;

 
  const user = await prismaClient.admissionIntake.create({
    data: { status, intake, duration, lastdate },
  });


  return res
    .status(201)
    .json(
      new ApiResponse(201, user, "Intake calender added successfully")
    );
});

const editIntake = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;
  const { status, intake, duration, lastdate,  } = req.body;
  const checkUser = await prismaClient.admissionIntake.findUnique({
    where: { id: parseInt(id) },
  });
  if (!checkUser) throw new ApiError(400, "Intake Calender not found!");
 
  const updated = await prismaClient.admissionIntake.update({
    where: { id: parseInt(id) },
    data: { status, intake, duration, lastdate, },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updated, "Intake Calender updated successfully"));
});

const getIntake = asyncHandler(async (req: Request, res: Response) => {
  const users = await prismaClient.admissionIntake.findMany({
    // Order OPEN first, then CLOSED
    orderBy: {
      status: 'asc', // default alphabetical: CLOSED < OPEN
    },
  });

  // If you want OPEN first and CLOSED second, we can sort manually
  const sortedUsers = users.sort((a, b) => {
    if (a.status === 'OPEN' && b.status !== 'OPEN') return -1;
    if (a.status !== 'OPEN' && b.status === 'OPEN') return 1;
    return 0;
  });

  return res
    .status(200)
    .json(new ApiResponse(200, sortedUsers, "Intake Calendar successfully"));
});

const deleteIntake = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  const intake = await prismaClient.admissionIntake.findUnique({ where: { id } });
  if (!intake) throw new ApiError(404, "Intake Calender not found");


  await prismaClient.admissionIntake.delete({ where: { id } });

  res
    .status(200)
    .json(new ApiResponse(200, null, "Intake Calender successfully"));
});


export {
  addIntake,
  editIntake,
  getIntake,
deleteIntake
};
