import { Router } from "express";
import { uploadPDF } from "../../middleware/pdf.middleware";
import verifyJwt from "../../middleware/auth.middleware";
import {
  createJournal,
  editJournal,
  deleteJournal,
  getJournalsGroupedByYear,
  getAllJournals,
} from "./journal.controller";
import { createJournalDetails, deleteJournalDetails, editJournalDetails, getJournalDetailsByJournalId, uploadFile } from "./journal-details.controller";
import { requirePermission } from "../../middleware/permission.middleware";
import { EPermission } from "../users/permisssion";

export const journalRouter: Router = Router();
journalRouter.post("/", verifyJwt,  [verifyJwt,requirePermission(EPermission.JOURNALS)],createJournal);
journalRouter.put("/:id", verifyJwt, [verifyJwt,requirePermission(EPermission.JOURNALS)], editJournal);
journalRouter.delete("/:id", verifyJwt,  [verifyJwt,requirePermission(EPermission.JOURNALS)],deleteJournal);
journalRouter.get("/", getAllJournals);                 
journalRouter.get("/grouped/year", getJournalsGroupedByYear);

journalRouter.post("/details/:id",  createJournalDetails);
journalRouter.get("/details/:id", getJournalDetailsByJournalId);
journalRouter.put("/details/:id", [verifyJwt,requirePermission(EPermission.JOURNALS)], editJournalDetails);
journalRouter.delete("/details/:id", [verifyJwt,requirePermission(EPermission.JOURNALS)], deleteJournalDetails);
journalRouter.put("/details/file/:id", [verifyJwt,requirePermission(EPermission.JOURNALS)], uploadPDF.single("files"), uploadFile);


