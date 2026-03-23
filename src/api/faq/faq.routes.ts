import { Router } from "express";
import verifyJwt from "../../middleware/auth.middleware";
import { requirePermission } from "../../middleware/permission.middleware";
import { EPermission } from "../users/permisssion";
import {
  addFaq,
  changeFaqOrder,
  deleteFaq,
  getActiveFaqs,
  getFaqById,
  getFaqs,
  toggleFaqStatus,
  updateFaq,
} from "./faq.controller";

const faqRouter: Router = Router();

// ─── Public Routes ────────────────────────────────────────────────────────────
faqRouter.get("/active", getActiveFaqs);

// ─── Admin Routes ─────────────────────────────────────────────────────────────
faqRouter.get(
  "/",
  [verifyJwt, requirePermission(EPermission.FAQ)],
  getFaqs
);

faqRouter.get(
  "/:id",
  [verifyJwt, requirePermission(EPermission.FAQ)],
  getFaqById
);

faqRouter.post(
  "/",
  [verifyJwt, requirePermission(EPermission.FAQ)],
  addFaq
);

faqRouter.put(
  "/change-order/:id",
  [verifyJwt, requirePermission(EPermission.FAQ)],
  changeFaqOrder
);

faqRouter.put(
  "/toggle-status/:id",
  [verifyJwt, requirePermission(EPermission.FAQ)],
  toggleFaqStatus
);

faqRouter.put(
  "/:id",
  [verifyJwt, requirePermission(EPermission.FAQ)],
  updateFaq
);

faqRouter.delete(
  "/:id",
  [verifyJwt, requirePermission(EPermission.FAQ)],
  deleteFaq
);

export default faqRouter;