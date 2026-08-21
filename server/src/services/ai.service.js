import { GoogleGenAI } from "@google/genai";
import * as z from "zod";
import puppeteer from "puppeteer";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// ============================================================
// INTERVIEW REPORT SCHEMA
// ============================================================

const interviewSchema = z.object({
  matchScore: z.number().min(0).max(100),

  technicalQuestions: z.array(
    z.object({
      question: z.string(),
      intention: z.string(),
      answer: z.string(),
    })
  ),

  behavioralQuestions: z.array(
    z.object({
      question: z.string(),
      intention: z.string(),
      answer: z.string(),
    })
  ),

  skillGaps: z.array(
    z.object({
      skill: z.string(),
      severity: z.enum(["low", "medium", "high"]),
    })
  ),

  preparationPlan: z.array(
    z.object({
      day: z.number(),
      focus: z.string(),
      tasks: z.array(z.string()),
    })
  ),

  title: z.string(),
});

// ============================================================
// GEMINI INTERVIEW RESPONSE SCHEMA
// ============================================================

const interviewGeminiSchema = {
  type: "object",

  properties: {
    title: {
      type: "string",
      description: "A short descriptive title for this interview report.",
    },

    matchScore: {
      type: "number",
      description:
        "Match score between candidate resume and job description from 0 to 100.",
    },

    technicalQuestions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          question: { type: "string" },
          intention: { type: "string" },
          answer: { type: "string" },
        },
        required: ["question", "intention", "answer"],
      },
    },

    behavioralQuestions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          question: { type: "string" },
          intention: { type: "string" },
          answer: { type: "string" },
        },
        required: ["question", "intention", "answer"],
      },
    },

    skillGaps: {
      type: "array",
      items: {
        type: "object",
        properties: {
          skill: { type: "string" },
          severity: {
            type: "string",
            enum: ["low", "medium", "high"],
          },
        },
        required: ["skill", "severity"],
      },
    },

    preparationPlan: {
      type: "array",
      items: {
        type: "object",
        properties: {
          day: { type: "number" },
          focus: { type: "string" },
          tasks: {
            type: "array",
            items: { type: "string" },
          },
        },
        required: ["day", "focus", "tasks"],
      },
    },
  },

  required: [
    "title",
    "matchScore",
    "technicalQuestions",
    "behavioralQuestions",
    "skillGaps",
    "preparationPlan",
  ],
};

// ============================================================
// GENERATE INTERVIEW REPORT
// ============================================================

export const generateInterviewReport = async ({
  resume,
  jobDescription,
  selfDescription,
}) => {
  const prompt = `
You are an expert technical interviewer, hiring manager, and career coach.

Analyze the candidate's resume, self-description, and job description carefully.

Return ONLY a valid JSON object.

IMPORTANT RULES:

- Do NOT return Markdown.
- Do NOT use code fences.
- Do NOT include explanations before or after the JSON.
- Do NOT return an array.
- Follow the structure exactly.
- Never use null.
- Never leave required fields empty.

REQUIREMENTS:

1. title
   - Short meaningful job/interview title.

2. matchScore
   - Realistic score from 0 to 100.

3. technicalQuestions
   - EXACTLY 5 questions.
   - Each must contain question, intention, and answer.

4. behavioralQuestions
   - EXACTLY 5 questions.
   - Each must contain question, intention, and answer.
   - Answers should follow the STAR method.

5. skillGaps
   - Identify missing or weak skills.
   - severity must be "low", "medium", or "high".

6. preparationPlan
   - EXACTLY 7 days.
   - Each day must contain:
     day
     focus
     tasks
   - Each day should contain 3-5 tasks.

Candidate Resume:

${resume}

Job Description:

${jobDescription}

Candidate Self Description:

${selfDescription}
`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",

    contents: prompt,

    config: {
      responseMimeType: "application/json",
      responseSchema: interviewGeminiSchema,
    },
  });

  const parsed = JSON.parse(response.text);

  return interviewSchema.parse(parsed);
};

// ============================================================
// RESUME HTML GEMINI SCHEMA
// ============================================================

const resumeGeminiSchema = {
  type: "object",

  properties: {
    html: {
      type: "string",
      description:
        "Complete HTML resume with inline CSS, ready for PDF conversion.",
    },
  },

  required: ["html"],
};

// ============================================================
// RESUME HTML ZOD SCHEMA
// ============================================================

const resumeHTMLSchema = z.object({
  html: z.string().min(1),
});

// ============================================================
// GENERATE RESUME HTML
// ============================================================

export const generateResumeHTML = async ({
  resume,
  selfDescription,
  jobDescription,
}) => {
  const prompt = `
You are an expert resume writer with 15+ years of experience in tech hiring.

Create a tailored, ATS-optimized one-page resume for the candidate.

CANDIDATE RESUME:

${resume}

JOB DESCRIPTION:

${jobDescription}

SELF DESCRIPTION:

${selfDescription}

CONTENT RULES:

- Write using implicit first-person style.
- Do not use "I" statements.
- Use strong action verbs.
- Every bullet should demonstrate impact.
- Quantify achievements wherever possible.
- Mirror important keywords from the job description.
- Make the content sound human-written.
- Do not invent experience, education, skills, companies, or achievements.
- Do not use buzzwords such as "leverage", "utilize", "synergy", or "passionate".
- Avoid generic statements such as "team player" or "hard worker".
- Keep the resume concise and maximum one page.
- Include only information relevant to the job description.

HTML DESIGN RULES:

- Return a complete HTML document.
- Use only inline CSS.
- No external stylesheets.
- No Google Fonts.
- Use safe fonts: Arial, Helvetica, Georgia, or Times New Roman.
- Dark navy (#1a1a2e) headings.
- Black body text.
- Single-column layout.
- ATS-friendly structure.
- No tables.
- No multi-column layouts.
- No icons.
- No images.
- Professional spacing.
- Print-friendly A4 layout.

SECTIONS IN THIS ORDER:

1. Header
   - Name
   - Role
   - Location
   - Email
   - GitHub
   - LinkedIn

2. Professional Summary
   - 3-4 lines.
   - Tailored to the job description.

3. Technical Skills
   - Group skills by category.
   - Put the most relevant job-description keywords first.

4. Projects
   - Most relevant projects first.
   - Include technology and measurable impact where available.

5. Experience
   - Include only relevant professional experience.

6. Education & Certifications

IMPORTANT:

- Do not invent information.
- If information is missing, do not create fake information.
- Return ONLY the JSON object.
- Do not use Markdown.
- Do not use code fences.
- Do not add explanations.

Required JSON structure:

{
  "html": "<!DOCTYPE html>..."
}
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",

      contents: prompt,

      config: {
        responseMimeType: "application/json",
        responseSchema: resumeGeminiSchema,
      },
    });

    const parsed = JSON.parse(response.text);

    const validated = resumeHTMLSchema.parse(parsed);

    return validated.html;
  } catch (error) {
    console.error("RESUME HTML GENERATION ERROR:", error);

    throw new Error(
      `Resume HTML generation failed: ${error.message}`
    );
  }
};

// ============================================================
// CONVERT SAVED HTML → PDF
// ============================================================

export const generateResumePDF = async (htmlContent) => {
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: true,

      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });

    const page = await browser.newPage();

    page.setDefaultTimeout(120000);

    await page.setContent(htmlContent, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,

      margin: {
        top: "15mm",
        bottom: "15mm",
        left: "10mm",
        right: "10mm",
      },
    });

    return pdfBuffer;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};