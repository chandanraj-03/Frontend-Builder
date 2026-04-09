import React, { useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import { useAuth } from "../../context/authcontext";
import { useTask } from "../../context/taskcontext";
import { artifactsAPI } from "../../services/api";
import Sidebar from "../../components/Sidebar";
import "./build.css";

// Ordered pipeline stages representing the AI agents
const STAGES = [
    { key: "conversation", label: "Conversation Agent", desc: "Analyzing prompt and clarifying application intent." },
    { key: "requirements", label: "Requirement Agent", desc: "Extracting functional and UX requirements." },
    { key: "page_discovery", label: "Page Discovery Agent", desc: "Determining all necessary application pages." },
    { key: "plan", label: "Plan Agent", desc: "Designing layout and component architecture." },
    { key: "code", label: "Code Agent", desc: "Generating final HTML, CSS, and interactive JavaScript." },
    { key: "readme", label: "Readme Agent", desc: "Writing comprehensive project documentation." },
];

function stageIndexFromLogs(logs) {
    if (!logs || logs.length === 0) return -1;
    const text = logs.map((l) => l.message || "").join(" ").toLowerCase();

    // Check highest stage reached based on unique stage logs
    if (text.includes("stage 6/6") || text.includes("readme")) return 5;
    if (text.includes("stage 5/6") || text.includes("generating code")) return 4;
    if (text.includes("stage 4/6") || text.includes("layout plan")) return 3;
    if (text.includes("stage 3/6") || text.includes("discovering pages")) return 2;
    if (text.includes("stage 2/6") || text.includes("extracting requirements")) return 1;
    if (text.includes("stage 1/6") || text.includes("analysing prompt")) return 0;

    return 0; // default to first stage if started
}

function logLevelClass(level) {
    if (!level) return "text-blue-400";
    const l = level.toLowerCase();
    if (l === "success" || l === "done") return "text-green-400";
    if (l === "warn" || l === "warning") return "text-yellow-400";
    if (l === "error") return "text-red-400";
    if (l === "processing" || l === "agent") return "text-purple-400";
    return "text-blue-400";
}

const BuildLog = () => {
    const { user, logout } = useAuth();
    const { currentProject, buildLogs, buildStatus, isBuilding, cancelBuild } = useTask();
    const navigate = useNavigate();
    const terminalRef = useRef(null);

    // Auto-scroll terminal to bottom on new logs
    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [buildLogs]);

    const activeStage = stageIndexFromLogs(buildLogs);
    const progressPct = buildStatus === "completed" ? 100
        : buildStatus === "failed" ? 0
            : activeStage < 0 ? 5
                : Math.round(((activeStage + 1) / STAGES.length) * 90);

    const statusLabel = buildStatus === "completed" ? "Complete"
        : buildStatus === "failed" ? "Failed"
            : buildStatus === "cancelled" ? "Cancelled"
                : "In Progress";
    const statusClass = buildStatus === "completed" ? "success"
        : buildStatus === "failed" ? "error"
            : buildStatus === "cancelled" ? "cancelled"
                : "processing";

    const handleCancel = async () => {
        if (currentProject) await cancelBuild(currentProject.id);
    };

    const userInitials = user?.name
        ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
        : "U";

    return (
        <section className="build-page-section" id="home">
            {/* Feature 11 — Shared Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <section className="build-section">
                <div className="build-container">
                    <div className="build-header">
                        <h1>Build Progress</h1>
                        <div className="build-user-info">
                            <span>{user?.name || "User"}</span>
                            <div className="user-avatar">{userInitials}</div>
                        </div>
                    </div>

                    {!currentProject ? (
                        <div style={{ padding: "2rem", color: "#94a3b8" }}>
                            <p>No active build. <Link to="/project" style={{ color: "#818cf8" }}>Start a new project →</Link></p>
                        </div>
                    ) : (
                        <div className="build-content-grid">
                            {/* Status Card */}
                            <div className="build-status-card">
                                <div className="status-header">
                                    <div>
                                        <h2 className="project-name">{currentProject.title || "Untitled Project"}</h2>
                                        <p className="build-id">Project ID: <span className="mono">#{currentProject.id?.slice(-8)}</span></p>
                                    </div>
                                    <div className={`status-badge ${statusClass}`}>
                                        {isBuilding && <span className="pulse-dot"></span>}
                                        {statusLabel}
                                    </div>
                                </div>

                                <div className="progress-section">
                                    <div className="progress-labels">
                                        <span>{activeStage >= 0 ? STAGES[Math.min(activeStage, STAGES.length - 1)].label : "Waiting…"}</span>
                                        <span>{progressPct}%</span>
                                    </div>
                                    <div className="progress-container">
                                        <div className="progress">
                                            <div className="progress-bar" style={{ width: `${progressPct}%` }}></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="build-metrics">
                                    <div className="metric">
                                        <Clock size={16} />
                                        <span>Logs: {buildLogs.length}</span>
                                    </div>
                                    <div className="metric">
                                        <CheckCircle size={16} />
                                        <span>Status: {buildStatus || "pending"}</span>
                                    </div>
                                </div>

                                <div className="build-actions">
                                    {!['completed', 'failed', 'cancelled'].includes(buildStatus) && (
                                        <button className="btn-cancel" onClick={handleCancel} disabled={!currentProject?.id}>
                                            <XCircle size={16} /> Cancel Build
                                        </button>
                                    )}
                                    {buildStatus === "completed" && (
                                        <>
                                            <Link to="/preview" className="btn-preview">View Preview</Link>
                                            <a
                                                href={artifactsAPI.download(currentProject.id)}
                                                className="btn-download"
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                Download Build
                                            </a>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Pipeline Timeline */}
                            <div className="build-pipeline-card">
                                <h2>Pipeline Steps</h2>
                                <div className="pipeline-container">
                                    <div className="pipeline">
                                        {STAGES.map((stage, idx) => {
                                            const isCompleted = idx <= activeStage && (buildStatus === "completed" ? true : idx < activeStage);
                                            const isActive = idx === activeStage && isBuilding;
                                            const isPending = idx > activeStage || (!isBuilding && idx > activeStage);
                                            return (
                                                <div
                                                    key={stage.key}
                                                    className={`pipeline-step ${isCompleted ? "completed" : isActive ? "active" : "pending"}`}
                                                >
                                                    <div className="pipeline-step-icon">
                                                        {isCompleted ? <CheckCircle size={18} /> : isActive ? <div className="spinner"></div> : null}
                                                    </div>
                                                    <div className="pipeline-step-content">
                                                        <div className="pipeline-step-title">{stage.label}</div>
                                                        <div className="pipeline-step-description">{stage.desc}</div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Terminal / Build Log Output */}
                            <div className="build-logs-card">
                                <div className="logs-header">
                                    <h2>Build Logs</h2>
                                    {isBuilding && <span className="live-indicator">● LIVE</span>}
                                </div>
                                <div className="terminal-window">
                                    <div className="terminal-header">
                                        <span className="dot bg-red-500"></span>
                                        <span className="dot bg-yellow-500"></span>
                                        <span className="dot bg-green-500"></span>
                                    </div>
                                    <div className="terminal-body" ref={terminalRef}>
                                        {buildLogs.length === 0 ? (
                                            <p><span className="text-gray-400">Waiting for build output…</span></p>
                                        ) : (
                                            buildLogs.map((log, i) => (
                                                <p key={i}>
                                                    <span className="text-gray-400">[{log.timestamp || ""}]</span>{" "}
                                                    <span className={logLevelClass(log.level)}>{(log.level || "INFO").toUpperCase()}</span>{" "}
                                                    {log.message}
                                                    {i === buildLogs.length - 1 && isBuilding && <span className="blink">_</span>}
                                                </p>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </section>
    );
};

export default BuildLog;