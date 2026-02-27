import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { CourseSchema } from "./course.validation";
import { ApiError } from "../../utils/apiError";
import { prismaClient } from "../../server";
import { ApiResponse } from "../../utils/apiResponse";
import { deleteCourseImage } from "../../utils/deleteImage";
import { paginationSchema } from "../../validation/pagination.validation";


const addCourse = asyncHandler(async (req: Request, res: Response) => {
  const parsed = CourseSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "Validation Failed", parsed.error.issues);
  }

  const {
    title,
    shift,
    credit,
    intake,
    brochure,
    duration,
    degree,
    prefix,
    details,feeStructure,slug,
    categoryId,fullForm,
    semester,
  } = parsed.data;

  const existingCourse = await prismaClient.course.findUnique({
    where: { title },
  });

  if (existingCourse) {
    throw new ApiError(400, "Course already exists");
  }

  const lastCourse = await prismaClient.course.findFirst({
    orderBy: { order: "desc" },
    select: { order: true },
  });

  const nextOrder = (lastCourse?.order ?? 0) + 1;

  const course = await prismaClient.course.create({
    data: {
      title,
      details,
      shift,
      degree,
      prefix,fullForm, intake,slug,
    brochure,feeStructure,
      credit,
      duration: duration ?? "",
      categoryId: categoryId ?? "",
      semester: semester ?? "",
      order: nextOrder,
    },
  });

  res
    .status(201)
    .json(new ApiResponse(201, course, "Course Added Successfully"));
});


const editCourse = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  const parsed = CourseSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "Validation Failed", parsed.error.issues);
  }

  const {
    title,
    shift,
    credit,
    duration, intake,
    brochure,feeStructure,
    categoryId,slug,
    degree,
    prefix,fullForm,
    details,
    semester,
  } = parsed.data;

  const existingCourse = await prismaClient.course.findUnique({
    where: { id },
  });

  if (!existingCourse) {
    throw new ApiError(404, "Course does not exist");
  }

  const updatedCourse = await prismaClient.course.update({
    where: { id },
    data: {
      title,feeStructure,
      degree, intake,
    brochure,
      details,slug,
      prefix,fullForm,
      shift,
      credit,
      duration: duration ?? "",
      categoryId: categoryId ?? "",
      semester: semester ?? "",
    },
  });

  res
    .status(200)
    .json(new ApiResponse(200, updatedCourse, "Course Updated Successfully"));
});


const getCourseName = asyncHandler(async (_req: Request, res: Response) => {
  const course = await prismaClient.course.findMany({
    select: {
      prefix: true,
      title: true,
    },
    orderBy: { order: "asc" },
  });

  res
    .status(200)
    .json(new ApiResponse(200, course, "Course fetched Successfully"));
});

const getCourse = asyncHandler(async (req: Request, res: Response) => {
  const parsed = paginationSchema.safeParse(req.query);
  if (!parsed.success) {
    throw new ApiError(400, "Validation Failed", parsed.error.issues);
  }

  const { page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  // Search
  let search = req.query.search?.toString().toLowerCase().trim() || "";
  const searchWords = search.split(" ").filter(Boolean);

  const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;

  const searchFilter = {
    AND: [
      // Search filter
      ...(searchWords.length
        ? searchWords.map((word) => ({
            OR: [
              { prefix: { contains: word, mode: "insensitive" } },
              { title: { contains: word, mode: "insensitive" } },
            ],
          }))
        : []),
      // Category filter
      ...(categoryId ? [{ categoryId }] : []),
    ],
  };

  const courses = await prismaClient.course.findMany({
    where: searchFilter,
    skip,
    take: limit,
    orderBy: [
      { order: "asc" },       // manual order
      { createdAt: "desc" },  // latest first
    ],
  });

  const coursesWithBlockInfo = await Promise.all(
    courses.map(async (course) => {
      const totalBlocks = await prismaClient.courseDetailBlock.count({
        where: { courseId: course.id },
      });

      return {
        ...course,
        blockCount: totalBlocks,
        hasDetails: totalBlocks > 0,
        blocks: undefined,
      };
    })
  );

  const total = await prismaClient.course.count({ where: searchFilter });
  const totalPages = Math.ceil(total / limit);

  const pagination = {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };

  return res.status(200).json(
    new ApiResponse(
      200,
      coursesWithBlockInfo,
      "Courses fetched successfully",
      pagination
    )
  );
});
const getAllCourse = asyncHandler(async (_req: Request, res: Response) => {
  const courses = await prismaClient.course.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  res
    .status(200)
    .json(new ApiResponse(200, courses, "Courses fetched successfully"));
});


const updateCourseImage = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  if (!req.file) throw new ApiError(400, "No image file provided");

  const course = await prismaClient.course.findUnique({ where: { id } });
  if (!course) throw new ApiError(404, "Course not found");

  const filename = req.file.filename;
  const imageUrl = `/public/courses/${filename}`;

  if (course.image) {
    deleteCourseImage(course.image);
  }

  const updatedCourse = await prismaClient.course.update({
    where: { id },
    data: { image: imageUrl },
  });

  res
    .status(200)
    .json(
      new ApiResponse(200, updatedCourse, "Course image updated successfully")
    );
});


