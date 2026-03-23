import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/apiError";
import { prismaClient } from "../../server";
import { ApiResponse } from "../../utils/apiResponse";
import { paginationSchema } from "../../validation/pagination.validation";

// ─── Helper: next order for top-level (parent) FAQs only ─────────────────────
const getNextFaqOrder = async (): Promise<number> => {
  const result = await prismaClient.fAQ.aggregate({
    where: { parentId: null },
    _max: { order: true },
  });
  return (result._max.order ?? 0) + 1;
};

// ─── Add FAQ (Question = parent, Answer = child of that question) ─────────────
// Body: { questions: string, answers: string }
// Creates parent (question, parentId: null) + child (answer, parentId: parent.id)
const addFaq = asyncHandler(async (req: Request, res: Response) => {
  const { questions, answers } = req.body;

  if (!questions || typeof questions !== "string" || !questions.trim()) {
    throw new ApiError(400, "Question is required");
  }
  if (!answers || typeof answers !== "string" || !answers.trim()) {
    throw new ApiError(400, "Answer is required");
  }

  const nextOrder = await getNextFaqOrder();

  // Create parent (question) + child (answer) in a transaction
  const parent = await prismaClient.$transaction(async (tx) => {
    const parentFaq = await tx.fAQ.create({
      data: {
        questions: questions.trim(),
        answers: "",           // parent holds the question text; answers unused at parent level
        parentId: null,
        order: nextOrder,
        status: "ENABLED",
      },
    });

    await tx.fAQ.create({
      data: {
        questions: "",         // child holds the answer; questions unused at child level
        answers: answers.trim(),
        parentId: parentFaq.id,
        order: 1,
        status: "ENABLED",
      },
    });

    return tx.fAQ.findUnique({
      where: { id: parentFaq.id },
      include: { children: true },
    });
  });

  res.status(201).json(new ApiResponse(201, parent, "FAQ added successfully"));
});

// ─── Get FAQs (Paginated, Admin) — only top-level (parentId: null) ────────────
const getFaqs = asyncHandler(async (req: Request, res: Response) => {
  const parsed = paginationSchema.safeParse(req.query);
  if (!parsed.success) {
    throw new ApiError(400, "Validation Failed", parsed.error.issues);
  }

  const { page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  const [faqs, total] = await Promise.all([
    prismaClient.fAQ.findMany({
      where: { parentId: null },
      skip,
      take: limit,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      include: {
        children: {
          orderBy: { order: "asc" },
        },
      },
    }),
    prismaClient.fAQ.count({ where: { parentId: null } }),
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
    .json(new ApiResponse(200, faqs, "FAQs fetched successfully", pagination));
});

// ─── Get Active FAQs (Public) — only ENABLED parents with their children ──────
const getActiveFaqs = asyncHandler(async (_req: Request, res: Response) => {
  const faqs = await prismaClient.fAQ.findMany({
    where: { parentId: null, status: "ENABLED" },
    orderBy: { order: "asc" },
    select: {
      id: true,
      questions: true,
      order: true,
      children: {
        where: { status: "ENABLED" },
        orderBy: { order: "asc" },
        select: { id: true, answers: true, order: true },
      },
    },
  });

  res
    .status(200)
    .json(new ApiResponse(200, faqs, "Active FAQs fetched successfully"));
});

// ─── Get Single FAQ (parent + children) ──────────────────────────────────────
const getFaqById = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) throw new ApiError(400, "Invalid FAQ ID");

  const faq = await prismaClient.fAQ.findUnique({
    where: { id },
    include: { children: { orderBy: { order: "asc" } } },
  });
  if (!faq) throw new ApiError(404, "FAQ not found");

  res.status(200).json(new ApiResponse(200, faq, "FAQ fetched successfully"));
});

