import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/apiError";
import { ApiResponse } from "../../utils/apiResponse";
import { prismaClient } from "../../server";
import { ScholarshipScheduleSchema } from "./scholarship-validate";


const upsertScholarshipSchedule = asyncHandler(
  async (req: Request, res: Response) => {
    const parsed = ScholarshipScheduleSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new ApiError(400, "Validation Failed", parsed.error.issues);
    }

    const schedule = await prismaClient.scholarshipSchedule.upsert({
      where: { id: 1 },
      create: {
        id: 1,
        ...parsed.data,
      },
      update: parsed.data,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          schedule,
          "Scholarship schedule saved successfully"
        )
      );
  }
);

const getScholarshipSchedule = asyncHandler(
  async (_req: Request, res: Response) => {
    const schedule = await prismaClient.scholarshipSchedule.findUnique({
      where: { id: 1 },
    });

    if (!schedule) {
      throw new ApiError(404, "Scholarship schedule not found");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          schedule,
          "Scholarship schedule fetched successfully"
        )
      );
  }
);

export {
  upsertScholarshipSchedule,
  getScholarshipSchedule,
};
