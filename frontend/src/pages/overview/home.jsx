import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/authcontext";
import { dashboardAPI } from "../../services/api";
import Sidebar from "../../components/Sidebar";
import "./home.css";

const Home = () => {
    const { user } = useAuth();
    // State for dashboard metrics (will be populated from database backend)
    const [metrics, setMetrics] = useState({
        totalProjects: 0,
        activeBuilds: 0,
        filesGenerated: 0,
    });

    const [recentActivities, setRecentActivities] = useState([]);
    const [llmStatus, setLlmStatus] = useState({ status: "Checking…", models: [] });

    const [isLoading, setIsLoading] = useState(true);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 5) return "Welcome on board";
        if (hour < 12) return "Good Morning";
        if (hour < 17) return "Good Afternoon";
        if (hour < 21) return "Good Evening";
        return "Welcome on board";
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setIsLoading(true);
                const data = await dashboardAPI.get();
                setMetrics({
                    totalProjects: data.metrics?.totalProjects ?? 0,
                    activeBuilds: data.metrics?.activeBuilds ?? 0,
                    filesGenerated: data.metrics?.filesGenerated ?? 0,
                });
                const rawActivities = data.recentActivities || [];
                const toRelative = (ts) => {
                    if (!ts) return "";
                    const diff = Date.now() - new Date(ts).getTime();
                    const m = Math.floor(diff / 60000);
                    if (m < 1) return "Just now";
                    if (m < 60) return `${m}m ago`;
                    const h = Math.floor(m / 60);
                    if (h < 24) return `${h}h ago`;
                    return `${Math.floor(h / 24)}d ago`;
                };
                const mapped = rawActivities.map(a => ({
                    message: `Project '${a.title}' ${a.status}`,
                    time: toRelative(a.timestamp),
                    type: a.status === "completed" ? "success" : a.status === "failed" ? "error" : "info",
                }));
                setRecentActivities(mapped);
                if (data.llmStatus) setLlmStatus({
                    status: data.llmStatus.status,
                    models: (data.llmStatus.models || []).map(m =>
                        typeof m === "string" ? { name: m, custom: false } : m
                    ),
                });
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    return (
        <section className="home-section" id="home">
            {/* Feature 11 — Shared Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="home-container">
                <div className="home-header">
                    <h1 className="home-subtitle">
                        {getGreeting()}, {user.name} 👋
                    </h1>
                    <h2 className="home-title">Overview Dashboard</h2>
                    <p className="home-desc">
                        Here's what's happening with your projects today.
                    </p>
                </div>

                <div className="home-grid">
                    <div className="home-card stat-card hover-effect">
                        <div className="card-header">
                            <h4>Total Projects</h4>
                            <div className="icon-wrapper bg-blue-light">
                                💻
                            </div>
                        </div>
                        <div className="card-value">{isLoading ? "..." : metrics.totalProjects}</div>
                        <p className="card-trend text-gray">All time total</p>
                    </div>

                    <div className="home-card stat-card hover-effect">
                        <div className="card-header">
                            <h4>Active Builds</h4>
                            <div className="icon-wrapper bg-orange-light">
                                💡
                            </div>
                        </div>
                        <div className="card-value">{isLoading ? "..." : metrics.activeBuilds}</div>
                        <div className="progress-container">
                            <div className="progress-bar" style={{ width: metrics.activeBuilds > 0 ? '60%' : '0%' }}></div>
                        </div>
                        <p className="card-trend text-gray">
                            {metrics.activeBuilds > 0 ? `Processing builds...` : `No active builds`}
                        </p>
                    </div>

                    <div className="home-card stat-card hover-effect">
                        <div className="card-header">
                            <h4>Files Generated</h4>
                            <div className="icon-wrapper bg-purple-light">
                                📄
                            </div>
                        </div>
                        <div className="card-value">{isLoading ? "..." : metrics.filesGenerated}</div>
                        <p className="card-trend text-gray">All time generated</p>
                    </div>

                    <div className="home-card activity-card">
                        <div className="card-header align-center">
                            <h4>Recent Activity</h4>
                            🕛
                            </div>
                        <div className="activity-list">
                            {recentActivities.length > 0 ? (
                                recentActivities.map((activity, index) => (
                                    <div className="activity-item" key={index}>
                                        <span className={`dot ${activity.type === 'success' ? 'bg-green' : activity.type === 'warning' ? 'bg-orange' : 'bg-blue'}`}></span>
                                        <div className="activity-content">
                                            <span className="text">{activity.message}</span>
                                            <span className="time">{activity.time}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="activity-item">
                                    <div className="activity-content">
                                        <span className="text" style={{ color: '#94a3b8' }}>No recent activity to show yet.</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* LLM Engine Status — next to Recent Activity */}
                    <div className="home-card system-card">
                        <div className="card-header">
                            <h4>LLM Engine Status</h4>
                            🤖
                            </div>
                        <div className="llm-status-body">
                            <div className="llm-status-row">
                                <span className={`dot ${llmStatus.status === "Online" ? "bg-green" : "bg-red"}`} />
                                <span className="llm-status-text">{llmStatus.status}</span>
                            </div>
                            {llmStatus.models && llmStatus.models.length > 0 && (
                                <>
                                    <p className="llm-model-count">{llmStatus.models.length} model{llmStatus.models.length > 1 ? "s" : ""} available{llmStatus.models.some(m => m.custom) ? " · custom default set" : ""}</p>
                                    <ul className="llm-model-list">
                                        {llmStatus.models.map((m, i) => (
                                            <li key={i} className={`llm-model-item${m.custom ? " llm-model-custom" : ""}`}>
                                                {m.name ?? m}
                                                {m.custom && <span className="llm-custom-badge">default</span>}
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}
                            {(!llmStatus.models || llmStatus.models.length === 0) && (
                                <p className="llm-no-models">No models detected</p>
                            )}
                        </div>
                    </div>

                    
                </div>
            </div>
        </section>
    );
};

export default Home;