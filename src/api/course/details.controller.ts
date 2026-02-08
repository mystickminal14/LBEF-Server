import { Request, Response } from "express";
import { prismaClient } from "../../server";
import { ApiError } from "../../utils/apiError";
import { asyncHandler } from "../../utils/asyncHandler";
import { CourseDetailArraySchema } from "./details.validation";
import { ApiResponse } from "../../utils/apiResponse";
import { paginationSchema } from "../../validation/pagination.validation";

export interface CourseDetailBlockTree {
  id: number;
  title: string | null;
  type: "HEADING" | "SUBHEADING" | "PARAGRAPH" | "LIST";
  order: number;
  content: string | string[] | null;
  parentId: number | null;
  children: CourseDetailBlockTree[];
}

// Safely parse LIST content
const safeParseContent = (block: { type: string; content: string | string[] | null }) => {
  if (block.type === "LIST" && block.content) {
    try {
      return typeof block.content === "string" ? JSON.parse(block.content) : block.content;
    } catch (err) {
      console.error("Failed to parse LIST content:", block.content, err);
      return [];
    }
  }
  return block.content ?? null;
};

// Adjust sibling order starting from a specific order
const adjustSiblingOrders = async (
  courseId: number,
  parentId: number | null,
  startingOrder: number,
  excludeBlockId?: number
) => {
  await prismaClient.courseDetailBlock.updateMany({
    where: {
      courseId,
      parentId,
      id: excludeBlockId ? { not: excludeBlockId } : undefined,
      order: { gte: startingOrder },
    },
    data: {
      order: { increment: 1 },
    },
  });
};

/* ---------------------------------------------
   Add Course Details
--------------------------------------------- */
const addCourseDetails = asyncHandler(async (req: Request, res: Response) => {
  const courseId = Number(req.params.courseId);
  const parsed = CourseDetailArraySchema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, "Validation Failed", parsed.error.issues);

  const existingCourse = await prismaClient.course.findUnique({ where: { id: courseId } });
  if (!existingCourse) throw new ApiError(404, "Course does not exist");

  const blocks = parsed.data;

  // Recursive insert with order adjustment
  const insertBlock = async (block: typeof blocks[number], parentId: number | null = null) => {
    const siblingCount = await prismaClient.courseDetailBlock.count({ where: { courseId, parentId } });
    const order = block.order ?? siblingCount + 1;

    await adjustSiblingOrders(courseId, parentId, order);

    const saved = await prismaClient.courseDetailBlock.create({
      data: {
        courseId,
        parentId,
        title: block.title || null,
        content: block.type === "LIST" ? JSON.stringify(block.content) : block.content ?? null,
        type: block.type,
        order,
      },
    });

    if (block.children?.length > 0) {
      for (const child of block.children) await insertBlock(child, saved.id);
    }
  };

  for (const block of blocks) await insertBlock(block);

  res.status(201).json(new ApiResponse(201, blocks, "Course details added successfully!"));
});

/* ---------------------------------------------
   Edit Course Details
--------------------------------------------- */
const editCourseDetails = asyncHandler(async (req: Request, res: Response) => {
  const courseId = Number(req.params.courseId);
  const parsed = CourseDetailArraySchema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, "Validation Failed", parsed.error.issues);

  const existingCourse = await prismaClient.course.findUnique({ where: { id: courseId } });
  if (!existingCourse) throw new ApiError(404, "Course does not exist");

  const blocks = parsed.data;

  const upsertBlock = async (block: typeof blocks[number], parentId: number | null = null) => {
    let saved;
    const siblingCount = await prismaClient.courseDetailBlock.count({ where: { courseId, parentId } });
    const order = block.order ?? siblingCount + 1;

    if (block.id) {
      const existingBlock = await prismaClient.courseDetailBlock.findUnique({ where: { id: block.id } });
      if (!existingBlock) throw new ApiError(404, "Block not found");

      if (existingBlock.order !== order) {
        await adjustSiblingOrders(courseId, parentId, order, block.id);
      }

      saved = await prismaClient.courseDetailBlock.update({
        where: { id: block.id },
        data: {
          title: block.title || null,
          content: block.type === "LIST" ? JSON.stringify(block.content) : block.content ?? null,
          type: block.type,
          order,
          parentId,
        },
      });
    } else {
      await adjustSiblingOrders(courseId, parentId, order);

      saved = await prismaClient.courseDetailBlock.create({
        data: {
          courseId,
          parentId,
          title: block.title || null,
          content: block.type === "LIST" ? JSON.stringify(block.content) : block.content ?? null,
          type: block.type,
          order,
        },
      });
    }

    if (block.children?.length > 0) {
      for (const child of block.children) await upsertBlock(child, saved.id);
    }
  };

  for (const block of blocks) await upsertBlock(block);

  res.json(new ApiResponse(200, blocks, "Course details updated successfully!"));
});

