import { useContext } from "react";
import { InterViewContext } from "../interview.context.jsx";
import {
  generateInterviewReport,
  getAllReports,
  getReportById,
  downloadResumePDF,
} from "../services/interview.api.js";

export const useInterview = () => {
  const { loading, setLoading, report, setReport, reports, setReports } =
    useContext(InterViewContext);

  // ─── Generate Report ───────────────────────────────────────
  const handleGenerate = async ({
    jobDescription,
    selfDescription,
    resumeFile,
  }) => {
    setLoading(true);
    try {
      const response = await generateInterviewReport({
        jobDescription,
        selfDescription,
        resumeFile,
      });
      setReport(response.data);
      return response.data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ─── Fetch All Reports ─────────────────────────────────────
  const fetchAllReports = async () => {
    setLoading(true);
    try {
      const response = await getAllReports();
      setReports(response.data);
      return response.data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ─── Fetch Report By ID ────────────────────────────────────
  const fetchReportById = async (id) => {
    setLoading(true);
    try {
      const response = await getReportById(id);
      setReport(response.data);
      return response.data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Handle resume download
  const handleDownload = async (reportId) => {
    setLoading(true);
    try {
      await downloadResumePDF(reportId);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ─── Return ────────────────────────────────────────────────
  return {
    loading,
    report,
    reports,
    handleGenerate,
    fetchAllReports,
    fetchReportById,
    handleDownload
  };
};
