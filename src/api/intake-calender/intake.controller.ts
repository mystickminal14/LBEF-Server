import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/apiError";
import { prismaClient } from "../../server";
import { ApiResponse } from "../../utils/apiResponse";
import { IntakeSchema } from "./intake.validation";

const addIntake = asyncHandler(async (req: Request, res: Response) => {
  const parsed = IntakeSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "Validation Failed", parsed.error.issues);
  }

  const { status, intake, duration, lastdate } = parsed.data;

  const user = await prismaClient.admissionIntake.create({
    data: { status, intake, duration, lastdate ,lastDateStatus:"ENABLED"},
  });

  return res
    .status(201)
    .json(new ApiResponse(201, user, "Intake calender added successfully"));
});

const editIntake = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;
  const { status, intake, duration, lastdate } = req.body;

  const checkUser = await prismaClient.admissionIntake.findUnique({
    where: { id: parseInt(id) },
  });
  if (!checkUser) throw new ApiError(400, "Intake Calender not found!");

  const updated = await prismaClient.admissionIntake.update({
    where: { id: parseInt(id) },
    data: { status, intake, duration, lastdate },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updated, "Intake Calender updated successfully"));
});

const getIntake = asyncHandler(async (req: Request, res: Response) => {
  const intakes = await prismaClient.admissionIntake.findMany();

  const sorted = intakes.sort((a, b) => {
    if (a.status === "OPEN" && b.status !== "OPEN") return -1;
    if (a.status !== "OPEN" && b.status === "OPEN") return 1;
    return 0;
  });

  const result = sorted.map(({ lastdate, lastDateStatus, ...rest }) => {
    if (lastDateStatus === "DISABLED") {
      return { ...rest, lastDateStatus };           // lastdate completely omitted
    }
    return { ...rest, lastDateStatus, lastdate };   // lastdate included
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Intake Calendar fetched successfully"));
});
// ─── Toggle Last Date Visibility ──────────────────────────────────────────────
const toggleLastDate = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  const intake = await prismaClient.admissionIntake.findUnique({ where: { id } });
  if (!intake) throw new ApiError(404, "Intake Calender not found");

  const newStatus = intake.lastDateStatus === "ENABLED" ? "DISABLED" : "ENABLED";

  const updated = await prismaClient.admissionIntake.update({
    where: { id },
    data: { lastDateStatus: newStatus },
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updated,
        `Last date ${newStatus === "ENABLED" ? "shown" : "hidden"} successfully`
      )
    );
});

const deleteIntake = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  const intake = await prismaClient.admissionIntake.findUnique({ where: { id } });
  if (!intake) throw new ApiError(404, "Intake Calender not found");

  await prismaClient.admissionIntake.delete({ where: { id } });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Intake Calender deleted successfully"));
});

export { addIntake, editIntake, getIntake, toggleLastDate, deleteIntake };