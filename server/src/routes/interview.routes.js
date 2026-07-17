import express from "express";
import upload from "../middlewares/file.middleware.js";
import { authUser } from "../middlewares/auth.middleware.js";

import {
  generateInterviewController,
  getInterviewReportByIdController,
  getAllInterviewReportsController,
  downloadResumePDFController
} from "../controllers/interview.controller.js";

const interviewRouter = express.Router();

/**
 * @route POST /api/interview
 * @desc Generate an interview preparation report based on the candidate's resume, job description, and self-description.
 * @body { resume: string, jobDescription: string, selfDescription: string }
 * @returns { matchScore: number, technicalQuestions: array, behavioralQuestions: array, skillGaps: array, preparationPlan: array }
 * @access private
 */

interviewRouter.post(
  "/",
  authUser,
  upload.single("resume"),
  generateInterviewController,
);

/**
 * @route GET /api/interview/report/:interviewId
 * @description get interview report by interview id
 * @access private
 */

interviewRouter.get(
  "/report/:interviewId",
  authUser,
  getInterviewReportByIdController,
);

/**
 * @route GET /api/interview/
 * @description get interview reports of logged in user
 * @access private
 */

interviewRouter.get("/", authUser, getAllInterviewReportsController);

// GET /api/resume/:id/pdf
interviewRouter.get(             // ✅ interviewRouter
  "/:id/pdf",
  authUser,
  downloadResumePDFController
);

export default interviewRouter;
