import React, { useState, useRef, useEffect, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { ScalesOfJustice } from "./ScalesOfJustice";

export default function Dashboard() {
  // Vite exposes environment variables via import.meta.env
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
  // missing state vars (were accidentally removed) — restore them
  const [uploadedFileName, setUploadedFileName] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [summary, setSummary] = useState("No document uploaded yet.");
  const [documentId, setDocumentId] = useState(null);

  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 0,
      role: "assistant",
      text: "Hello! I'm your document assistant. Upload a file to get started.",
    },
  ]);

  const fileInputRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [showUploadHint, setShowUploadHint] = useState(false);
  const [rawAnalyzeJson, setRawAnalyzeJson] = useState(null);
  const [showAnalyzeDetails, setShowAnalyzeDetails] = useState(false);

  // 3D Model Error Boundary
  const [modelError, setModelError] = useState(false);

  const ThreeDModel = () => {
    if (modelError) {
      return (
        <div style={{ 
          width: "100px", 
          height: "100px", 
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          borderRadius: "50%",
          border: "2px solid rgba(59, 130, 246, 0.3)"
        }}>
          <span style={{ fontSize: "24px" }}>⚖️</span>
        </div>
      );
    }

    try {
      return (
        <div style={{ width: "100px", height: "100px" }}>
          <Canvas 
            camera={{ position: [0, 0, 2], fov: 50 }}
            onError={() => {
              console.warn("Canvas error occurred");
              setModelError(true);
            }}
          >
            <ambientLight intensity={2.5} />
            <directionalLight position={[3, 3, 3]} intensity={2} />
            <pointLight
              position={[0, 1, 2]}
              intensity={3}
              color="#e0dffc"
            />
            <Suspense 
              fallback={null}
              onError={() => {
                console.warn("Suspense error in 3D model");
                setModelError(true);
              }}
            >
              <ScalesOfJustice 
                scale={0.3} 
                position={[0, -0.5, 0]}
                onError={() => setModelError(true)}
              />
            </Suspense>
          </Canvas>
        </div>
      );
    } catch (error) {
      console.warn("3D Model error:", error);
      setModelError(true);
      return (
        <div style={{ 
          width: "100px", 
          height: "100px", 
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          borderRadius: "50%",
          border: "2px solid rgba(59, 130, 246, 0.3)"
        }}>
          <span style={{ fontSize: "24px" }}>⚖️</span>
        </div>
      );
    }
  };

  // Legal quotes and facts for upload animation
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const legalQuotes = [
    '⚖️ "The law is reason, free from passion." - Aristotle',
    "📚 Fun Fact: The word 'attorney' comes from French 'attorne' meaning 'one appointed'",
    '🏛️ "Justice delayed is justice denied." - William E. Gladstone',
    "💡 Did you know? The first law school was established in Bologna, Italy in 1088",
    '⚖️ "The good lawyer is not the man who has an eye to every side and angle..." - Ralph Waldo Emerson',
    "📖 Fun Fact: A group of lawyers is called a 'disputation' or 'arguing'",
    '🏛️ "Laws are like sausages, it is better not to see them being made." - Otto von Bismarck',
    "💼 Did you know? The Bar exam got its name from the physical barrier in courtrooms",
    '⚖️ "The first thing we do, let\'s kill all the lawyers." - Shakespeare (Henry VI)',
    "🎯 Fun Fact: Legal documents average 15% longer today than they were 20 years ago",
  ];

  // load saved session id from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("session_id");
      if (saved) setDocumentId(saved);
    } catch (e) {
      // ignore
    }
  }, []);

  // Cycle through legal quotes during upload
  useEffect(() => {
    let interval;
    if (uploading) {
      interval = setInterval(() => {
        setCurrentQuoteIndex((prev) => (prev + 1) % legalQuotes.length);
      }, 4000); // Change quote every 4 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [uploading, legalQuotes.length]);

  // Upload file to backend and fetch summary (supports immediate summary or polling by taskId)
  const uploadFile = async (file) => {
    try {
      setUploading(true);
      setUploadedFileName(file.name);

      // Create two separate FormData objects — one for analysis, one for chat init
      const analyzeFd = new FormData();
      analyzeFd.append("file", file);
      const initFd = new FormData();
      initFd.append("file", file);

      // Fire both requests in parallel and wait for both to settle
      const [analyzeResult, initResult] = await Promise.allSettled([
        fetch(`${apiUrl}/analyze-document`, {
          method: "POST",
          body: analyzeFd,
        }),
        fetch(`${apiUrl}/chat`, { method: "POST", body: initFd }),
      ]);

      // Process analyzer response first (prefer this summary)
      if (analyzeResult.status === "fulfilled") {
        const analyzeRes = analyzeResult.value;
        if (analyzeRes && analyzeRes.ok) {
          const analyzeData = await analyzeRes.json();
          console.log(
            "FULL analyzeData response:",
            JSON.stringify(analyzeData, null, 2)
          );
          console.log("analyzeData.summary:", analyzeData.summary);
          console.log("analyzeData.decision:", analyzeData.decision);

          if (analyzeData.decision && analyzeData.decision === "reject") {
            const reason =
              analyzeData.reason || "Document rejected by analyzer.";
            setSummary(`Rejected: ${reason}`);
            const assistantMsg = {
              id: Date.now() + Math.random(),
              role: "assistant",
              text: `Document rejected: ${reason}`,
            };
            setMessages((m) => [...m, assistantMsg]);
            // still allow chat init response to set session_id below
            try {
              setRawAnalyzeJson(JSON.stringify(analyzeData, null, 2));
            } catch (e) {
              setRawAnalyzeJson(String(analyzeData));
            }
          } else if (analyzeData.summary && analyzeData.summary.trim()) {
            const s = analyzeData.summary;
            const lowered = String(s).toLowerCase();
            if (
              lowered.includes("validation error") ||
              lowered.includes("input should be a valid string") ||
              lowered.includes("structured parsing failed")
            ) {
              try {
                setRawAnalyzeJson(JSON.stringify(analyzeData, null, 2));
              } catch (e) {
                setRawAnalyzeJson(String(analyzeData));
              }
              setSummary(
                "Document analysis returned an unexpected format. Please try again or view details."
              );
            } else {
              setSummary(analyzeData.summary);
              setRawAnalyzeJson(null);
            }
          } else {
            try {
              setRawAnalyzeJson(JSON.stringify(analyzeData, null, 2));
            } catch (e) {
              setRawAnalyzeJson(String(analyzeData));
            }
            setSummary(
              `No summary in response. Backend returned an unexpected format. Please view details.`
            );
          }
        } else {
          // analyzer returned non-ok
          try {
            const txt = analyzeRes
              ? await analyzeRes.text()
              : "Analyzer request failed";
            setSummary("Failed to analyze: " + txt);
          } catch (e) {
            setSummary("Failed to analyze: unknown error");
          }
        }
      } else {
        setSummary(
          "Analyzer request failed: " +
            (analyzeResult.reason && analyzeResult.reason.message)
        );
      }

      // Then process chat init result to persist session id
      if (initResult.status === "fulfilled") {
        const initRes = initResult.value;
        if (initRes && initRes.ok) {
          const initJson = await initRes.json();
          console.log(
            "FULL initJson response:",
            JSON.stringify(initJson, null, 2)
          );
          console.log("initJson.session_id:", initJson.session_id);
          console.log("initJson.response:", initJson.response);
          if (initJson.session_id) {
            setDocumentId(initJson.session_id);
            try {
              localStorage.setItem("session_id", initJson.session_id);
            } catch (e) {
              // ignore
            }
          }
          // Only set summary from init if analyzer didn't provide one
          if (
            (!analyzeResult || analyzeResult.status !== "fulfilled") &&
            initJson.response
          ) {
            setSummary(initJson.response);
          }
        } else {
          // init returned non-ok — log
          try {
            const txt = initRes ? await initRes.text() : "Chat init failed";
            console.warn("Chat init failed:", txt);
          } catch (e) {
            console.warn("Chat init failed with unknown error");
          }
        }
      } else {
        console.warn("Chat init request failed:", initResult.reason);
      }
    } catch (e) {
      setSummary("Failed to upload: " + e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) uploadFile(file);
  };

  const sendMessage = async (text) => {
    if (!text) return;
    const userMsg = { id: Date.now() + Math.random(), role: "user", text };
    setMessages((m) => [...m, userMsg]);

    const placeholder = {
      id: Date.now() + Math.random(),
      role: "assistant",
      text: "Fetching answer...",
    };
    setMessages((m) => [...m, placeholder]);

    // clear input immediately so user sees their message was sent
    setChatInput("");

    try {
      // send message + session_id via multipart/form-data to /chat
      const fd = new FormData();
      fd.append("message", text);
      if (documentId) fd.append("session_id", documentId);

      const res = await fetch(`${apiUrl}/chat`, {
        method: "POST",
        body: fd,
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      const reply = data.response || data.reply || data.answer || "(no reply)";
      if (data.session_id) setDocumentId(data.session_id);
      setMessages((m) =>
        m.map((it) => (it.id === placeholder.id ? { ...it, text: reply } : it))
      );
    } catch (e) {
      setMessages((m) =>
        m.map((it) =>
          it.id === placeholder.id ? { ...it, text: "Error: " + e.message } : it
        )
      );
    }
  };

  const handleChatKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (uploading || !documentId) {
        // still show the user's message in the chat even if no document is attached
        const text = chatInput && chatInput.trim();
        if (text) {
          const userMsg = {
            id: Date.now() + Math.random(),
            role: "user",
            text,
          };
          setMessages((m) => [...m, userMsg]);
          setChatInput("");
        }

        // prompt the user to upload a document first
        const hint = {
          id: Date.now() + Math.random(),
          role: "assistant",
          text: "Please upload a document first so I can answer questions about it.",
        };
        setMessages((m) => [...m, hint]);
        setShowUploadHint(true);
        setTimeout(() => setShowUploadHint(false), 3500);
        return;
      }

      sendMessage(chatInput.trim());
    }
  };

  // auto-scroll chat to bottom when messages change
  useEffect(() => {
    try {
      const el = chatContainerRef.current;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    } catch (e) {
      // ignore
    }
  }, [messages]);

  return (
    <div>
      {/* Modern Scroll Styling */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .modern-scroll {
          transition: box-shadow 0.3s ease, transform 0.1s ease;
        }
        
        .modern-scroll:hover {
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
          transform: translateY(-2px);
        }
        
        /* Webkit browsers (Chrome, Safari, Edge) */
        .modern-scroll::-webkit-scrollbar {
          width: 8px;
        }
        
        .modern-scroll::-webkit-scrollbar-track {
          background: rgba(241, 245, 249, 0.3);
          border-radius: 10px;
          margin: 5px;
        }
        
        .modern-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #cbd5e1 0%, #94a3b8 100%);
          border-radius: 10px;
          transition: all 0.3s ease;
        }
        
        .modern-scroll::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #94a3b8 0%, #64748b 100%);
          transform: scaleX(1.2);
        }
        
        .modern-scroll::-webkit-scrollbar-thumb:active {
          background: linear-gradient(180deg, #64748b 0%, #475569 100%);
        }
        
        /* Smooth scroll animation */
        .modern-scroll {
          scroll-padding-top: 20px;
        }
        
        .modern-scroll:active {
          transform: translateY(0px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
        }

        /* Responsive Dashboard Layout */
        .dashboard-container {
          position: fixed !important;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100vw !important;
          height: 100vh !important;
          background: linear-gradient(180deg, #1e1b4b 0%, #0c0a1d 100%);
          overflow: hidden !important;
          box-sizing: border-box !important;
        }

        .panels-wrapper {
          position: relative;
          z-index: 10;
          width: 100% !important;
          height: 100% !important;
          display: flex !important;
          align-items: center;
          justify-content: center;
          padding: 16px;
          gap: 24px;
          box-sizing: border-box !important;
        }

        /* Desktop Layout (>1024px) */
        .left-panel {
          width: 500px;
          height: 720px;
          background-color: rgba(20, 20, 25, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 24px;
          padding: 40px;
          color: white;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
        }

        .right-panel {
          width: 700px;
          height: 720px;
          background-color: rgba(20, 20, 25, 0.05);
          backdrop-filter: blur(2px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 24px;
          color: white;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
        }

        .a4-page {
          width: 420px;
          height: 650px;
          background-color: rgba(255, 255, 255, 0.95);
          padding: 40px;
          border-radius: 0px;
          color: #1f2937;
          overflow: auto;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
          margin: auto;
          position: relative;
          scroll-behavior: smooth;
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 transparent;
          box-sizing: border-box;
        }

        /* Tablet Layout (768px - 1024px) */
        @media (max-width: 1024px) {
          .panels-wrapper {
            flex-direction: column !important;
            gap: 16px !important;
            padding: 12px !important;
          }
          
          .left-panel,
          .right-panel {
            width: min(95vw, 800px) !important;
            height: min(45vh, 400px) !important;
            padding: 24px !important;
          }
          
          .a4-page {
            width: 95% !important;
            height: 90% !important;
            padding: 24px !important;
          }
        }

        /* Mobile Layout (<768px) */
        @media (max-width: 768px) {
          .panels-wrapper {
            gap: 12px !important;
            padding: 8px !important;
          }
          
          .left-panel,
          .right-panel {
            width: 98vw !important;
            height: min(42vh, 350px) !important;
            padding: 16px !important;
            border-radius: 16px !important;
          }
          
          .a4-page {
            width: 98% !important;
            height: 95% !important;
            padding: 16px !important;
          }
        }

        /* Touch-friendly buttons */
        @media (max-width: 768px) {
          button {
            min-height: 44px !important;
            padding: 12px 16px !important;
            font-size: 16px !important;
            touch-action: manipulation !important;
          }
          
          input[type="file"] + button {
            min-height: 48px !important;
          }
        }

        /* Mobile typography adjustments */
        @media (max-width: 768px) {
          .mobile-title {
            font-size: 20px !important;
          }
          
          .mobile-text {
            font-size: 14px !important;
            line-height: 1.5 !important;
          }
          
          .mobile-small {
            font-size: 12px !important;
          }
        }

        /* Additional responsive fixes */
        @media (max-width: 1024px) {
          * {
            box-sizing: border-box !important;
          }
        }
      `}</style>

      <div className="dashboard-container">
        {/* UI Panels */}
        <div className="panels-wrapper">
          {/* Left Panel - Document Summary */}
          <div className="left-panel">
            {/* White A4 Page Content Box */}
            <div className="a4-page modern-scroll">
              {/* Document Header */}
              <div
                style={{
                  marginBottom: "20px",
                }}
              >
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

              {/* Upload Frame - only show when no document is uploaded */}
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
                        Drop a file here or click Attach to upload. We'll
                        summarize it for you.
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
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
                              <circle
                                cx="12"
                                cy="12"
                                r="10"
                                strokeOpacity="0.25"
                              />
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

              {/* Main Content: show backend summary when available */}
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
                        try {
                          localStorage.removeItem("session_id");
                        } catch (e) {
                          // ignore
                        }
                      }}
                      style={{
                        backgroundColor: "#2563eb",
                        color: "white",
                        border: "none",
                        padding: "8px 12px",
                        marginTop: "12px", // add spacing from the text above
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
                      The document has been reviewed for key obligations,
                      potential liabilities, and noteworthy contractual terms.
                      Our analysis highlights several provisions that warrant
                      closer attention, including ambiguous indemnity language,
                      restrictive termination clauses, and deadlines that may
                      create operational risk if not monitored. We recommend a
                      focused review of the identified sections and, where
                      appropriate, targeted revisions to clarify obligations and
                      mitigate exposure.
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
                      The analysis methodology incorporates advanced natural
                      language processing techniques to extract key information
                      from legal documents. Our proprietary AI algorithm
                      identifies potential risks, obligations, and important
                      terms that require your attention.
                    </p>
                  </>
                )}
              </div>
              {showUploadHint && (
                <div
                  style={{
                    marginTop: "8px",
                    color: "#f97316",
                    fontSize: "13px",
                  }}
                >
                  Please attach a document using the Attach button before asking
                  questions.
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - RAG Chatbot */}
          <div className="right-panel">
            {/* Header */}
            <div
              style={{
                padding: "24px",
                borderBottom: "1px solid rgba(75, 85, 99, 0.3)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: "24px",
                    fontWeight: "600",
                    margin: "0 0 8px 0",
                    color: "white",
                  }}
                  className="mobile-title"
                >
                  Document Assistant
                </h2>
                <p
                  style={{ fontSize: "14px", color: "#9ca3af", margin: 0 }}
                  className="mobile-text"
                >
                  Ask questions about your uploaded PDF document
                </p>
                {uploadedFileName && (
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#9ca3af",
                      marginTop: "6px",
                    }}
                    className="mobile-small"
                  >
                    Uploaded: {uploadedFileName}
                  </div>
                )}
              </div>
              <ThreeDModel />
            </div>

            {/* Chat Messages Area */}
            <div
              style={{
                flex: 1,
                padding: "20px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                scrollBehavior: "smooth",
              }}
              className="chat-messages"
              ref={chatContainerRef}
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                    justifyContent:
                      msg.role === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  {msg.role !== "user" && (
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        backgroundColor: "#3b82f6",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "16px",
                        flexShrink: 0,
                      }}
                    >
                      🤖
                    </div>
                  )}

                  <div
                    style={{
                      backgroundColor:
                        msg.role === "user"
                          ? "#3b82f6"
                          : "rgba(55, 65, 81, 0.6)",
                      padding: "12px 16px",
                      borderRadius: "16px",
                      borderTopLeftRadius:
                        msg.role === "assistant" ? "4px" : "16px",
                      borderTopRightRadius:
                        msg.role === "user" ? "4px" : "16px",

                      maxWidth: "70%", // reduce bubble width for readability
                      display: "inline-block",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      color: msg.role === "user" ? "white" : "#e5e7eb",
                      fontFamily:
                        "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: "14px",
                        lineHeight: "1.5",
                        fontFamily: "inherit",
                      }}
                    >
                      {msg.text}
                    </p>
                  </div>

                  {msg.role === "user" && (
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        backgroundColor: "#6b7280",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "16px",
                        flexShrink: 0,
                      }}
                    >
                      👤
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div
              style={{
                padding: "20px",
                borderTop: "1px solid rgba(75, 85, 99, 0.3)",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  maxWidth: "100%",
                  boxSizing: "border-box",
                }}
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={handleChatKeyDown}
                  placeholder="Ask me anything about your document..."
                  style={{
                    width: "100%",
                    backgroundColor: "rgba(55, 65, 81, 0.6)",
                    border: "1px solid rgba(75, 85, 99, 0.8)",
                    borderRadius: "12px",
                    padding: "14px 60px 14px 16px",
                    color: "white",
                    fontSize: "14px",
                    fontFamily:
                      "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
                    outline: "none",
                    boxSizing: "border-box",
                    maxWidth: "100%",
                    transition: "all 0.2s ease",
                  }}
                  onFocus={(e) => {
                    e.target.style.backgroundColor = "rgba(55, 65, 81, 0.8)";
                    e.target.style.borderColor = "#3b82f6";
                  }}
                  onBlur={(e) => {
                    e.target.style.backgroundColor = "rgba(55, 65, 81, 0.6)";
                    e.target.style.borderColor = "rgba(75, 85, 99, 0.8)";
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    right: "8px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <button
                    style={{
                      backgroundColor: "#3b82f6",
                      border: "none",
                      borderRadius: "8px",
                      padding: "8px 12px",
                      color: "white",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: "500",
                      transition: "all 0.2s ease",
                    }}
                    onClick={() => {
                      if (uploading || !documentId) {
                        // append the user's message first so it appears in the chat
                        const text = chatInput && chatInput.trim();
                        if (text) {
                          const userMsg = {
                            id: Date.now() + Math.random(),
                            role: "user",
                            text,
                          };
                          setMessages((m) => [...m, userMsg]);
                          setChatInput("");
                        }

                        const hint = {
                          id: Date.now() + Math.random(),
                          role: "assistant",
                          text: "Please upload a document first so I can answer questions about it.",
                        };
                        setMessages((m) => [...m, hint]);
                        setShowUploadHint(true);
                        setTimeout(() => setShowUploadHint(false), 3500);
                        return;
                      }
                      sendMessage(chatInput.trim());
                    }}
                    disabled={uploading || !documentId}
                    onMouseOver={(e) => {
                      e.target.style.backgroundColor = "#2563eb";
                    }}
                    onMouseOut={(e) => {
                      e.target.style.backgroundColor = "#3b82f6";
                    }}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
