import { extractText } from "unpdf";
import { generateInterviewReport } from "../services/ai.service.js";
import InterviewReport from "../models/interviewReport.model.js";

export const generateInterviewController = async (req, res) => {
  try {
    // ==============================
    // Validate Resume
    // ==============================
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Resume PDF is required.",
      });
    }

    // ==============================
    // Validate Request Body
    // ==============================
    const { selfDescription, jobDescription } = req.body;

    if (!jobDescription || !selfDescription) {
      return res.status(400).json({
        success: false,
        message: "Job description and self description are required.",
      });
    }

    // ==============================
    // Extract Resume Text
    // ==============================
    const result = await extractText(
      new Uint8Array(req.file.buffer)
    );

    // Uncomment only for debugging
    // console.dir(result, { depth: null });

    let resumeText = "";

    if (typeof result.text === "string") {
      resumeText = result.text.trim();
    } else if (Array.isArray(result.text)) {
      resumeText = result.text.join("\n").trim();
    } else {
      return res.status(400).json({
        success: false,
        message: "Unable to extract text from the uploaded PDF.",
      });
    }

    if (!resumeText) {
      return res.status(400).json({
        success: false,
        message:
          "Could not extract text from PDF. Please upload a text-based PDF.",
      });
    }

    // ==============================
    // Generate AI Report
    // ==============================
    const interviewReportByAi = await generateInterviewReport({
      resume: resumeText,
      jobDescription,
      selfDescription,
    });

    // ==============================
    // Validate AI Response
    // ==============================
    if (
      !interviewReportByAi ||
      typeof interviewReportByAi !== "object"
    ) {
      return res.status(500).json({
        success: false,
        message: "Invalid response received from AI.",
      });
    }

    const {
      matchScore,
      technicalQuestions,
      behavioralQuestions,
      skillGaps,
      preparationPlan,
    } = interviewReportByAi;

    if (
      typeof matchScore !== "number" ||
      !Array.isArray(technicalQuestions) ||
      !Array.isArray(behavioralQuestions) ||
      !Array.isArray(skillGaps) ||
      !Array.isArray(preparationPlan)
    ) {
      return res.status(500).json({
        success: false,
        message: "Incomplete response received from AI.",
      });
    }

    if (
      technicalQuestions.length !== 5 ||
      behavioralQuestions.length !== 5 ||
      preparationPlan.length !== 7
    ) {
      return res.status(500).json({
        success: false,
        message: "AI returned incomplete interview report.",
      });
    }

    // ==============================
    // Save Report
    // ==============================
    const report = await InterviewReport.create({
      jobDescription,
      resume: resumeText,
      selfDescription,
      matchScore,
      technicalQuestions,
      behavioralQuestions,
      skillGaps,
      preparationPlan,
      user: req.user.id,
    });

    // ==============================
    // Success Response
    // ==============================
    return res.status(201).json({
      success: true,
      message: "Interview report generated successfully.",
      data: report,
    });

  } catch (error) {
    console.error("========== INTERVIEW REPORT ERROR ==========");
    console.error(error);
    console.error("============================================");

    if (error.status === 503) {
      return res.status(503).json({
        success: false,
        message:
          "AI service is currently busy. Please try again after a few moments.",
      });
    }

    if (error instanceof SyntaxError) {
      return res.status(500).json({
        success: false,
        message: "AI returned invalid JSON.",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error.",
    });
  }
};