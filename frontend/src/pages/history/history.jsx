import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Clock, Palette, Code2, AlertCircle, Plus,
    Trash2, RefreshCw, Search, FileText, Download, Eye
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from "../../context/authcontext";
import { useTask } from "../../context/taskcontext";
import { projectsAPI, buildAPI, artifactsAPI, getToken } from "../../services/api";
import Sidebar from "../../components/Sidebar";
import "./history.css";

const STATUS_OPTIONS = ["all", "completed", "failed", "pending", "running"];

const History = () => {
    const { user } = useAuth();
    const { setCurrentProject, startBuild } = useTask();
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Feature 2 — Search & Filter
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                setIsLoading(true);
                const data = await projectsAPI.list(0, 100);
                const items = Array.isArray(data) ? data : data.projects || data.items || [];
                setProjects(items);
            } catch (err) {
                console.error("Failed to fetch projects:", err);
                setError("Failed to load your project history.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchProjects();
    }, []);

    // Feature 2 — Filtered list
    const filteredProjects = projects.filter((p) => {
        const q = searchQuery.toLowerCase();
        const matchesSearch = !q ||
            (p.title || "").toLowerCase().includes(q) ||
            (p.prompt || "").toLowerCase().includes(q);
        const matchesStatus = statusFilter === "all" || (p.status || "").toLowerCase() === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Feature 3 — Delete
    const handleDelete = async (e, projectId) => {
        e.preventDefault();
        e.stopPropagation();
        if (!window.confirm("Delete this project and all its files? This cannot be undone.")) return;
        try {
            await projectsAPI.delete(projectId);
            setProjects(prev => prev.filter(p => p.id !== projectId));
            toast.success("Project deleted.");
        } catch (err) {
            toast.error("Failed to delete project.");
        }
    };

    // Feature 7 — Retry Build
    const handleRetry = async (e, project) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            setCurrentProject(project);
            await startBuild(project.id);
            toast.success("Build started!");
            navigate("/build-log");
        } catch (err) {
            toast.error("Failed to start build.");
        }
    };

    // Feature 8 — Download Project
    const handleDownload = async (e, project) => {
        e.preventDefault();
        e.stopPropagation();
        if (!project?.id) return;
        const toastId = toast.loading("Preparing download…");
        try {
            const url = artifactsAPI.download(project.id);
            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            if (!res.ok) throw new Error("Download failed");
            const blob = await res.blob();
            const objectUrl = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = objectUrl;
            a.download = `${project.title || "project"}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(objectUrl);
            toast.success("Download started!", { id: toastId });
        } catch (err) {
            toast.error("Download failed.", { id: toastId });
            console.error("Download error:", err);
        }
    };

    // Feature 9 — View/Preview Project
    const handleView = (e, project) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentProject(project);
        navigate(`/preview?id=${project.id}`);
    };

    const getStatusClass = (status) => {
        const s = (status || "").toLowerCase();
        if (s === "completed" || s === "done" || s === "ready") return "status-completed";
        if (s === "building" || s === "in_progress" || s === "running") return "status-building";
        if (s === "failed" || s === "error") return "status-failed";
        return "status-pending";
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Unknown date";
        return new Intl.DateTimeFormat('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        }).format(new Date(dateString));
    };

    const canRetry = (status) => ["failed", "cancelled", "error"].includes((status || "").toLowerCase());

    return (
        <section className="history-section" id="history">
            {/* Feature 11 — Shared Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="history-container">
                <div className="history-header">
                    <h1 className="history-subtitle">Your Journey</h1>
                    <h2 className="history-title">Project History</h2>
                    <p className="history-desc">Review and revisit your previously generated applications.</p>
                </div>

                {/* Feature 2 — Search & Filter Bar */}
                <div className="history-controls">
                    <div className="history-search-box">
                        <Search size={15} className="history-search-icon" />
                        <input
                            className="history-search-input"
                            placeholder="Search by name or prompt…"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <select
                        className="history-status-filter"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        {STATUS_OPTIONS.map(s => (
                            <option key={s} value={s}>
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>

                {isLoading ? (
                    <div className="loading-container">
                        <div className="loader"></div>
                        <p>Loading your project archives...</p>
                    </div>
                ) : error ? (
                    <div className="loading-container" style={{ color: '#f87171' }}>
                        <AlertCircle size={48} style={{ marginBottom: '1rem', opacity: 0.8 }} />
                        <p>{error}</p>
                    </div>
                ) : (
                    <div className="history-grid">
                        {filteredProjects.length > 0 ? (
                            filteredProjects.map((project) => (
                                <Link to={`/preview?id=${project.id}`} className="history-card" key={project.id}>
                                    <div className="card-top">
                                        <div>
                                            <h3 className="project-title">{project.title || "Untitled Project"}</h3>
                                            <div className="project-date">
                                                <Clock size={14} />
                                                <span>{formatDate(project.created_at)}</span>
                                            </div>
                                        </div>
                                        <div className="card-top-right">
                                            <span className={`status-badge ${getStatusClass(project.status)}`}>
                                                {project.status || "Pending"}
                                            </span>
                                            {/* Feature 7 — Retry Build */}
                                            {canRetry(project.status) && (
                                                <button
                                                    className="card-action-btn retry-btn"
                                                    onClick={(e) => handleRetry(e, project)}
                                                    title="Retry Build"
                                                >
                                                    <RefreshCw size={14} />
                                                </button>
                                            )}
                                            {/* Feature 9 — View/Preview Project */}
                                            {project.status?.toLowerCase() === "completed" && (
                                                <button
                                                    className="card-action-btn view-btn"
                                                    onClick={(e) => handleView(e, project)}
                                                    title="View Project"
                                                >
                                                    <Eye size={14} />
                                                </button>
                                            )}
                                            {/* Feature 8 — Download completed project */}
                                            {project.status?.toLowerCase() === "completed" && (
                                                <button
                                                    className="card-action-btn download-btn"
                                                    onClick={(e) => handleDownload(e, project)}
                                                    title="Download Project"
                                                >
                                                    <Download size={14} />
                                                </button>
                                            )}
                                            {/* Feature 3 — Delete */}
                                            <button
                                                className="card-action-btn delete-btn"
                                                onClick={(e) => handleDelete(e, project.id)}
                                                title="Delete Project"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="project-prompt">
                                        {project.prompt || "No design prompt provided."}
                                    </div>

                                    <div className="card-bottom">
                                        <div className="theme-indicator">
                                            <Palette size={14} />
                                            <span>{project.color_theme || "Default"} Theme</span>
                                        </div>
                                        {/* Feature 4 — Page Count Badge */}
                                        <div className="page-count-badge">
                                            <FileText size={14} />
                                            <span>{project.pages?.length ?? 0} pages</span>
                                        </div>
                                        <div className="tech-stack">
                                            <Code2 size={14} />
                                            <span>React &middot; Vite</span>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="no-projects">
                                <Search size={64} className="no-projects-icon" />
                                <h3>{searchQuery || statusFilter !== "all" ? "No matching projects" : "No projects yet"}</h3>
                                <p>
                                    {searchQuery || statusFilter !== "all"
                                        ? "Try adjusting your search or filter."
                                        : "You haven't generated any prototypes yet."}
                                </p>
                                {(!searchQuery && statusFilter === "all") && (
                                    <Link to="/project" className="create-btn">
                                        <Plus size={18} />
                                        Create Your First Prototype
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
};

export default History;
