import { asyncHandler } from "../../utils/asyncHandler";
import { Request, Response } from "express";
import { ApiError } from "../../utils/apiError";
import { prismaClient } from "../../server";
import { ApiResponse } from "../../utils/apiResponse";
import { deleteCourseImage } from "../../utils/deleteImage";

const HOLIDAY_TYPES = ["ADMINISTRATIVE", "ACADEMIC"] as const;
type HolidayType = (typeof HOLIDAY_TYPES)[number];

const createHoliday = asyncHandler(async (req: Request, res: Response) => {
  const type = req.body.type as HolidayType;
  if (!HOLIDAY_TYPES.includes(type)) {
    throw new ApiError(400, `Invalid type. Allowed types: ${HOLIDAY_TYPES.join(", ")}`);
  }

  const existingHoliday = await prismaClient.holiday.findUnique({
    where: { type },
  });

  if (existingHoliday) {
    throw new ApiError(400, `Holiday with type ${type} already exists`);
  }

  if (!req.file) throw new ApiError(400, "No image file provided");
  const filename = req.file.filename;
  const imageUrl = `/public/temp/${filename}`;

  const holiday = await prismaClient.holiday.create({
    data: { type, image: imageUrl },
  });

  res
    .status(201)
    .json(new ApiResponse(201, holiday, "Holiday created successfully"));
});

const getAllHolidays = asyncHandler(async (_req: Request, res: Response) => {
  const holidays = await prismaClient.holiday.findMany({
    orderBy: { createdAt: "desc" },
  });

  res
    .status(200)
    .json(new ApiResponse(200, holidays, "All holidays fetched successfully"));
});


const getHolidayByType = asyncHandler(async (req: Request, res: Response) => {
  const type = req.query.type as HolidayType;
  if (!type || !HOLIDAY_TYPES.includes(type)) {
    throw new ApiError(400, `Invalid or missing type. Allowed types: ${HOLIDAY_TYPES.join(", ")}`);
  }

  const holiday = await prismaClient.holiday.findUnique({
    where: { type },
  });

  if (!holiday) throw new ApiError(404, "Holiday not found");

  res
    .status(200)
    .json(new ApiResponse(200, holiday, `Holiday of type ${type} fetched successfully`));
});


const deleteHoliday = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  const holiday = await prismaClient.holiday.findUnique({ where: { id } });
  if (!holiday) throw new ApiError(404, "Holiday not found");

  if (holiday.image) deleteCourseImage(holiday.image);

  await prismaClient.holiday.delete({ where: { id } });

  res
    .status(200)
    .json(new ApiResponse(200, null, "Holiday deleted successfully"));
});

export { createHoliday, getAllHolidays, getHolidayByType, deleteHoliday };
