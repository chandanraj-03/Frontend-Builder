import React, { useState, useRef, useEffect, useCallback } from "react";
import { Plus, Bot, Search as SearchIcon, X, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { projectsAPI, chatAPI } from "../../services/api";
import "./nav.css";

const Nav = () => {
    const navigate = useNavigate();

    // ── Search ──────────────────────────────────────────────────────
    const [query, setQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searchOpen, setSearchOpen] = useState(false);
    const searchRef = useRef(null);

    const doSearch = useCallback(async (q) => {
        if (!q.trim()) { setSearchResults([]); setSearchOpen(false); return; }
        try {
            const res = await projectsAPI.list(0, 20);
            const filtered = (res.projects || []).filter(p =>
                p.title.toLowerCase().includes(q.toLowerCase())
            );
            setSearchResults(filtered);
            setSearchOpen(true);
        } catch { setSearchResults([]); }
    }, []);

    useEffect(() => {
        const t = setTimeout(() => doSearch(query), 280);
        return () => clearTimeout(t);
    }, [query, doSearch]);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target))
                setSearchOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleSelectProject = (project) => {
        setQuery(""); setSearchOpen(false);
        // navigate to build-log or preview depending on status
        if (project.status === "completed") navigate("/preview");
        else navigate("/build-log");
    };

    const statusColor = (s) =>
        s === "completed" ? "green" : s === "failed" ? "red" : "orange";

    // ── ChatBot ──────────────────────────────────────────────────────
    const [chatOpen, setChatOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: "assistant", content: "Hi! I'm your AI assistant. Ask me anything about web development..." }
    ]);
    const [chatInput, setChatInput] = useState("");
    const [chatLoading, setChatLoading] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, chatOpen]);

    const sendMessage = async () => {
        if (!chatInput.trim() || chatLoading) return;
        const text = chatInput.trim();
        setChatInput("");
        const updatedMessages = [...messages, { role: "user", content: text }];
        setMessages(updatedMessages);
        setChatLoading(true);
        try {
            // Pass full history (excluding the initial system welcome bubble)
            const history = updatedMessages.filter(m => m.role === "user" || m.role === "assistant");
            const data = await chatAPI.send(text, history);
            setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
        } catch {
            setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Could not reach AI. Is Ollama running?" }]);
        } finally {
            setChatLoading(false);
        }
    };

    return (
        <>
            <div className="nav-container">
                {/* Search */}
                <div className="nav-search-wrapper" ref={searchRef}>
                    <div className="nav-search-box">
                        <SearchIcon size={15} className="nav-search-icon" />
                        <input
                            className="search-input"
                            placeholder="Search..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onFocus={() => query && setSearchOpen(true)}
                        />
                        {query && (
                            <button className="search-clear" onClick={() => { setQuery(""); setSearchOpen(false); }}>
                                <X size={13} />
                            </button>
                        )}
                    </div>

                    {searchOpen && (
                        <div className="search-dropdown">
                            {searchResults.length === 0 ? (
                                <div className="search-empty">No projects found</div>
                            ) : searchResults.map(p => (
                                <div key={p.id} className="search-result-item" onClick={() => handleSelectProject(p)}>
                                    <span className={`search-dot ${statusColor(p.status)}`} />
                                    <div className="search-result-info">
                                        <span className="search-result-title">{p.title}</span>
                                        <span className="search-result-status">{p.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Create New Project */}
                <button className="nav-btn" onClick={() => navigate("/project")}>
                    <Plus size={16} /> Create New Project
                </button>

                {/* ChatBot */}
                <button className="nav-btn" onClick={() => setChatOpen(true)}>
                    <Bot size={16} /> ChatBot
                </button>
            </div>

            {/* ChatBot Modal */}
            {chatOpen && (
                <div className="chatbot-overlay" onClick={(e) => { if (e.target.classList.contains("chatbot-overlay")) setChatOpen(false); }}>
                    <div className="chatbot-modal">
                        <div className="chatbot-header">
                            <div className="chatbot-title"><Bot size={17} /> AI Assistant</div>
                            <button className="chatbot-close" onClick={() => setChatOpen(false)}><X size={17} /></button>
                        </div>

                        <div className="chatbot-messages">
                            {messages.map((m, i) => (
                                <div key={i} className={`chat-bubble ${m.role}`}>
                                    <p>{m.content}</p>
                                </div>
                            ))}
                            {chatLoading && (
                                <div className="chat-bubble assistant">
                                    <p className="chat-typing"><span /><span /><span /></p>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        <div className="chatbot-input-row">
                            <input
                                type="text"
                                placeholder="Ask anything…"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                                disabled={chatLoading}
                            />
                            <button onClick={sendMessage} disabled={chatLoading} className="chat-send-btn">
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Nav;