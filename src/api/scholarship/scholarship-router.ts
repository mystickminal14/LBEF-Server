import { Router } from "express";
import {  addScholarshipSchedule,
  getScholarshipSchedule,updateScholarshipSchedule,
  changeScholarshipStatus,
  getAllScholaship,} from "./scholarship-controller";


const scholarshipRouter : Router= Router();
scholarshipRouter.post("/", addScholarshipSchedule);
scholarshipRouter.put("/:id", updateScholarshipSchedule);
scholarshipRouter.patch("/status", changeScholarshipStatus);
scholarshipRouter.get("/", getScholarshipSchedule);
scholarshipRouter.get("/all", getAllScholaship);

export default scholarshipRouter;
