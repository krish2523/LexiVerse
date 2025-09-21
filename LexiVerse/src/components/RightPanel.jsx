import React from "react";
import ThreeDModel from "./ThreeDModel";

export default function RightPanel(props) {
  const {
    uploadedFileName,
    documentId,
    messages,
    chatContainerRef,
    chatInput,
    setChatInput,
    handleChatKeyDown,
    sendMessage,
    uploading,
    setMessages,
    setShowUploadHint,
    setDocumentId,
    modelError,
    setModelError,
  } = props;

  return (
    <div className="right-panel">
      <div style={{ padding: "24px", borderBottom: "1px solid rgba(75, 85, 99, 0.3)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: "24px", fontWeight: "600", margin: "0 0 8px 0", color: "white" }} className="mobile-title">Document Assistant</h2>
          <p style={{ fontSize: "14px", color: "#9ca3af", margin: 0 }} className="mobile-text">Ask questions about your uploaded PDF document</p>
          {uploadedFileName && <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "6px" }} className="mobile-small">Uploaded: {uploadedFileName}</div>}
        </div>
        <ThreeDModel modelError={modelError} setModelError={setModelError} />
      </div>

      <div style={{ flex: 1, padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px", scrollBehavior: "smooth" }} className="chat-messages" ref={chatContainerRef}>
        {messages.map((msg) => (
          <div key={msg.id} style={{ display: "flex", alignItems: "flex-start", gap: "12px", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
            {msg.role !== "user" && (
              <div style={{ width: "32px", height: "32px", backgroundColor: "#3b82f6", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>🤖</div>
            )}

            <div style={{ backgroundColor: msg.role === "user" ? "#3b82f6" : "rgba(55, 65, 81, 0.6)", padding: "12px 16px", borderRadius: "16px", borderTopLeftRadius: msg.role === "assistant" ? "4px" : "16px", borderTopRightRadius: msg.role === "user" ? "4px" : "16px", maxWidth: "70%", display: "inline-block", whiteSpace: "pre-wrap", wordBreak: "break-word", color: msg.role === "user" ? "white" : "#e5e7eb", fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" }}>
              <p style={{ margin: 0, fontSize: "14px", lineHeight: "1.5", fontFamily: "inherit" }}>{msg.text}</p>
            </div>

            {msg.role === "user" && (
              <div style={{ width: "32px", height: "32px", backgroundColor: "#6b7280", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>👤</div>
            )}
          </div>
        ))}
      </div>

      <div style={{ padding: "20px", borderTop: "1px solid rgba(75, 85, 99, 0.3)" }}>
        <div style={{ position: "relative", width: "100%", maxWidth: "100%", boxSizing: "border-box" }}>
          <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={handleChatKeyDown} placeholder="Ask me anything about your document..." style={{ width: "100%", backgroundColor: "rgba(55, 65, 81, 0.6)", border: "1px solid rgba(75, 85, 99, 0.8)", borderRadius: "12px", padding: "14px 60px 14px 16px", color: "white", fontSize: "14px", fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial", outline: "none", boxSizing: "border-box", maxWidth: "100%", transition: "all 0.2s ease" }} onFocus={(e) => { e.target.style.backgroundColor = "rgba(55, 65, 81, 0.8)"; e.target.style.borderColor = "#3b82f6"; }} onBlur={(e) => { e.target.style.backgroundColor = "rgba(55, 65, 81, 0.6)"; e.target.style.borderColor = "rgba(75, 85, 99, 0.8)"; }} />
          <div style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", gap: "4px" }}>
            <button style={{ backgroundColor: "#3b82f6", border: "none", borderRadius: "8px", padding: "8px 12px", color: "white", cursor: "pointer", fontSize: "12px", fontWeight: "500", transition: "all 0.2s ease" }} onClick={() => { if (uploading || !documentId) { const text = chatInput && chatInput.trim(); if (text) { const userMsg = { id: Date.now() + Math.random(), role: "user", text }; setMessages((m) => [...m, userMsg]); setChatInput(""); } const hint = { id: Date.now() + Math.random(), role: "assistant", text: "Please upload a document first so I can answer questions about it.", }; setMessages((m) => [...m, hint]); setShowUploadHint(true); setTimeout(() => setShowUploadHint(false), 3500); return; } sendMessage(chatInput.trim()); }} disabled={uploading || !documentId} onMouseOver={(e) => { e.target.style.backgroundColor = "#2563eb"; }} onMouseOut={(e) => { e.target.style.backgroundColor = "#3b82f6"; }}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}
