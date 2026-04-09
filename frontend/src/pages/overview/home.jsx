import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FolderKanban, Activity, FileCode2, Clock, Cpu, BarChart2 } from 'lucide-react';
import { useAuth } from "../../context/authcontext";
import { dashboardAPI } from "../../services/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Sidebar from "../../components/Sidebar";
import "./home.css";

const Home = () => {
    const { user, logout } = useAuth();
    // State for dashboard metrics (will be populated from database backend)
    const [metrics, setMetrics] = useState({
        totalProjects: 0,
        activeBuilds: 0,
        filesGenerated: 0,
    });

    const [recentActivities, setRecentActivities] = useState([]);
    const [llmStatus, setLlmStatus] = useState({ status: "Checking…", models: [] });

    const [systemStatus, setSystemStatus] = useState({
        status: "Pending Connection",
        avgResponse: "0ms",
        uptime: "0%"
    });

    const [isLoading, setIsLoading] = useState(true);

    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setIsLoading(true);
                const [data, stats] = await Promise.all([
                    dashboardAPI.get(),
                    dashboardAPI.stats().catch(() => ({ buildsPerDay: [] })),
                ]);
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
                setSystemStatus(data.systemStatus || { status: "Healthy", avgResponse: "—", uptime: "—" });
                // Feature 10 — Chart data
                const raw = stats.buildsPerDay || [];
                setChartData(raw.map(d => ({
                    date: d.date.slice(5), // show MM-DD only
                    count: d.count,
                })));
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
                        Good Morning, {user.name} 👋
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
                                <FolderKanban className="card-icon text-blue" size={24} />
                            </div>
                        </div>
                        <div className="card-value">{isLoading ? "..." : metrics.totalProjects}</div>
                        <p className="card-trend text-gray">All time total</p>
                    </div>

                    <div className="home-card stat-card hover-effect">
                        <div className="card-header">
                            <h4>Active Builds</h4>
                            <div className="icon-wrapper bg-orange-light">
                                <Activity className="card-icon text-orange" size={24} />
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
                                <FileCode2 className="card-icon text-purple" size={24} />
                            </div>
                        </div>
                        <div className="card-value">{isLoading ? "..." : metrics.filesGenerated}</div>
                        <p className="card-trend text-gray">All time generated</p>
                    </div>

                    <div className="home-card activity-card">
                        <div className="card-header align-center">
                            <h4>Recent Activity</h4>
                            <Clock className="card-icon text-gray" size={20} />
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
                            <Cpu className="card-icon text-blue" size={20} />
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

                    {/* Feature 10 — Builds Per Day Chart */}
                    <div className="home-card chart-card col-span-3">
                        <div className="card-header">
                            <h4>Builds Per Day (Last 7 Days)</h4>
                            <BarChart2 className="card-icon text-blue" size={20} />
                        </div>
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={160}>
                                <BarChart data={chartData} margin={{ top: 8, right: 8, left: -28, bottom: 0 }}>
                                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0', fontSize: '0.8rem' }}
                                        cursor={{ fill: 'rgba(99,102,241,0.08)' }}
                                    />
                                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                        {chartData.map((_, i) => (
                                            <Cell key={i} fill={`hsl(${230 + i * 8}, 72%, ${60 - i * 2}%)`} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '1rem 0' }}>No build data yet.</p>
                        )}
                    </div>


                </div>
            </div>
        </section>
    );
};

export default Home;