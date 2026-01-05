import { Router } from "express";
import { uploadPDF } from "../../middleware/pdf.middleware";
import verifyJwt from "../../middleware/auth.middleware";
import { createIssue, createJournalIssue, deleteChild, deleteParentWithChildren, editJournalIssue, editParentJournal, getjournal, getjournalChild, getParentsWithChildren } from "./journal.controller";
import { createJournalDetails, deleteJournalDetails, editJournalDetails, getJournalDetailsByJournalId, uploadFile } from "./journal-details.controller";

export const journalRouter: Router = Router();
journalRouter.get("/",  getjournal);
journalRouter.get("/child/:id",  getjournalChild);
journalRouter.post("/", [verifyJwt],  createIssue);
journalRouter.post("/:id", [verifyJwt], createJournalIssue);
journalRouter.delete("/child/:id", [verifyJwt], deleteChild);
journalRouter.delete("/:id", [verifyJwt], deleteParentWithChildren);
journalRouter.put("/:id", [verifyJwt], editParentJournal);
journalRouter.put("/child/:id", [verifyJwt], editJournalIssue);
journalRouter.get("/all",getParentsWithChildren);

journalRouter.post("/details/:id",  createJournalDetails);
journalRouter.get("/details/:id", getJournalDetailsByJournalId);
journalRouter.put("/details/:id", [verifyJwt], editJournalDetails);
journalRouter.delete("/details/:id", [verifyJwt], deleteJournalDetails);
journalRouter.put("/details/file/:id", [verifyJwt], uploadPDF.single("files"), uploadFile);


