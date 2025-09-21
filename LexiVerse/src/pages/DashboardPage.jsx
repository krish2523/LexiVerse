import React, { useState, useRef, useEffect } from "react";
import LeftPanel from "../components/LeftPanel";
import RightPanel from "../components/RightPanel";

export default function DashboardPage() {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
  const [uploadedFileName, setUploadedFileName] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [summary, setSummary] = useState("No document uploaded yet.");
  const [importantClauses, setImportantClauses] = useState([]);
  const [documentId, setDocumentId] = useState(null);

  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([
    { id: 0, role: "assistant", text: "Hello! I'm your document assistant. Upload a file to get started." },
  ]);

  const fileInputRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [showUploadHint, setShowUploadHint] = useState(false);
  const [rawAnalyzeJson, setRawAnalyzeJson] = useState(null);
  const [showAnalyzeDetails, setShowAnalyzeDetails] = useState(false);

  const [modelError, setModelError] = useState(false);
  const [activeView, setActiveView] = useState("summary");

  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const legalQuotes = [
    '⚖️ "The law is reason, free from passion." - Aristotle',
    "📚 Fun Fact: The word 'attorney' comes from French 'attorne' meaning 'one appointed'",
    '🏛️ "Justice delayed is justice denied." - William E. Gladstone',
    "💡 Did you know? The first law school was established in Bologna, Italy in 1088",
  ];

  useEffect(() => {
    try {
      const saved = localStorage.getItem("session_id");
      if (saved) setDocumentId(saved);
    } catch (e) {}
  }, []);

  useEffect(() => {
    let interval;
    if (uploading) interval = setInterval(() => setCurrentQuoteIndex((p) => (p + 1) % legalQuotes.length), 4000);
    return () => interval && clearInterval(interval);
  }, [uploading]);

  // copy handlers (uploadFile, handleFileChange, sendMessage, handleChatKeyDown) from Dashboard.jsx
  const uploadFile = async (file) => {
    try {
      setUploading(true);
      setUploadedFileName(file.name);
      setImportantClauses([]);

      const analyzeFd = new FormData();
      analyzeFd.append("file", file);

      const analyzeRes = await fetch(`${apiUrl}/analyze-document`, { method: "POST", body: analyzeFd });
      if (analyzeRes && analyzeRes.ok) {
        const analyzeData = await analyzeRes.json();
        console.log("FULL analyzeData response:", analyzeData);

        const isRejected = analyzeData.decision && ["reject", "rejected", "rejection"].includes(String(analyzeData.decision).toLowerCase());

        if (isRejected || analyzeData.reason) {
          const reason = analyzeData.reason || "Document rejected by analyzer.";
          setSummary(reason);
          setMessages((m) => [...m, { id: Date.now() + Math.random(), role: "assistant", text: reason }]);
          setTimeout(() => {
            try { setRawAnalyzeJson(JSON.stringify(analyzeData, null, 2)); } catch (e) { setRawAnalyzeJson(String(analyzeData)); }
          }, 0);
          return;
        }

        if (analyzeData.summary && analyzeData.summary.trim()) {
          const s = analyzeData.summary;
          const lowered = String(s).toLowerCase();
          if (lowered.includes("validation error") || lowered.includes("input should be a valid string") || lowered.includes("structured parsing failed")) {
            setTimeout(() => { try { setRawAnalyzeJson(JSON.stringify(analyzeData, null, 2)); } catch (e) { setRawAnalyzeJson(String(analyzeData)); } }, 0);
            setSummary("Document analysis returned an unexpected format. Please try again or view details.");
          } else {
            setSummary(analyzeData.summary);
            setRawAnalyzeJson(null);
            if (analyzeData.important_clauses && Array.isArray(analyzeData.important_clauses)) setImportantClauses(analyzeData.important_clauses);
            else setImportantClauses([]);
          }
        } else {
          if (analyzeData.reason) setSummary(`Analysis issue: ${analyzeData.reason}`);
          else if (analyzeData.error) setSummary(`Error: ${analyzeData.error}`);
          else if (analyzeData.message) setSummary(`Message: ${analyzeData.message}`);
          else setSummary(`No summary in response. Backend returned an unexpected format. Please view details.`);
          setTimeout(() => { try { setRawAnalyzeJson(JSON.stringify(analyzeData, null, 2)); } catch (e) { setRawAnalyzeJson(String(analyzeData)); } }, 0);
        }
      } else {
        try { const txt = analyzeRes ? await analyzeRes.text() : "Analyzer request failed"; setSummary("Failed to analyze: " + txt); } catch (e) { setSummary("Failed to analyze: unknown error"); }
      }

      const initFd = new FormData();
      initFd.append("file", file);
      try {
        const initRes = await fetch(`${apiUrl}/chat`, { method: "POST", body: initFd });
        if (initRes && initRes.ok) {
          const initJson = await initRes.json();
          if (initJson.session_id) {
            setDocumentId(initJson.session_id);
            try { localStorage.setItem("session_id", initJson.session_id); } catch (e) {}
          }
        } else {
          try { const txt = initRes ? await initRes.text() : "Chat init failed"; console.warn("Chat init failed:", txt); } catch (e) { console.warn("Chat init failed with unknown error"); }
        }
      } catch (e) { console.warn("Chat init request failed:", e); }
    } catch (e) { setSummary("Failed to upload: " + e.message); } finally { setUploading(false); }
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setMessages([{ id: 0, role: "assistant", text: "Hello! I'm your document assistant. Upload a file to get started." }]);
      setDocumentId(null);
      setChatInput("");
      setSummary("No document uploaded yet.");
      setImportantClauses([]);
      setRawAnalyzeJson(null);
      setShowAnalyzeDetails(false);

      uploadFile(file);
    }
  };

  const sendMessage = async (text) => {
    if (!text) return;
    const userMsg = { id: Date.now() + Math.random(), role: "user", text };
    setMessages((m) => [...m, userMsg]);

    const placeholder = { id: Date.now() + Math.random(), role: "assistant", text: "...", animating: true };
    setMessages((m) => [...m, placeholder]);

    let ellipsisIndex = 0;
    const ellipsisInterval = setInterval(() => {
      const dots = ".".repeat((ellipsisIndex % 3) + 1);
      setMessages((msgs) => msgs.map((it) => (it.id === placeholder.id ? { ...it, text: dots } : it)));
      ellipsisIndex += 1;
    }, 400);

    setChatInput("");

    try {
      const fd = new FormData();
      fd.append("message", text);
      if (documentId) fd.append("session_id", documentId);

      const res = await fetch(`${apiUrl}/chat`, { method: "POST", body: fd });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      const reply = data.response || data.reply || data.answer || "(no reply)";
      if (data.session_id) setDocumentId(data.session_id);

      clearInterval(ellipsisInterval);

      const words = String(reply).split(/(\s+)/);
      let idx = 0;
      const revealInterval = setInterval(() => {
        setMessages((msgs) => msgs.map((it) => (it.id !== placeholder.id ? it : { ...it, text: words.slice(0, idx + 1).join("") })));
        idx += 1;
        if (idx >= words.length) clearInterval(revealInterval);
      }, 40);
    } catch (e) {
      clearInterval(ellipsisInterval);
      setMessages((m) => m.map((it) => (it.id === placeholder.id ? { ...it, text: "Error: " + e.message } : it)));
    }
  };

  const handleChatKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (uploading || !documentId) {
        const text = chatInput && chatInput.trim();
        if (text) {
          const userMsg = { id: Date.now() + Math.random(), role: "user", text };
          setMessages((m) => [...m, userMsg]);
          setChatInput("");
        }

        const hint = { id: Date.now() + Math.random(), role: "assistant", text: "Please upload a document first so I can answer questions about it." };
        setMessages((m) => [...m, hint]);
        setShowUploadHint(true);
        setTimeout(() => setShowUploadHint(false), 3500);
        return;
      }

      sendMessage(chatInput.trim());
    }
  };

  useEffect(() => { try { const el = chatContainerRef.current; if (el) el.scrollTop = el.scrollHeight; } catch (e) {} }, [messages]);

  return (
    <div>
      {/* copy original dashboard CSS so the composed page looks identical */}
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
      <div className="panels-wrapper">
        <LeftPanel
          uploadedFileName={uploadedFileName}
          uploading={uploading}
          summary={summary}
          importantClauses={importantClauses}
          activeView={activeView}
          setActiveView={setActiveView}
          fileInputRef={fileInputRef}
          handleFileChange={handleFileChange}
          legalQuotes={legalQuotes}
          currentQuoteIndex={currentQuoteIndex}
          showUploadHint={showUploadHint}
          rawAnalyzeJson={rawAnalyzeJson}
          showAnalyzeDetails={showAnalyzeDetails}
          setShowAnalyzeDetails={setShowAnalyzeDetails}
          setSummary={setSummary}
          setUploadedFileName={setUploadedFileName}
          setDocumentId={setDocumentId}
          setImportantClauses={setImportantClauses}
        />

        <RightPanel
          uploadedFileName={uploadedFileName}
          documentId={documentId}
          messages={messages}
          chatContainerRef={chatContainerRef}
          chatInput={chatInput}
          setChatInput={setChatInput}
          handleChatKeyDown={handleChatKeyDown}
          sendMessage={sendMessage}
          uploading={uploading}
          setMessages={setMessages}
          setShowUploadHint={setShowUploadHint}
          setDocumentId={setDocumentId}
          modelError={modelError}
          setModelError={setModelError}
        />
      </div>
    </div>
    </div>
  );
}