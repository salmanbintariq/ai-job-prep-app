import { extractText } from "unpdf";

import {
  generateInterviewReport,
  generateResumeHTML,
  generateResumePDF,
} from "../services/ai.service.js";

import InterviewReport from "../models/interviewReport.model.js";


// ============================================================
// GENERATE INTERVIEW REPORT
// ============================================================

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
    // Generate AI Interview Report
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
      title,
      matchScore,
      technicalQuestions,
      behavioralQuestions,
      skillGaps,
      preparationPlan,
    } = interviewReportByAi;

    if (
      typeof title !== "string" ||
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
    // Generate Resume HTML
    // ==============================
    // Gemini generates the resume HTML once.
    // It will be saved in MongoDB.
    // PDF downloads will NOT call Gemini again.

    const resumeHtml = await generateResumeHTML({
      resume: resumeText,
      jobDescription,
      selfDescription,
    });

    // ==============================
    // Save Report
    // ==============================

    const report = await InterviewReport.create({
      title,
      jobDescription,
      resume: resumeText,
      selfDescription,
      resumeHtml,
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
    console.error(
      "========== INTERVIEW REPORT ERROR =========="
    );
    console.error(error);
    console.error("============================================");

    if (error.status === 503) {
      return res.status(503).json({
        success: false,
        message:
          "AI service is currently busy. Please try again after a few moments.",
      });
    }

    if (error.status === 429) {
      return res.status(429).json({
        success: false,
        message:
          "AI quota exceeded. Please try again later.",
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


// ============================================================
// GET SINGLE INTERVIEW REPORT
// ============================================================

export const getInterviewReportByIdController = async (req, res) => {
  try {
    const { interviewId } = req.params;

    const interviewReport = await InterviewReport.findOne({
      _id: interviewId,
      user: req.user.id,
    });

    if (!interviewReport) {
      return res.status(404).json({
        success: false,
        message: "Interview report not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Interview report fetched successfully.",
      data: interviewReport,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        error.message || "Internal Server Error.",
    });
  }
};


// ============================================================
// GET ALL INTERVIEW REPORTS
// ============================================================

export const getAllInterviewReportsController = async (req, res) => {
  try {
    const reports = await InterviewReport.find({
      user: req.user.id,
    })
      .sort({ createdAt: -1 })
      .select(
        "-resume -jobDescription -selfDescription -resumeHtml -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan"
      );

    return res.status(200).json({
      success: true,
      message: "Interview reports fetched successfully.",
      data: reports,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        error.message || "Internal Server Error.",
    });
  }
};


// ============================================================
// DOWNLOAD RESUME PDF
// ============================================================

export const downloadResumePDFController = async (req, res) => {
  try {
    // ==============================
    // Get Report
    // ==============================

    const report = await InterviewReport.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found.",
      });
    }

    // ==============================
    // Check Saved Resume HTML
    // ==============================

    if (!report.resumeHtml) {
      return res.status(404).json({
        success: false,
        message:
          "Resume PDF is not available for this report. Please generate a new interview report.",
      });
    }

    // ==============================
    // Convert HTML → PDF
    // ==============================
    // IMPORTANT:
    // Gemini is NOT called here.
    // Only Puppeteer converts HTML → PDF.

    const pdfBuffer = await generateResumePDF(
      report.resumeHtml
    );

    // ==============================
    // Send PDF
    // ==============================

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=resume.pdf",
      "Content-Length": pdfBuffer.length,
    });

    return res.end(pdfBuffer);

  } catch (error) {
    console.error("PDF GENERATION ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate resume PDF",

      ...(process.env.NODE_ENV === "development" && {
        error: error.message,
      }),
    });
  }
};