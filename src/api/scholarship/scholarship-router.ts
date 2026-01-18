import { Router } from "express";
import { getScholarshipSchedule, upsertScholarshipSchedule } from "./scholarship-controller";


const scholarshipRouter : Router= Router();

scholarshipRouter.put("/", upsertScholarshipSchedule);
scholarshipRouter.get("/", getScholarshipSchedule);    

export default scholarshipRouter;
