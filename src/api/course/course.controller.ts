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
  const { title, shift, credit, duration, degree, prefix,   details,category, semester } =
    parsed.data;

  const existingCourse = await prismaClient.course.findUnique({
    where: { title },
  });

  if (existingCourse) {
    throw new ApiError(400, "Course already exists");
  }

  const course = await prismaClient.course.create({
    data: {
      title,  details,
      shift,
      degree,
      prefix,
      credit,
      duration: duration ?? "",
      category: category ?? "",
      semester: semester ?? "",
    },
  });

  res
    .status(201)
    .json(new ApiResponse(201, course, "Course Added Successfully"));
});
const editCourse = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;
  console.log(req.body);
  const parsed = CourseSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "Validation Failed", parsed.error.issues);
  }

  const { title, shift, credit, duration, category, degree, prefix, details,semester } =
    parsed.data;

  const existingCourse = await prismaClient.course.findUnique({
    where: { id: parseInt(id) },
  });

  if (!existingCourse) {
    throw new ApiError(404, "Course does not exist");
  }

  const updatedCourse = await prismaClient.course.update({
    where: { id: parseInt(id) },
    data: {
      title,
      degree,
      details,
      prefix,
      shift,
      credit,
      duration: duration ?? "",
      category: category ?? "",
      semester: semester ?? "",
    },
  });

  res
    .status(200)
    .json(new ApiResponse(200, updatedCourse, "Course Updated Successfully"));
});
const getCourseName=asyncHandler(async (req: Request, res: Response) => {
  const course=await prismaClient.course.findMany({
    select:{
      prefix:true,
      title:true,
    }
  })

  res.status(200).json(new ApiResponse(200, course, "Course fetched Successfully"));
})
const getCourse = asyncHandler(async (req: Request, res: Response) => {
  const parsed = paginationSchema.safeParse(req.query);
  if (!parsed.success) {
    throw new ApiError(400, "Validation Failed", parsed.error.issues);
  }
  const { page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  let search = req.query.search?.toString().toLowerCase().trim() || "";
  const searchWords = search.split(' ').filter(Boolean);

  const searchFilter = searchWords.length
    ? {
        AND: searchWords.map((word) => ({
          OR: [
            { prefix: { contains: word } },
            { title: { contains: word } },
            { category: { contains: word } },
          ],
        })),
      }
    : {};

  const courses = await prismaClient.course.findMany({
    where: searchFilter,
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
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

  const total = await prismaClient.course.count({
    where: searchFilter,
  });

  const totalPages = Math.ceil(total / limit);

  const pagination = {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        coursesWithBlockInfo,
        "Courses fetched successfully",
        pagination
      )
    );
});

const getAllCourse = asyncHandler(async (req: Request, res: Response) => {
  const courses = await prismaClient.course.findMany({
    orderBy: { createdAt: "desc" },
  });

  const total = await prismaClient.course.count();

  return res
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
  const id = req.params.id;

  if (!req.file) throw new ApiError(400, "No image file provided");

  const filename = req.file.filename;
  const imageUrl = `/public/courses/${filename}`;

  const course = await prismaClient.course.findUnique({
    where: { id: parseInt(id) },
  });

  if (course?.image) {
    throw new ApiError(400, "Image already exists");
  }

  if (!course) throw new ApiError(404, "Course not found");

  const updatedCourse = await prismaClient.course.update({
    where: { id: parseInt(id) },
    data: { image: imageUrl },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updatedCourse, "Image uploaded successfully"));
});
const deleteCourse = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const course = await prismaClient.course.findUnique({
    where: { id },
  });

  if (!course) throw new ApiError(404, "Course not found");

  if (course.image) {
    deleteCourseImage(course.image);
  }

  await prismaClient.courseDetailBlock.deleteMany({
    where: { courseId: id },
  });

  await prismaClient.course.delete({
    where: { id },
  });

  res
    .status(200)
    .json(new ApiResponse(200, null, "Course deleted successfully"));
});

export {
  addCourse,
  getCourse,
  getCourseName,
  uploadImage,
  getAllCourse,
  updateCourseImage,
  editCourse,
  deleteCourse,
};