/* ---------------------------------------------
   Get Course Details (Tree with order)
--------------------------------------------- */
const getCourseDetails = asyncHandler(async (req: Request, res: Response) => {
  const courseId = Number(req.params.courseId);
  const parsed = paginationSchema.safeParse(req.query);
  if (!parsed.success) throw new ApiError(400, "Validation Failed", parsed.error.issues);

  const { page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  const existingCourse = await prismaClient.course.findUnique({ where: { id: courseId } });
  if (!existingCourse) throw new ApiError(404, "Course not found");

  // Paginated root blocks
  const rootBlocks = await prismaClient.courseDetailBlock.findMany({
    where: { courseId, parentId: null },
    orderBy: { order: "asc" },
    skip,
    take: limit,
  });

  const rootIds = rootBlocks.map((b) => b.id);

  // Fetch all blocks for tree
  const allBlocks = await prismaClient.courseDetailBlock.findMany({
    where: { courseId },
    orderBy: { order: "asc" },
  });

  // Build map
  const map: Record<number, CourseDetailBlockTree> = {};
  allBlocks.forEach((block) => {
    map[block.id] = {
      id: block.id,
      title: block.title,
      type: block.type as any,
      order: block.order,
      content: safeParseContent(block),
      parentId: block.parentId,
      children: [],
    };
  });

  // Build tree
  allBlocks.forEach((block) => {
    if (block.parentId && map[block.parentId]) {
      map[block.parentId].children.push(map[block.id]);
    }
  });

  const tree = rootIds.map((id) => map[id]).filter(Boolean);

  const total = await prismaClient.courseDetailBlock.count({ where: { courseId, parentId: null } });
  const totalPages = Math.ceil(total / limit);

  const pagination = {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };

  res.json(new ApiResponse(200, tree, "Course details fetched successfully!", pagination));
});

/* ---------------------------------------------
   Update Single Block
--------------------------------------------- */
const updateBlock = asyncHandler(async (req: Request, res: Response) => {
  const blockId = parseInt(req.params.id);
  const { type, title, content, order, parentId } = req.body;

  const existingBlock = await prismaClient.courseDetailBlock.findUnique({ where: { id: blockId } });
  if (!existingBlock) throw new ApiError(404, "Block not found");

  let processedContent: any = null;
  if (type === "LIST" && Array.isArray(content)) processedContent = JSON.stringify(content);
  else if (type === "PARAGRAPH" && typeof content === "string") processedContent = content;
  else if (type === "HEADING" || type === "SUBHEADING") processedContent = null;

  // Adjust sibling order if order changed
  if (order !== undefined && order !== existingBlock.order) {
    await adjustSiblingOrders(existingBlock.courseId, existingBlock.parentId, order, blockId);
  }

  const updatedBlock = await prismaClient.courseDetailBlock.update({
    where: { id: blockId },
    data: {
      ...(type && { type }),
      ...(title !== undefined && { title }),
      ...(processedContent !== undefined && { content: processedContent }),
      ...(order !== undefined && { order }),
      ...(parentId !== undefined && { parentId }),
    },
    include: { children: true },
  });

  res.status(200).json(new ApiResponse(200, updatedBlock, "Block updated successfully"));
});

/* ---------------------------------------------
   Delete Block
--------------------------------------------- */
const deleteBlock = asyncHandler(async (req: Request, res: Response) => {
  const blockId = parseInt(req.params.id);
  const existingBlock = await prismaClient.courseDetailBlock.findUnique({
    where: { id: blockId },
    select: { parentId: true, order: true, courseId: true },
  });

  if (!existingBlock) throw new ApiError(404, "Block not found");

  const { parentId, order: deletedOrder, courseId } = existingBlock;

  await prismaClient.courseDetailBlock.delete({ where: { id: blockId } });

  // Decrement order of remaining siblings
  await prismaClient.courseDetailBlock.updateMany({
    where: {
      courseId,
      parentId,
      order: { gt: deletedOrder },
    },
    data: { order: { decrement: 1 } },
  });

  res.status(200).json(new ApiResponse(200, null, "Block deleted successfully"));
});

export { addCourseDetails, editCourseDetails, getCourseDetails, updateBlock, deleteBlock };
