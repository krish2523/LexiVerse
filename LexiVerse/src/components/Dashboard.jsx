import React, { useState, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { ScalesOfJustice } from "./ScalesOfJustice";

export default function Dashboard() {
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

  // Upload file to backend and fetch summary (supports immediate summary or polling by taskId)
  const uploadFile = async (file) => {
    try {
      setUploading(true);
      setUploadedFileName(file.name);

      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || res.statusText);
      }

      const data = await res.json();
      // If backend returns summary directly
      if (data.summary) {
        if (data.documentId) setDocumentId(data.documentId);
        setSummary(data.summary);
        return;
      }

      // If backend returns a taskId, poll for result
      if (data.taskId) {
        // some backends may also return a documentId to reference the stored file
        if (data.documentId) setDocumentId(data.documentId);
        const taskId = data.taskId;
        for (let i = 0; i < 30; i++) {
          await new Promise((r) => setTimeout(r, 1000));
          try {
            const poll = await fetch(`/api/summary/${taskId}`);
            if (!poll.ok) continue;
            const dd = await poll.json();
            if (dd.summary) {
              if (dd.documentId) setDocumentId(dd.documentId);
              setSummary(dd.summary);
              break;
            }
          } catch (e) {
            // ignore and continue polling
          }
        }
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
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, documentId }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      const reply = data.reply || data.answer || data.response || "(no reply)";
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
      `}</style>

      <div
        style={{
          width: "100vw",
          height: "100vh",
          background: "linear-gradient(180deg, #1e1b4b 0%, #0c0a1d 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* UI Panels */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            gap: "24px",
          }}
        >
          {/* Left Panel - Document Summary */}
          <div
            style={{
              width: "480px", // Slightly wider to accommodate A4 + padding
              height: "650px", // Taller to accommodate A4 + padding
              maxWidth: "48%", // Responsive fallback
              maxHeight: "90%", // Responsive fallback
              backgroundColor: "rgba(20, 20, 25, 0.05)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "24px",
              padding: "40px", // Increased padding for better A4 spacing

              color: "white",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* White A4 Page Content Box */}
            <div
              style={{
                width: "400px",
                height: "566px", // A4 ratio: 400 * 1.414 = ~566px
                maxWidth: "90%",
                maxHeight: "90%",
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                padding: "40px",
                paddingRight: "48px",
                paddingLeft: "40px",
                borderRadius: "0px",
                color: "#1f2937",
                overflow: "auto",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
                margin: "auto",
                position: "relative",
                scrollBehavior: "smooth",
                // Modern scrollbar styling
                scrollbarWidth: "thin",
                scrollbarColor: "#cbd5e1 transparent",
              }}
              className="modern-scroll"
            >
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

              {/* Upload Frame */}
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
                    />
                    <button
                      onClick={() =>
                        fileInputRef.current && fileInputRef.current.click()
                      }
                      style={{
                        backgroundColor: "#2563eb",
                        color: "white",
                        border: "none",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        cursor: "pointer",
                      }}
                    >
                      Attach
                    </button>
                  </div>
                </div>
              </div>

              {/* Summary Display */}
              <div style={{ marginBottom: "12px" }}>
                <h3 style={{ margin: "8px 0", color: "#374151" }}>Summary</h3>
                <div
                  style={{
                    color: "#4b5563",
                    fontSize: "14px",
                    lineHeight: 1.6,
                  }}
                >
                  {uploading
                    ? "Uploading file and fetching summary..."
                    : summary}
                </div>
              </div>

              {/* Main Content: show backend summary when available */}
              <div style={{ marginBottom: "20px" }}>
                {uploading ? (
                  <p
                    style={{
                      color: "#4b5563",
                      lineHeight: "1.6",
                      fontSize: "14px",
                      margin: "0 0 16px 0",
                      textAlign: "justify",
                    }}
                  >
                    Uploading file and fetching summary...
                  </p>
                ) : summary && summary !== "No document uploaded yet." ? (
                  <div>
                    <h4 style={{ margin: "0 0 8px 0", color: "#374151" }}>
                      Summary (from backend)
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

                    <button
                      onClick={() => {
                        setSummary("No document uploaded yet.");
                        setUploadedFileName(null);
                        setDocumentId(null);
                      }}
                      style={{
                        backgroundColor: "#2563eb",
                        color: "white",
                        border: "none",
                        padding: "8px 12px",
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
          <div
            style={{
              width: "40%",
              height: "95vh",
              backgroundColor: "rgba(20, 20, 25, 0.05)",
              backdropFilter: "blur(2px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "24px",
              color: "white",
              display: "flex",
              flexDirection: "column",
            }}
          >
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
                >
                  Document Assistant
                </h2>
                <p style={{ fontSize: "14px", color: "#9ca3af", margin: 0 }}>
                  Ask questions about your uploaded PDF document
                </p>
                {uploadedFileName && (
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#9ca3af",
                      marginTop: "6px",
                    }}
                  >
                    Uploaded: {uploadedFileName}
                  </div>
                )}
              </div>
              <div style={{ width: "100px", height: "100px" }}>
                <Canvas camera={{ position: [0, 0, 2], fov: 50 }}>
                  <ambientLight intensity={2.5} />
                  <directionalLight position={[3, 3, 3]} intensity={2} />
                  <pointLight
                    position={[0, 1, 2]}
                    intensity={3}
                    color="#e0dffc"
                  />
                  <ScalesOfJustice scale={0.3} position={[0, -0.5, 0]} />
                </Canvas>
              </div>
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
                      maxWidth: "85%",
                      color: msg.role === "user" ? "white" : "#e5e7eb",
                    }}
                  >
                    <p
                      style={{ margin: 0, fontSize: "14px", lineHeight: "1.5" }}
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
