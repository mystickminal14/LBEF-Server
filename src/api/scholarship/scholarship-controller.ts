import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/apiError";
import { ApiResponse } from "../../utils/apiResponse";
import { prismaClient } from "../../server";
import { ScholarshipScheduleSchema } from "./scholarship-validate";

const addScholarshipSchedule = asyncHandler(
  async (req: Request, res: Response) => {
    const parsed = ScholarshipScheduleSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new ApiError(400, "Validation Failed", parsed.error.issues);
    }

    await prismaClient.scholarshipSchedule.updateMany({
      where: { status: "OPEN" },
      data: { status: "CLOSED" },
    });

    // Create the new schedule with status OPEN
    const schedule = await prismaClient.scholarshipSchedule.create({
      data: {
        ...parsed.data,
        status: "OPEN",
      },
    });

    return res
      .status(201)
      .json(new ApiResponse(201, schedule, "New scholarship schedule created and set as OPEN"));
  }
);
const updateScholarshipSchedule = asyncHandler(
  async (req: Request, res: Response) => {
    const parsed = ScholarshipScheduleSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new ApiError(400, "Validation Failed", parsed.error.issues);
    }

    const { id } = req.params;

    if (!id) {
      throw new ApiError(400, "Schedule ID is required in URL");
    }

    const schedule = await prismaClient.scholarshipSchedule.update({
      where: { id: Number(id) },
      data: parsed.data, 
    });

    return res
      .status(200)
      .json(
        new ApiResponse(200, schedule, "Scholarship schedule updated successfully")
      );
  }
);


const changeScholarshipStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { id, status } = req.body as { id: number; status: "OPEN" | "CLOSED" };

    if (!id || !status) {
      throw new ApiError(400, "ID and status are required");
    }

    if (status === "OPEN") {
      // Close all other schedules
      await prismaClient.scholarshipSchedule.updateMany({
        where: { status: "OPEN" },
        data: { status: "CLOSED" },
      });
    }

    // Update this schedule
    const schedule = await prismaClient.scholarshipSchedule.update({
      where: { id },
      data: { status },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, schedule, `Scholarship schedule status changed to ${status}`));
  }
);
export const getAllScholaship= asyncHandler(async (_req: Request, res: Response) => {
  const schedule = await prismaClient.scholarshipSchedule.findMany();
  return res
    .status(200)
    .json(new ApiResponse(200, schedule, "scholarship schedule fetched successfully"));
});
const getScholarshipSchedule = asyncHandler(async (_req: Request, res: Response) => {
  const schedule = await prismaClient.scholarshipSchedule.findFirst({
    where: { status: "OPEN" },
  });



  return res
    .status(200)
    .json(new ApiResponse(200, schedule, "Current open scholarship schedule fetched successfully"));
});

export {
  addScholarshipSchedule,
  getScholarshipSchedule,updateScholarshipSchedule,
  changeScholarshipStatus,
};