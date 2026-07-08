import express from "express";
import { authUser } from "../middlewares/auth.middleware.js";
import { generateInterviewController } from "../controllers/interview.controller.js";
import  upload  from "../middlewares/file.middleware.js";

const interviewRouter = express.Router();


/**
 * @route POST /api/interview
 * @desc Generate an interview preparation report based on the candidate's resume, job description, and self-description.
 * @body { resume: string, jobDescription: string, selfDescription: string }
 * @returns { matchScore: number, technicalQuestions: array, behavioralQuestions: array, skillGaps: array, preparationPlan: array }
 * @access private
 */

interviewRouter.post("/", authUser, upload.single("resume"), generateInterviewController);

export default interviewRouter;