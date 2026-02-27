import { Request, Response } from "express";
import { prismaClient } from "../../server";
import { ApiError } from "../../utils/apiError";
import { asyncHandler } from "../../utils/asyncHandler";
import { CourseDetailArraySchema } from "./details.validation";
import { ApiResponse } from "../../utils/apiResponse";
import { paginationSchema } from "../../validation/pagination.validation";
import { EContentCategory } from "@prisma/client";

export interface CourseDetailBlockTree {
  id: number;
  title: string | null;
  type: "HEADING" | "SUBHEADING" | "PARAGRAPH" | "LIST";
  order: number;
  content: string | string[] | null;
  parentId: number | null;
  category: EContentCategory;
  children: CourseDetailBlockTree[];
}

/* ---------------------------------------------
   Helpers
--------------------------------------------- */

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

// Adjust sibling order within a category
const adjustSiblingOrders = async (
  courseId: number,
  category: EContentCategory,
  parentId: number | null,
  startingOrder: number,
  excludeBlockId?: number
) => {
  await prismaClient.courseDetailBlock.updateMany({
    where: {
      courseId,
      category,
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
   Add Multiple Blocks
--------------------------------------------- */
const addCourseDetails = asyncHandler(async (req: Request, res: Response) => {
  const courseId = Number(req.params.courseId);
  const parsed = CourseDetailArraySchema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, "Validation Failed", parsed.error.issues);

  const existingCourse = await prismaClient.course.findUnique({ where: { id: courseId } });
  if (!existingCourse) throw new ApiError(404, "Course does not exist");

  const blocks = parsed.data;

  const insertBlock = async (block: typeof blocks[number], parentId: number | null = null) => {
    if (!block.category) throw new ApiError(400, "Category is required");

    const siblingCount = await prismaClient.courseDetailBlock.count({
      where: { courseId, parentId, category: block.category },
    });

    const order = block.order ?? siblingCount + 1;
    await adjustSiblingOrders(courseId, block.category, parentId, order);

    const saved = await prismaClient.courseDetailBlock.create({
      data: {
        courseId,
        parentId,
        category: block.category,
        title: block.title ?? null,
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
   Edit / Upsert Multiple Blocks
--------------------------------------------- */
const editCourseDetails = asyncHandler(async (req: Request, res: Response) => {
  const courseId = Number(req.params.courseId);
  const parsed = CourseDetailArraySchema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(400, "Validation Failed", parsed.error.issues);

  const existingCourse = await prismaClient.course.findUnique({ where: { id: courseId } });
  if (!existingCourse) throw new ApiError(404, "Course does not exist");

  const blocks = parsed.data;

  const upsertBlock = async (block: typeof blocks[number], parentId: number | null = null) => {
    if (!block.category) throw new ApiError(400, "Category is required");

    const siblingCount = await prismaClient.courseDetailBlock.count({
      where: { courseId, parentId, category: block.category },
    });
    const order = block.order ?? siblingCount + 1;

    let saved;
    if (block.id) {
      const existingBlock = await prismaClient.courseDetailBlock.findUnique({ where: { id: block.id } });
      if (!existingBlock) throw new ApiError(404, "Block not found");

      if (existingBlock.order !== order || existingBlock.category !== block.category) {
        await adjustSiblingOrders(courseId, block.category, parentId, order, block.id);
      }

      saved = await prismaClient.courseDetailBlock.update({
        where: { id: block.id },
        data: {
          title: block.title ?? null,
          content: block.type === "LIST" ? JSON.stringify(block.content) : block.content ?? null,
          type: block.type,
          order,
          parentId,
          category: block.category,
        },
      });
    } else {
      await adjustSiblingOrders(courseId, block.category, parentId, order);
      saved = await prismaClient.courseDetailBlock.create({
        data: {
          courseId,
          parentId,
          category: block.category,
          title: block.title ?? null,
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

const getCourseDetails = asyncHandler(async (req: Request, res: Response) => {
  const courseId = Number(req.params.courseId);
  const rawCategory = req.params.category; // string

  // Validate category separately
  if (!rawCategory) {
    throw new ApiError(400, "Category is required");
  }

  // Convert string → Prisma Enum
  if (!Object.values(EContentCategory).includes(rawCategory as EContentCategory)) {
    throw new ApiError(400, "Invalid category value");
  }

  const category = rawCategory as EContentCategory;

  // Pagination validation (separate)
  const parsed = paginationSchema.safeParse(req.query);
  if (!parsed.success) {
    throw new ApiError(400, "Validation Failed", parsed.error.issues);
  }

  const { page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  // Check course exists
  const existingCourse = await prismaClient.course.findUnique({
    where: { id: courseId },
  });

  if (!existingCourse) {
    throw new ApiError(404, "Course not found");
  }

  // ---------------- ROOT BLOCKS ----------------
  const rootBlocks = await prismaClient.courseDetailBlock.findMany({
    where: {
      courseId,
      parentId: null,
      category,
    },
    orderBy: { order: "asc" },
    skip,
    take: limit,
  });

  const rootIds = rootBlocks.map((b) => b.id);

  // ---------------- ALL BLOCKS (ONLY THIS CATEGORY) ----------------
  const allBlocks = await prismaClient.courseDetailBlock.findMany({
    where: {
      courseId,
      category,
    },
    orderBy: { order: "asc" },
  });

  const map: Record<number, CourseDetailBlockTree> = {};

  allBlocks.forEach((block) => {
    map[block.id] = {
      id: block.id,
      title: block.title,
      type: block.type as any,
      order: block.order,
      category: block.category,
      content: safeParseContent(block),
      parentId: block.parentId,
      children: [],
    };
  });

  allBlocks.forEach((block) => {
    if (block.parentId && map[block.parentId]) {
      map[block.parentId].children.push(map[block.id]);
    }
  });

  const tree = rootIds.map((id) => map[id]).filter(Boolean);

  // ---------------- PAGINATION ----------------
  const totalRootBlocks = await prismaClient.courseDetailBlock.count({
    where: {
      courseId,
      parentId: null,
      category,
    },
  });

  const totalPages = Math.ceil(totalRootBlocks / limit);

  res.json(
    new ApiResponse(
      200,
      tree,
      "Course details fetched successfully!",
      {
        total: totalRootBlocks,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      }
    )
  );
});
/* ---------------------------------------------
   Update Single Block
--------------------------------------------- */
const updateBlock = asyncHandler(async (req: Request, res: Response) => {
  const blockId = parseInt(req.params.id);
  const { type, title, content, order, parentId, category } = req.body;

  const existingBlock = await prismaClient.courseDetailBlock.findUnique({ where: { id: blockId } });
  if (!existingBlock) throw new ApiError(404, "Block not found");

  let processedContent: any = null;
  if (type === "LIST" && Array.isArray(content)) processedContent = JSON.stringify(content);
  else if (type === "PARAGRAPH" && typeof content === "string") processedContent = content;
  else if (type === "HEADING" || type === "SUBHEADING") processedContent = null;

  // Adjust sibling order if order changed
  if (order !== undefined && order !== existingBlock.order) {
    await adjustSiblingOrders(
      existingBlock.courseId,
      category ?? existingBlock.category,
      existingBlock.parentId,
      order,
      blockId
    );
  }

  const updatedBlock = await prismaClient.courseDetailBlock.update({
    where: { id: blockId },
    data: {
      ...(type && { type }),
      ...(title !== undefined && { title }),
      ...(processedContent !== undefined && { content: processedContent }),
      ...(order !== undefined && { order }),
      ...(parentId !== undefined && { parentId }),
      ...(category !== undefined && { category }),
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
    select: { parentId: true, order: true, courseId: true, category: true },
  });

  if (!existingBlock) throw new ApiError(404, "Block not found");

  const { parentId, order: deletedOrder, courseId, category } = existingBlock;

  await prismaClient.courseDetailBlock.delete({ where: { id: blockId } });

  // Decrement order of remaining siblings in same category
  await prismaClient.courseDetailBlock.updateMany({
    where: {
      courseId,
      parentId,
      category,
      order: { gt: deletedOrder },
    },
    data: { order: { decrement: 1 } },
  });

  res.status(200).json(new ApiResponse(200, null, "Block deleted successfully"));
});

/* ---------------------------------------------
   Add Single Block
--------------------------------------------- */
export const addSingleBlock = asyncHandler(async (req: Request, res: Response) => {
  const courseId = Number(req.params.courseId);
  const { parentId = null, type, title, content, category } = req.body;

  if (!type) throw new ApiError(400, "Block type is required");
  if (!category) throw new ApiError(400, "Category is required");

  const parent = parentId
    ? await prismaClient.courseDetailBlock.findUnique({ where: { id: parentId } })
    : null;

  // 🔒 Hierarchy validation
  if (parent) {
    if (parent.type === "PARAGRAPH" || parent.type === "LIST") {
      throw new ApiError(400, "Cannot add blocks inside paragraph or list");
    }
    if (parent.type === "SUBHEADING" && type === "SUBHEADING") {
      throw new ApiError(400, "Cannot nest subheading inside subheading");
    }
  }
  if (type === "HEADING" && parentId !== null) {
    throw new ApiError(400, "Heading must be root level");
  }

  // Order handling scoped to category
  const siblingCount = await prismaClient.courseDetailBlock.count({
    where: { courseId, parentId, category },
  });
  const order = siblingCount + 1;
  await adjustSiblingOrders(courseId, category, parentId, order);

  // Content processing
  let processedContent: string | null = null;
  if (type === "LIST") processedContent = JSON.stringify(content ?? []);
  if (type === "PARAGRAPH") processedContent = content ?? null;

  const saved = await prismaClient.courseDetailBlock.create({
    data: {
      courseId,
      parentId,
      category,
      type,
      title: type === "HEADING" || type === "SUBHEADING" ? title : null,
      content: processedContent,
      order,
    },
  });

  res.status(201).json(new ApiResponse(201, saved, "Block added successfully"));
});

export { addCourseDetails, editCourseDetails, getCourseDetails, updateBlock, deleteBlock };