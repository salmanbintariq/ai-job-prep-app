import { createContext, useState } from "react";

export const InterViewContext = createContext();

export const InterViewProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [reports, setReports] = useState([]);

  return (
    <InterViewContext.Provider value={{loading,setLoading,report,setReport,reports,setReports}}>
      {children}
    </InterViewContext.Provider>
  )
};