// ─── Update FAQ (question on parent, answer on its first child) ───────────────
const updateFaq = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) throw new ApiError(400, "Invalid FAQ ID");

  const { questions, answers } = req.body;

  if (!questions || typeof questions !== "string" || !questions.trim()) {
    throw new ApiError(400, "Question is required");
  }
  if (!answers || typeof answers !== "string" || !answers.trim()) {
    throw new ApiError(400, "Answer is required");
  }

  const faq = await prismaClient.fAQ.findUnique({
    where: { id, parentId: null },   // only allow editing parents
    include: { children: true },
  });
  if (!faq) throw new ApiError(404, "FAQ not found");

  const updated = await prismaClient.$transaction(async (tx) => {
    await tx.fAQ.update({
      where: { id },
      data: { questions: questions.trim() },
    });

    // Update first child's answer (create child if somehow missing)
    if (faq.children.length > 0) {
      await tx.fAQ.update({
        where: { id: faq.children[0].id },
        data: { answers: answers.trim() },
      });
    } else {
      await tx.fAQ.create({
        data: {
          questions: "",
          answers: answers.trim(),
          parentId: id,
          order: 1,
          status: "ENABLED",
        },
      });
    }

    return tx.fAQ.findUnique({
      where: { id },
      include: { children: true },
    });
  });

  res.status(200).json(new ApiResponse(200, updated, "FAQ updated successfully"));
});

// ─── Toggle Status ────────────────────────────────────────────────────────────
const toggleFaqStatus = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) throw new ApiError(400, "Invalid FAQ ID");

  const faq = await prismaClient.fAQ.findUnique({ where: { id } });
  if (!faq) throw new ApiError(404, "FAQ not found");

  const newStatus = faq.status === "ENABLED" ? "DISABLED" : "ENABLED";

  // Toggle parent and all its children together
  await prismaClient.$transaction([
    prismaClient.fAQ.update({ where: { id }, data: { status: newStatus } }),
    prismaClient.fAQ.updateMany({ where: { parentId: id }, data: { status: newStatus } }),
  ]);

  const updated = await prismaClient.fAQ.findUnique({
    where: { id },
    include: { children: true },
  });

  res
    .status(200)
    .json(new ApiResponse(200, updated, `FAQ ${newStatus.toLowerCase()} successfully`));
});

// ─── Change Order (parents only) ─────────────────────────────────────────────
const changeFaqOrder = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { newOrder } = req.body;

  if (isNaN(id)) throw new ApiError(400, "Invalid FAQ ID");
  if (typeof newOrder !== "number" || newOrder < 1) {
    throw new ApiError(400, "Invalid new order value");
  }

  const faq = await prismaClient.fAQ.findUnique({ where: { id, parentId: null } });
  if (!faq) throw new ApiError(404, "FAQ not found");

  const oldOrder = faq.order;
  if (oldOrder === newOrder) {
    return res.status(200).json(new ApiResponse(200, faq, "Order unchanged"));
  }

  await prismaClient.$transaction(async (tx) => {
    if (newOrder > oldOrder) {
      await tx.fAQ.updateMany({
        where: { parentId: null, order: { gt: oldOrder, lte: newOrder } },
        data: { order: { decrement: 1 } },
      });
    } else {
      await tx.fAQ.updateMany({
        where: { parentId: null, order: { gte: newOrder, lt: oldOrder } },
        data: { order: { increment: 1 } },
      });
    }
    await tx.fAQ.update({ where: { id }, data: { order: newOrder } });
  });

  res.status(200).json(new ApiResponse(200, null, "FAQ order updated successfully"));
});

// ─── Delete FAQ (parent + children cascade via Prisma relation) ───────────────
const deleteFaq = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) throw new ApiError(400, "Invalid FAQ ID");

  const faq = await prismaClient.fAQ.findUnique({
    where: { id, parentId: null },
    select: { order: true },
  });
  if (!faq) throw new ApiError(404, "FAQ not found");

  const deletedOrder = faq.order;

  await prismaClient.$transaction(async (tx) => {
    // Delete children first to avoid FK constraint
    await tx.fAQ.deleteMany({ where: { parentId: id } });
    await tx.fAQ.delete({ where: { id } });

    // Close the order gap
    await tx.fAQ.updateMany({
      where: { parentId: null, order: { gt: deletedOrder } },
      data: { order: { decrement: 1 } },
    });
  });

  res.status(200).json(new ApiResponse(200, null, "FAQ deleted successfully"));
});

export {
  addFaq,
  getFaqs,
  getActiveFaqs,
  getFaqById,
  updateFaq,
  toggleFaqStatus,
  changeFaqOrder,
  deleteFaq,
};