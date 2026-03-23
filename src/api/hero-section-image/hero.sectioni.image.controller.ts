import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/apiError";
import { prismaClient } from "../../server";
import { ApiResponse } from "../../utils/apiResponse";
import { paginationSchema } from "../../validation/pagination.validation";
import { deleteCourseImage } from "../../utils/deleteImage";

const MAX_ENABLED_IMAGES = 5;

// ─── Helper: reliable next order via aggregate ────────────────────────────────
const getNextHeroOrder = async (): Promise<number> => {
  const result = await prismaClient.heroSectionImage.aggregate({
    _max: { order: true },
  });
  return (result._max.order ?? 0) + 1;
};

// ─── Add Hero Image ───────────────────────────────────────────────────────────
const addHeroSectionImage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw new ApiError(400, "No image file provided");

  const filename = req.file.filename;
  const thumbnail = `/public/hero/${filename}`;

  const [nextOrder, enabledCount] = await Promise.all([
    getNextHeroOrder(),
    prismaClient.heroSectionImage.count({ where: { status: "ENABLED" } }),
  ]);

  const defaultStatus = enabledCount < MAX_ENABLED_IMAGES ? "ENABLED" : "DISABLED";

  const heroImage = await prismaClient.heroSectionImage.create({
    data: {
      thumbnail,
      order: nextOrder,
      status: defaultStatus,
    },
  });

  res
    .status(201)
    .json(new ApiResponse(201, heroImage, "Hero section image added successfully"));
});

// ─── Get Hero Images (Paginated, Admin) ───────────────────────────────────────
const getHeroSectionImages = asyncHandler(async (req: Request, res: Response) => {
  const parsed = paginationSchema.safeParse(req.query);
  if (!parsed.success) {
    throw new ApiError(400, "Validation Failed", parsed.error.issues);
  }

  const { page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  const [images, total] = await Promise.all([
    prismaClient.heroSectionImage.findMany({
      skip,
      take: limit,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    }),
    prismaClient.heroSectionImage.count(),
  ]);

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
    .json(new ApiResponse(200, images, "Hero section images fetched successfully", pagination));
});

// ─── Get Active Hero Images (Public — max 5 ENABLED) ─────────────────────────
const getActiveHeroSectionImages = asyncHandler(async (_req: Request, res: Response) => {
  const images = await prismaClient.heroSectionImage.findMany({
    where: { status: "ENABLED" },
    orderBy: { order: "asc" },
    take: MAX_ENABLED_IMAGES,
  });

  res
    .status(200)
    .json(new ApiResponse(200, images, "Active hero section images fetched successfully"));
});

// ─── Toggle Status (Enable / Disable) ────────────────────────────────────────
const toggleHeroImageStatus = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  const image = await prismaClient.heroSectionImage.findUnique({ where: { id } });
  if (!image) throw new ApiError(404, "Hero image not found");

  if (image.status === "DISABLED") {
    const enabledCount = await prismaClient.heroSectionImage.count({
      where: { status: "ENABLED" },
    });

    if (enabledCount >= MAX_ENABLED_IMAGES) {
      throw new ApiError(
        400,
        `Cannot enable more than ${MAX_ENABLED_IMAGES} hero images. Please disable one first.`
      );
    }
  }

  const newStatus = image.status === "ENABLED" ? "DISABLED" : "ENABLED";

  const updatedImage = await prismaClient.heroSectionImage.update({
    where: { id },
    data: { status: newStatus },
  });

  res
    .status(200)
    .json(new ApiResponse(200, updatedImage, `Hero image ${newStatus.toLowerCase()} successfully`));
});

// ─── Update Hero Image (Replace Thumbnail) ────────────────────────────────────
const updateHeroSectionImage = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  if (!req.file) throw new ApiError(400, "No image file provided");

  const image = await prismaClient.heroSectionImage.findUnique({ where: { id } });
  if (!image) throw new ApiError(404, "Hero image not found");

  if (image.thumbnail) {
    deleteCourseImage(image.thumbnail);
  }

  const filename = req.file.filename;
  const thumbnail = `/public/hero/${filename}`;

  const updatedImage = await prismaClient.heroSectionImage.update({
    where: { id },
    data: { thumbnail },
  });

  res
    .status(200)
    .json(new ApiResponse(200, updatedImage, "Hero image updated successfully"));
});

// ─── Change Order ─────────────────────────────────────────────────────────────
const changeHeroImageOrder = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { newOrder } = req.body;

  if (typeof newOrder !== "number" || newOrder < 1) {
    throw new ApiError(400, "Invalid new order value");
  }

  const image = await prismaClient.heroSectionImage.findUnique({ where: { id } });
  if (!image) throw new ApiError(404, "Hero image not found");

  const oldOrder = image.order;

  if (oldOrder === newOrder) {
    return res.status(200).json(new ApiResponse(200, image, "Order unchanged"));
  }

  await prismaClient.$transaction(async (tx) => {
    if (newOrder > oldOrder) {
      await tx.heroSectionImage.updateMany({
        where: { order: { gt: oldOrder, lte: newOrder } },
        data: { order: { decrement: 1 } },
      });
    } else {
      await tx.heroSectionImage.updateMany({
        where: { order: { gte: newOrder, lt: oldOrder } },
        data: { order: { increment: 1 } },
      });
    }

    await tx.heroSectionImage.update({
      where: { id },
      data: { order: newOrder },
    });
  });

  res
    .status(200)
    .json(new ApiResponse(200, null, "Hero image order updated successfully"));
});

// ─── Delete Hero Image ────────────────────────────────────────────────────────
const deleteHeroSectionImage = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  const image = await prismaClient.heroSectionImage.findUnique({
    where: { id },
    select: { order: true, thumbnail: true },
  });

  if (!image) throw new ApiError(404, "Hero image not found");

  const deletedOrder = image.order;

  await prismaClient.$transaction(async (tx) => {
    await tx.heroSectionImage.delete({ where: { id } });

    await tx.heroSectionImage.updateMany({
      where: { order: { gt: deletedOrder } },
      data: { order: { decrement: 1 } },
    });
  });

  if (image.thumbnail) {
    deleteCourseImage(image.thumbnail);
  }

  res.status(200).json(new ApiResponse(200, null, "Hero image deleted successfully"));
});

export {
  addHeroSectionImage,
  getHeroSectionImages,
  getActiveHeroSectionImages,
  toggleHeroImageStatus,
  updateHeroSectionImage,
  changeHeroImageOrder,
  deleteHeroSectionImage,
};