const uploadImage = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  if (!req.file) throw new ApiError(400, "No image file provided");

  const filename = req.file.filename;
  const imageUrl = `/public/courses/${filename}`;

  const course = await prismaClient.course.findUnique({ where: { id } });

  if (!course) throw new ApiError(404, "Course not found");
  if (course.image) throw new ApiError(400, "Image already exists");

  const updatedCourse = await prismaClient.course.update({
    where: { id },
    data: { image: imageUrl },
  });

  res
    .status(200)
    .json(new ApiResponse(200, updatedCourse, "Image uploaded successfully"));
});


const deleteCourse = asyncHandler(async (req: Request, res: Response) => {
  const courseId = Number(req.params.id);

  const course = await prismaClient.course.findUnique({
    where: { id: courseId },
    select: { order: true },
  });

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  const deletedOrder = course.order ?? 0;

  await prismaClient.$transaction(async (tx) => {
    await tx.course.delete({ where: { id: courseId } });

    await tx.course.updateMany({
      where: { order: { gt: deletedOrder } },
      data: { order: { decrement: 1 } },
    });
  });

  res.json(new ApiResponse(200, null, "Course deleted successfully"));
});

const changeCourseOrder = asyncHandler(async (req: Request, res: Response) => {
  const courseId = Number(req.params.id);
  const { newOrder } = req.body;

  if (typeof newOrder !== "number" || newOrder < 1) {
    throw new ApiError(400, "Invalid new order value");
  }

  const course = await prismaClient.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  const oldOrder = course.order ?? 0;

  if (oldOrder === newOrder) {
    return res.status(200).json(
      new ApiResponse(200, course, "Order unchanged")
    );
  }

  await prismaClient.$transaction(async (tx) => {
    // Moving DOWN (e.g. 2 → 5)
    if (newOrder > oldOrder) {
      await tx.course.updateMany({
        where: {
          order: {
            gt: oldOrder,
            lte: newOrder,
          },
        },
        data: {
          order: { decrement: 1 },
        },
      });
    }

    // Moving UP (e.g. 5 → 2)
    if (newOrder < oldOrder) {
      await tx.course.updateMany({
        where: {
          order: {
            gte: newOrder,
            lt: oldOrder,
          },
        },
        data: {
          order: { increment: 1 },
        },
      });
    }

    await tx.course.update({
      where: { id: courseId },
      data: { order: newOrder },
    });
  });

  res.status(200).json(
    new ApiResponse(200, null, "Course order updated successfully")
  );
});
const copyCourse = asyncHandler(async (req: Request, res: Response) => {
  const courseId = Number(req.params.id);

  const sourceCourse = await prismaClient.course.findUnique({
    where: { id: courseId },
  });

  if (!sourceCourse) {
    throw new ApiError(404, "Source course not found");
  }

  await prismaClient.$transaction(async (tx) => {
    
    const lastCourse = await tx.course.findFirst({
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const newOrder = (lastCourse?.order ?? 0) + 1;

    const newCourse = await tx.course.create({
      data: {
        title: `${sourceCourse.title} (Copy)`,
        shift: sourceCourse.shift,
        credit: sourceCourse.credit,
        intake: sourceCourse.intake,
        brochure: sourceCourse.brochure,
        duration: sourceCourse.duration,
        degree: sourceCourse.degree,
        prefix: sourceCourse.prefix,
        fullForm: sourceCourse.fullForm,
        details: sourceCourse.details,
        feeStructure: sourceCourse.feeStructure,
        categoryId: sourceCourse.categoryId,
        semester: sourceCourse.semester,
        image: sourceCourse.image,
        order: newOrder,
      },
    });

    // -----------------------------
    // 2️⃣ Copy all detail blocks
    // -----------------------------
    const blocks = await tx.courseDetailBlock.findMany({
      where: { courseId },
      orderBy: { order: "asc" },
    });

    const idMap: Record<number, number> = {};

    for (const block of blocks) {
      const created = await tx.courseDetailBlock.create({
        data: {
          courseId: newCourse.id,
          parentId: block.parentId ? idMap[block.parentId] : null,
          title: block.title,
          category: block.category,
          content: block.content,
          type: block.type,
          order: block.order,
        },
      });

      idMap[block.id] = created.id;
    }
  });

  res.status(201).json(
    new ApiResponse(201, null, "Course duplicated successfully")
  );
});

export {
  addCourse,
  getCourse,
  getCourseName,
  changeCourseOrder,
  uploadImage,
  getAllCourse,
  updateCourseImage,
  editCourse,
  deleteCourse,copyCourse
};
