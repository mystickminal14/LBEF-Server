// import { Request, Response } from "express";
// import { asyncHandler } from "../../utils/asyncHandler";
// import {
//   BulkCreateFilesSchema,
//   CreateFileSchema,
//   CreateParentSchema,
// } from "./fee.planner.validation";
// import { ApiError } from "../../utils/apiError";
// import { prismaClient } from "../../server";
// import { ApiResponse } from "../../utils/apiResponse";
// import { deletePDF } from "../../utils/deletepdf";

// export const createSession = asyncHandler(async (req, res) => {
//   const parsed = CreateParentSchema.safeParse(req.body);
//   if (!parsed.success)
//     throw new ApiError(400, "Validation failed", parsed.error.issues);

//   const parent = await prismaClient.feePlanner.create({
//     data: {
//       type: "PARENT",
//       year: parsed.data.year,
//       session: parsed.data.session,
//     },
//   });

//   res
//     .status(201)
//     .json(new ApiResponse(201, parent, "Session created successfully"));
// });

// export const createSessionFile = asyncHandler(async (req, res) => {
//   const parsed = CreateFileSchema.safeParse(req.body);
//   if (!parsed.success)
//     throw new ApiError(400, "Validation failed", parsed.error.issues);
//   const { parentId, semester, plannerCourseId } = parsed.data;
//   const parent = await prismaClient.feePlanner.findUnique({
//     where: { id: parentId },
//   });
//   if (!parent || parent.type !== "PARENT") {
//     throw new ApiError(400, "Invalid parent session");
//   }
//   if (!req.file) throw new ApiError(400, "No file provided");
//   const filename = req.file.filename;
//   const file = `/public/fee-planner/${filename}`;
//   const data = {
//     type: "CHILD" as const,
//     parentId,
//     semester: semester,
//     plannerCourseId: plannerCourseId,
//     file: `/public/fee-planner/${file}`,
//   };
//   await prismaClient.feePlanner.create({ data });
//   res.status(201).json(new ApiResponse(201, null, "Files added successfully"));
// });

// export const addMultipleFiles = asyncHandler(async (req, res) => {
//   const files = req.files as Express.Multer.File[];

//   if (!files || files.length === 0) {
//     throw new ApiError(400, "No files uploaded");
//   }

//   // parse body manually
//   const body = {
//     parentId: Number(req.body.parentId),
//     records: req.body.records ? JSON.parse(req.body.records as string) : [],
//   };

//   const parsed = BulkCreateFilesSchema.safeParse(body);

//   if (!parsed.success) {
//     console.log("Validation issues:", parsed.error.issues); // optional debug
//     throw new ApiError(400, "Validation failed", parsed.error.issues);
//   }

//   const { parentId, records } = parsed.data;

//   if (records.length !== files.length) {
//     throw new ApiError(400, "Each record must have exactly one file");
//   }

//   const parent = await prismaClient.feePlanner.findUnique({
//     where: { id: parentId },
//   });

//   if (!parent || parent.type !== "PARENT") {
//     throw new ApiError(400, "Invalid parent session");
//   }

//   const data = records.map((record, index) => ({
//     type: "CHILD" as const,
//     parentId,
//     semester: record.semester,
//     plannerCourseId: record.plannerCourseId,
//     file: `/public/fee-planner/${files[index].filename}`,
//     session: parent.session,
//   }));

//   await prismaClient.feePlanner.createMany({ data });

//   res
//     .status(201)
//     .json(new ApiResponse(201, null, "Files uploaded successfully"));
// });
// export const getChildrenByParentId = asyncHandler(
//   async (req: Request, res: Response) => {
//     const id = Number(req.params.id);

//     const children = await prismaClient.feePlanner.findMany({
//       where: { parentId: id },
//       include: {
//         plannerCourse: true,
//       },
//       orderBy: { year: "desc" },
//     });

//     res.json(new ApiResponse(200, children, "Children fetched successfully"));
//   }
// );

// export const deleteChild = asyncHandler(async (req, res) => {
//   const id = Number(req.params.id);

//   const child = await prismaClient.feePlanner.findUnique({
//     where: { id },
//   });

//   if (!child || child.type !== "CHILD") {
//     throw new ApiError(404, "Child record not found");
//   }

//   // delete PDF
//   if (child.file) {
//     deletePDF(child.file);
//   }

//   // delete DB row
//   await prismaClient.feePlanner.delete({
//     where: { id },
//   });

//   res.json(new ApiResponse(200, null, "Child deleted successfully"));
// });
// export const deleteParentWithChildren = asyncHandler(async (req, res) => {
//   const parentId = Number(req.params.id);

//   const parent = await prismaClient.feePlanner.findUnique({
//     where: { id: parentId },
//     include: {
//       children: true,
//     },
//   });

//   if (!parent || parent.type !== "PARENT") {
//     throw new ApiError(404, "Parent session not found");
//   }

//   parent.children.forEach((child) => {
//     if (child.file) {
//       deletePDF(child.file);
//     }
//   });

//   await prismaClient.$transaction(async (tx) => {
//     await tx.feePlanner.deleteMany({
//       where: { parentId },
//     });

//     await tx.feePlanner.delete({
//       where: { id: parentId },
//     });
//   });

//   res.json(
//     new ApiResponse(
//       200,
//       { deletedChildren: parent.children.length },
//       "Parent and all children deleted successfully"
//     )
//   );
// });
// export const editSession = asyncHandler(async (req, res) => {
//   const id = Number(req.params.id);
//   const parsed = CreateParentSchema.safeParse(req.body);

//   if (!parsed.success)
//     throw new ApiError(400, "Validation failed", parsed.error.issues);

//   const parent = await prismaClient.feePlanner.findUnique({ where: { id } });
//   if (!parent || parent.type !== "PARENT")
//     throw new ApiError(404, "Parent not found");

//   const updated = await prismaClient.feePlanner.update({
//     where: { id },
//     data: { session: parsed.data.session, year: parsed.data.year },
//   });

//   res.json(new ApiResponse(200, updated, "Session updated"));
// });
// export const getParents = asyncHandler(async (_req, res) => {
//   const data = await prismaClient.feePlanner.findMany({
//     where: { type: "PARENT" },
//     orderBy: { year: "desc" },
//   });
//   res.json(new ApiResponse(200, data));
// });

// export const getParentWithChildren = asyncHandler(async (req, res) => {
//   const id = Number(req.params.id);

//   const children = await prismaClient.feePlanner.findMany({
//     where: { parentId: null },
//     orderBy: { year: "desc" },
//     include: { children: true, plannerCourse: true },
//   });

//   res.json(new ApiResponse(200, children, "Children fetched successfully"));
// });
