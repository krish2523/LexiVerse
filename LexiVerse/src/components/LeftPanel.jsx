import React from "react";

/**
 * LeftPanel - presentational component
 *
 * This component receives a number of props from `DashboardPage` and renders
 * the file upload area, the summary view and the important clauses list.
 * Keep this component free of side-effects; it should only call handlers
 * passed from the parent.
 */
export default function LeftPanel(props) {
  const {
    uploadedFileName,
    uploading,
    summary,
    importantClauses,
    activeView,
    setActiveView,
    fileInputRef,
    handleFileChange,
    legalQuotes,
    currentQuoteIndex,
    showUploadHint,
    rawAnalyzeJson,
    showAnalyzeDetails,
    setShowAnalyzeDetails,
    setSummary,
    setUploadedFileName,
    setDocumentId,
    setImportantClauses,
  } = props;

  return (
    <div className="left-panel">
      <div className="a4-page modern-scroll">
        <div style={{ marginBottom: "20px" }}>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: "600",
              margin: "0 0 16px 0",
              color: "#374151",
            }}
            className="mobile-title"
          >
            Intelligent Summary View
          </h1>
          <div
            style={{
              width: "60px",
              height: "3px",
              backgroundColor: "#fbbf24",
              marginBottom: "20px",
            }}
          />
        </div>

        {uploadedFileName && !uploading && (
          <div
            style={{
              marginBottom: "20px",
              display: "flex",
              gap: "8px",
              borderBottom: "1px solid #e5e7eb",
            }}
          >
            <button
              onClick={() => setActiveView("summary")}
              style={{
                background: "transparent",
                border: "none",
                padding: "8px 12px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: activeView === "summary" ? "600" : "400",
                color: activeView === "summary" ? "#3b82f6" : "#6b7280",
                borderBottom:
                  activeView === "summary"
                    ? "2px solid #3b82f6"
                    : "2px solid transparent",
                marginBottom: "-1px",
              }}
            >
              Summary
            </button>
            <button
              onClick={() => setActiveView("clauses")}
              style={{
                background: "transparent",
                border: "none",
                padding: "8px 12px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: activeView === "clauses" ? "600" : "400",
                color: activeView === "clauses" ? "#3b82f6" : "#6b7280",
                borderBottom:
                  activeView === "clauses"
                    ? "2px solid #3b82f6"
                    : "2px solid transparent",
                marginBottom: "-1px",
              }}
            >
              Important Clauses
            </button>
          </div>
        )}

        {!uploadedFileName && (
          <div style={{ marginBottom: "16px" }}>
            <div
              style={{
                border: "2px dashed #e5e7eb",
                borderRadius: "8px",
                padding: "18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                backgroundColor: "#fff",
              }}
            >
              <div style={{ textAlign: "left" }}>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#374151",
                    fontWeight: 600,
                  }}
                >
                  Upload your PDF / DOCX
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    marginTop: "6px",
                  }}
                >
                  Drop a file here or click Attach to upload. We'll summarize it
                  for you.
                </div>
              </div>

              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                  disabled={uploading}
                />
                <button
                  onClick={() =>
                    !uploading &&
                    fileInputRef.current &&
                    fileInputRef.current.click()
                  }
                  disabled={uploading}
                  style={{
                    backgroundColor: uploading ? "#94a3b8" : "#2563eb",
                    color: "white",
                    border: "none",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    cursor: uploading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  {uploading ? (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ animation: "spin 1s linear infinite" }}
                      >
                        <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                        <path d="M22 12a10 10 0 0 1-10 10" />
                      </svg>
                      Uploading...
                    </>
                  ) : (
                    "Attach"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        <div style={{ marginBottom: "20px" }}>
          {uploading ? (
            <div
              style={{
                color: "#4b5563",
                lineHeight: "1.6",
                fontSize: "14px",
                margin: "0 0 16px 0",
                textAlign: "center",
                padding: "20px",
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                borderRadius: "8px",
                border: "1px solid rgba(59, 130, 246, 0.2)",
              }}
            >
              {/* Framed notice: informs the user about expected wait time for summary */}
              <div
                style={{
                  marginBottom: "12px",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  background: "rgba(255,243,205,0.9)",
                  border: "1px solid rgba(245,158,11,0.2)",
                  color: "#92400e",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                Heads up: it may take about 20–30 seconds for the summary to
                appear.
              </div>

              <div
                style={{
                  fontSize: "12px",
                  color: "#3b82f6",
                  marginBottom: "12px",
                  fontWeight: "600",
                }}
              >
                🔍 Analyzing your document...
              </div>
              <div
                style={{
                  fontSize: "13px",
                  fontStyle: "italic",
                  color: "#6b7280",
                  minHeight: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "opacity 0.3s ease-in-out",
                }}
              >
                {legalQuotes[currentQuoteIndex]}
              </div>
            </div>
          ) : summary && summary !== "No document uploaded yet." ? (
            <div>
              {activeView === "summary" && (
                <div>
                  <h4 style={{ margin: "0 0 8px 0", color: "#374151" }}>
                    Summary
                  </h4>
                  <div
                    style={{
                      color: "#4b5563",
                      fontSize: "14px",
                      lineHeight: 1.6,
                      whiteSpace: "pre-wrap",
                      marginBottom: "12px",
                    }}
                  >
                    {summary}
                  </div>
                </div>
              )}

              {activeView === "clauses" && (
                <div>
                  {importantClauses && importantClauses.length > 0 ? (
                    <div style={{ marginTop: "16px" }}>
                      <h5
                        style={{
                          color: "#1f2937",
                          fontSize: "16px",
                          fontWeight: "600",
                          marginBottom: "12px",
                          borderBottom: "2px solid #e5e7eb",
                          paddingBottom: "6px",
                        }}
                      >
                        📋 Important Clauses
                      </h5>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "12px",
                        }}
                      >
                        {importantClauses.map((clause, index) => (
                          <div
                            key={index}
                            style={{
                              backgroundColor: "#f8fafc",
                              border: "1px solid #e2e8f0",
                              borderRadius: "8px",
                              padding: "12px",
                              borderLeft: "4px solid #3b82f6",
                            }}
                          >
                            <div
                              style={{
                                color: "#1e40af",
                                fontSize: "14px",
                                fontWeight: "600",
                                marginBottom: "6px",
                              }}
                            >
                              Clause {index + 1}
                            </div>
                            <div
                              style={{
                                color: "#374151",
                                fontSize: "13px",
                                lineHeight: 1.5,
                                whiteSpace: "pre-wrap",
                              }}
                            >
                              {clause}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p>No important clauses were identified.</p>
                  )}
                </div>
              )}

              {rawAnalyzeJson && (
                <div style={{ marginTop: "8px" }}>
                  <button
                    onClick={() => setShowAnalyzeDetails((s) => !s)}
                    style={{
                      background: "transparent",
                      border: "1px dashed rgba(55,65,81,0.2)",
                      color: "#6b7280",
                      padding: "6px 10px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "12px",
                    }}
                  >
                    {showAnalyzeDetails ? "Hide details" : "Show details"}
                  </button>
                  {showAnalyzeDetails && (
                    <pre
                      style={{
                        marginTop: "8px",
                        background: "#0f172a",
                        color: "#e6eef8",
                        padding: "12px",
                        borderRadius: "8px",
                        maxHeight: "240px",
                        overflow: "auto",
                        fontSize: "12px",
                      }}
                    >
                      {rawAnalyzeJson}
                    </pre>
                  )}
                </div>
              )}

              <button
                onClick={() => {
                  setSummary("No document uploaded yet.");
                  setUploadedFileName(null);
                  setDocumentId(null);
                  setActiveView("summary");
                  try {
                    localStorage.removeItem("session_id");
                  } catch (e) {}
                }}
                style={{
                  backgroundColor: "#2563eb",
                  color: "white",
                  border: "none",
                  padding: "8px 12px",
                  marginTop: "12px",
                  marginLeft: "6px",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Upload another
              </button>
            </div>
          ) : (
            <>
              <p
                style={{
                  color: "#4b5563",
                  lineHeight: "1.6",
                  fontSize: "14px",
                  margin: "0 0 16px 0",
                  textAlign: "justify",
                }}
              >
                The document has been reviewed for key obligations, potential
                liabilities, and noteworthy contractual terms. Our analysis
                highlights several provisions that warrant closer attention,
                including ambiguous indemnity language, restrictive termination
                clauses, and deadlines that may create operational risk if not
                monitored. We recommend a focused review of the identified
                sections and, where appropriate, targeted revisions to clarify
                obligations and mitigate exposure.
              </p>

              <p
                style={{
                  color: "#4b5563",
                  lineHeight: "1.6",
                  fontSize: "14px",
                  margin: "0 0 16px 0",
                  textAlign: "justify",
                }}
              >
                The analysis methodology incorporates advanced natural language
                processing techniques to extract key information from legal
                documents. Our proprietary AI algorithm identifies potential
                risks, obligations, and important terms that require your
                attention.
              </p>
            </>
          )}
        </div>

        {showUploadHint && (
          <div style={{ marginTop: "8px", color: "#f97316", fontSize: "13px" }}>
            Please attach a document using the Attach button before asking
            questions.
          </div>
        )}
      </div>
    </div>
  );
}
