import axios from "axios";

// ─── Axios Instance ──────────────────────────────────────────
const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

// ─── Request Interceptor ─────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Generate Interview Report ───────────────────────────────
// @desc   Resume + JD + selfDescription bhejo — AI report lo
// @param  { resumeFile, jobDescription, selfDescription }
// @return { success, message, data: interviewReport }

export const generateInterviewReport = async ({jobDescription, selfDescription, resumeFile}) => {
  const formData = new FormData();
  formData.append("jobDescription", jobDescription)
  formData.append("selfDescription", selfDescription)
  formData.append("resume", resumeFile) 

  try {
    const res = await api.post("/interview/", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    })

    return res.data
  } catch (error) {
    throw error?.response?.data || error;
  }
}

// ─── Get Single Report ───────────────────────────────────────
export const getReportById = async (id) => {
  try {
    const res = await api.get(`/interview/report/${id}`);
    return res.data;
  } catch (error) {
    throw error?.response?.data || error;
  }
};

// ─── Get All Reports ─────────────────────────────────────────
export const getAllReports = async () => {
  try {
    const res = await api.get("/interview/");
    return res.data;
  } catch (error) {
    throw error?.response?.data || error;
  }
};

// ─── Download Resume PDF ─────────────────────────────────────
export const downloadResumePDF = async (reportId) => {
  try {
    const response = await api.get(`/interview/${reportId}/pdf`, {
      responseType: "blob", // ← Binary PDF data ke liye zaruri
    });

    // Browser download trigger karo
    const url = window.URL.createObjectURL(
      new Blob([response.data], { type: "application/pdf" })
    );
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "resume.pdf");
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url); // Memory free karo

    return true;
  } catch (error) {
    throw error?.response?.data || error;
  }
};