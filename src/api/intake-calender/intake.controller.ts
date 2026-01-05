import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/apiError";
import { prismaClient } from "../../server";
import { ApiResponse } from "../../utils/apiResponse";
import bcrypt from "bcryptjs";
import { IntakeSchema } from "./intake.validation";

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
    
    orderBy: { createdAt: "desc" },
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, users, "Intake Calender successfully")
    );
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
