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

export const journalRouter: Router = Router();
journalRouter.post("/", verifyJwt,  [verifyJwt],createJournal);
journalRouter.put("/:id", verifyJwt, [verifyJwt], editJournal);
journalRouter.delete("/:id", verifyJwt,  [verifyJwt],deleteJournal);
journalRouter.get("/", getAllJournals);                 
journalRouter.get("/grouped/year", getJournalsGroupedByYear);

journalRouter.post("/details/:id",  createJournalDetails);
journalRouter.get("/details/:id", getJournalDetailsByJournalId);
journalRouter.put("/details/:id", [verifyJwt], editJournalDetails);
journalRouter.delete("/details/:id", [verifyJwt], deleteJournalDetails);
journalRouter.put("/details/file/:id", [verifyJwt], uploadPDF.single("files"), uploadFile);


