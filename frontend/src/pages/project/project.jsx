import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./project.css";
import {
    LayoutDashboard, Plus, FolderKanban, Eye, Settings, LogOut,
    History as HistoryIcon, Search, X, ChevronLeft, ChevronRight,
    Shuffle, LayoutTemplate, CheckCircle2,
} from "lucide-react";
import { useAuth } from "../../context/authcontext";
import { useTask } from "../../context/taskcontext";
import { templatesAPI, settingsAPI } from "../../services/api";

// ── Static model definitions (mirrors transformer_core/config.py) ─────
const DEFAULT_MODELS = [
    {
        key: "qwen3-vl:8b",
        label: "Qwen3 Vision-Language 8B",
        desc: "Default model. Excellent visual understanding and high-quality code generation.",
        icon: "⚡",
        isDefault: true,
    },
    {
        key: "qwen3-vl:2b",
        label: "Qwen3 Vision-Language 2B",
        desc: "Lightweight and fast. Great for quick prototypes and simple pages.",
        icon: "🚀",
    },
    {
        key: "deepseek-v3.1:671b-cloud",
        label: "DeepSeek V3.1 671B Cloud",
        desc: "Massive cloud model with deep reasoning for complex applications.",
        icon: "🧠",
    },
    {
        key: "qwen3-next:80b-cloud",
        label: "Qwen3 Next 80B Cloud",
        desc: "Next-generation cloud model. Best for creative and complex architectures.",
        icon: "✨",
    },
];

const COMPLEXITY_STYLE = {
    Low:    { bg: "rgba(34,197,94,0.12)",   text: "#16a34a", border: "rgba(34,197,94,0.35)"  },
    Medium: { bg: "rgba(234,179,8,0.12)",   text: "#b45309", border: "rgba(234,179,8,0.35)"  },
    High:   { bg: "rgba(239,68,68,0.12)",   text: "#dc2626", border: "rgba(239,68,68,0.35)"  },
};

const TEMPLATES_PER_PAGE =9;
const Project = () => {
    const { logout } = useAuth();
    const { createProject, startBuild } = useTask();
    const navigate = useNavigate();

    const [prompt,        setPrompt]        = useState("");
    const [selectedModel, setSelectedModel] = useState("qwen3-vl:8b");
    const [models,        setModels]        = useState(DEFAULT_MODELS);
    const [templates,     setTemplates]     = useState([]);
    const [isGenerating,  setIsGenerating]  = useState(false);
    const [isTurboMode,   setIsTurboMode]   = useState(false);
    const [error,         setError]         = useState(null);

    // Template browser state
    const [showBrowser,      setShowBrowser]      = useState(false);
    const [searchQuery,      setSearchQuery]      = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [currentPage,      setCurrentPage]      = useState(1);
    const [detailTemplate,   setDetailTemplate]   = useState(null);

    // Load templates, models, and saved default model on mount
    useEffect(() => {
        templatesAPI.list()
            .then(res => setTemplates(res.templates || []))
            .catch(() => {});

        // Load saved default model from settings
        settingsAPI.getLLM()
            .then(res => {
                const saved = res?.ollama_model || localStorage.getItem("savedDefaultModel");
                if (saved) setSelectedModel(saved);
            })
            .catch(() => {
                const local = localStorage.getItem("savedDefaultModel");
                if (local) setSelectedModel(local);
            });

        settingsAPI.getModels()
            .then(res => {
                if (res?.models && Array.isArray(res.models)) {
                    const mapped = res.models.map((m, i) => ({
                        key:       m.key || m.id || m,
                        label:     m.name || m.label || m.key || m,
                        desc:      m.description || m.desc || "",
                        icon:      ["⚡","🚀","🧠","✨"][i] || "🤖",
                        isDefault: i === 0,
                    }));
                    if (mapped.length) {
                        setModels(mapped);
                        // If saved model is in the available list, use it; otherwise ignore it
                        const saved = localStorage.getItem("savedDefaultModel");
                        if (saved && !mapped.find(m => m.key === saved)) {
                            // Model is no longer available - clear from storage
                            localStorage.removeItem("savedDefaultModel");
                            // Use first available model by default
                            if (mapped.length > 0) setSelectedModel(mapped[0].key);
                        }
                    }
                }
            })
            .catch(() => {});
    }, []);

    // ── Derived template data ──────────────────────────────────────────
    const categories = useMemo(() => {
        const counts = {};
        templates.forEach(t => { counts[t.category] = (counts[t.category] || 0) + 1; });
        return [
            { name: "All", count: templates.length },
            ...Object.entries(counts)
                .sort((a, b) => b[1] - a[1])
                .map(([name, count]) => ({ name, count })),
        ];
    }, [templates]);

    const filteredTemplates = useMemo(() => {
        let list = templates;
        if (selectedCategory !== "All")
            list = list.filter(t => t.category === selectedCategory);
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(t =>
                t.name?.toLowerCase().includes(q) ||
                t.description?.toLowerCase().includes(q) ||
                t.category?.toLowerCase().includes(q) ||
                (t.tags || []).some(tag => tag.toLowerCase().includes(q))
            );
        }
        return list;
    }, [templates, selectedCategory, searchQuery]);

    const totalPages    = Math.max(1, Math.ceil(filteredTemplates.length / TEMPLATES_PER_PAGE));
    const pagedTemplates = filteredTemplates.slice(
        (currentPage - 1) * TEMPLATES_PER_PAGE,
        currentPage      * TEMPLATES_PER_PAGE
    );

    // ── Handlers ──────────────────────────────────────────────────────
    const changeCategory = (cat) => { setSelectedCategory(cat); setCurrentPage(1); setDetailTemplate(null); };
    const changeSearch   = (val) => { setSearchQuery(val);       setCurrentPage(1); setDetailTemplate(null); };

    const pickRandom = () => {
        if (!filteredTemplates.length) return;
        setDetailTemplate(filteredTemplates[Math.floor(Math.random() * filteredTemplates.length)]);
    };

    const useTemplate = (tmpl) => {
        // features is stored as an integer count in the DB, not an array
        const built = tmpl.prompt
            || [tmpl.name && `Build a ${tmpl.name}.`, tmpl.description].filter(Boolean).join(" ");
        setPrompt(built || "");
        setError(null);
        setShowBrowser(false);
        setDetailTemplate(null);
    };

    const handleGenerate = async () => {
        if (!prompt.trim()) { setError("Please describe your project or choose a template."); return; }
        setError(null);
        setIsGenerating(true);
        try {
            const title   = prompt.slice(0, 60);
            const project = await createProject(title, prompt, "default", selectedModel, isTurboMode);
            await startBuild(project.id);
            navigate("/build-log");
        } catch (e) {
            setError(e.message || "Failed to start build.");
            setIsGenerating(false);
        }
    };

    const cxStyle = (complexity) => COMPLEXITY_STYLE[complexity] || COMPLEXITY_STYLE.Medium;

    return (
        <section className="home-section" id="home">

            {/* ── Sidebar ─────────────────────────────────────── */}
            <aside className="side_bar">
                <div className="sidebar-top">
                    <a href="#overview" className="navbar-link">
                        <img src="/logo.png" alt="Logo" className="navbar-logo-icon" />
                    </a>
                    <span className="navbar-title">Prototype Builder</span>
                </div>
                <ul className="sidebar-menu">
                    <li><Link to="/overview"><LayoutDashboard size={20} /> Overview</Link></li>
                    <li className="active"><Link to="/project"><Plus size={20} /> Create New Project</Link></li>
                    <li><Link to="/history"><HistoryIcon size={20} /> History</Link></li>
                    <li><Link to="/build-log"><FolderKanban size={20} /> Build Log</Link></li>
                    <li><Link to="/preview"><Eye size={20} /> Preview</Link></li>
                    <li><Link to="/settings"><Settings size={20} /> Settings</Link></li>
                    <li className="logout">
                        <button onClick={logout} className="nav-logout-btn"><LogOut size={20} /> Logout</button>
                    </li>
                </ul>
            </aside>

            {/* ── Main content ──────────────────────────────────── */}
            <section className="project-section" id="project">
                <div className="project-container">

                    <div className="project-header">
                        <h1>New Project</h1>
                        <p className="project-header-sub">Configure the AI pipeline, then describe or pick a template.</p>
                    </div>

                    {/* ═══════════════════════════════════════════
                        STEP 1 — AI Model
                    ═══════════════════════════════════════════ */}
                    <div className="project-step-section">
                        <div className="step-heading">
                            <div className="step-number">1</div>
                            <div>
                                <h2 className="step-title">Choose AI Model</h2>
                                <p className="step-subtitle">Select the Ollama model that will power your code generation.</p>
                            </div>
                        </div>

                        <div className="model-grid">
                            {models.map(m => (
                                <div
                                    key={m.key}
                                    className={`model-card ${selectedModel === m.key ? "active" : ""}`}
                                    onClick={() => setSelectedModel(m.key)}
                                >
                                    <div className="model-icon">{m.icon}</div>
                                    <div className="model-info">
                                        <h3>
                                            {m.label}
                                            {m.isDefault && <span className="model-default-badge">← default</span>}
                                        </h3>
                                        <p>{m.desc}</p>
                                        <code className="model-key-tag">{m.key}</code>
                                    </div>
                                    {selectedModel === m.key && (
                                        <div className="model-check"><CheckCircle2 size={18} /></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ═══════════════════════════════════════════
                        STEP 2 — Project Description
                    ═══════════════════════════════════════════ */}
                    <div className="project-step-section">
                        <div className="step-heading">
                            <div className="step-number">2</div>
                            <div>
                                <h2 className="step-title">Describe Your Project</h2>
                                <p className="step-subtitle">
                                    Enter a prompt, or press Enter without typing to browse {templates.length > 0 ? templates.length : ""} templates.
                                </p>
                            </div>
                        </div>

                        <div className="project-form-group">
                            <textarea
                                rows={5}
                                placeholder={"Describe the web application you want to build…\n\ne.g. Build a high-converting landing page with animated hero, pricing table, testimonials, FAQ accordion, and sticky navigation.\n\n(Press the button below to choose from a template instead.)"}
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                            />
                        </div>

                        <button
                            className={`browse-templates-btn${showBrowser ? " active" : ""}`}
                            onClick={() => { setShowBrowser(v => !v); setDetailTemplate(null); setError(null); }}
                        >
                            <LayoutTemplate size={16} />
                            {showBrowser
                                ? "Hide Template Library"
                                : `Browse Template Library${templates.length ? ` (${templates.length} templates)` : ""}`
                            }
                        </button>
                    </div>

                    {/* ═══════════════════════════════════════════
                        TEMPLATE BROWSER PANEL
                    ═══════════════════════════════════════════ */}
                    {showBrowser && (
                        <div className="template-browser-panel">

                            {/* Header */}
                            <div className="template-browser-header">
                                <h3 className="browser-title">
                                    <LayoutTemplate size={17} />
                                    Template Library
                                    <span className="browser-count">{filteredTemplates.length} templates</span>
                                </h3>
                                <div className="browser-controls">
                                    <div className="browser-search-box">
                                        <Search size={14} />
                                        <input
                                            type="text"
                                            placeholder="Search by name, category, tag…"
                                            value={searchQuery}
                                            onChange={e => changeSearch(e.target.value)}
                                        />
                                        {searchQuery && (
                                            <button className="clear-search-btn" onClick={() => changeSearch("")}>
                                                <X size={12} />
                                            </button>
                                        )}
                                    </div>
                                    <button className="random-pick-btn" onClick={pickRandom} title="Random suggestion">
                                        <Shuffle size={14} /> Random
                                    </button>
                                </div>
                            </div>

                            {/* Category tabs */}
                            <div className="category-tab-bar">
                                {categories.map(cat => (
                                    <button
                                        key={cat.name}
                                        className={`cat-tab${selectedCategory === cat.name ? " active" : ""}`}
                                        onClick={() => changeCategory(cat.name)}
                                    >
                                        {cat.name}
                                        <span className="cat-count">{cat.count}</span>
                                    </button>
                                ))}
                            </div>

                            {/* ── Template detail view ── */}
                            {detailTemplate ? (
                                <div className="template-detail-view">
                                    <button className="detail-back-btn" onClick={() => setDetailTemplate(null)}>
                                        <ChevronLeft size={16} /> Back to templates
                                    </button>

                                    <div
                                        className="detail-hero"
                                        style={{ background: detailTemplate.gradient || "linear-gradient(135deg,#4E65FF,#92EFFD)" }}
                                    >
                                        <div className="detail-hero-overlay">
                                            <h2>{detailTemplate.name}</h2>
                                            <p>{detailTemplate.description}</p>
                                        </div>
                                    </div>

                                    <div className="detail-body">
                                        {/* Metadata chips */}
                                        <div className="detail-chips-row">
                                            <span className="detail-chip cat-chip">📁 {detailTemplate.category}</span>
                                            <span className="detail-chip feat-chip">✨ {detailTemplate.features ?? 0} features</span>
                                        </div>

                                        {/* Tags */}
                                        {detailTemplate.tags?.length > 0 && (
                                            <div className="detail-tags-row">
                                                {detailTemplate.tags.map(tag => (
                                                    <span key={tag} className="detail-tag">{tag}</span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Tech stack */}
                                        {detailTemplate.tech_stack?.length > 0 && (
                                            <div className="detail-section">
                                                <h4 className="detail-section-title">🛠️ Tech Stack</h4>
                                                <div className="tech-stack-row">
                                                    {detailTemplate.tech_stack.map(t => (
                                                        <span key={t} className="tech-pill">{t}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Features */}
                                        {detailTemplate.features?.length > 0 && (
                                            <div className="detail-section">
                                                <h4 className="detail-section-title">✨ Key Features</h4>
                                                <ul className="feature-list">
                                                    {detailTemplate.features.map((f, i) => (
                                                        <li key={i}>{f}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        <div className="detail-actions">
                                            <button className="use-template-btn" onClick={() => useTemplate(detailTemplate)}>
                                                Use This Template →
                                            </button>
                                            <button className="detail-cancel-btn" onClick={() => setDetailTemplate(null)}>
                                                Back
                                            </button>
                                        </div>
                                    </div>
                                </div>

                            ) : (
                                /* ── Template grid ── */
                                <>
                                    <div className="template-grid">
                                        {pagedTemplates.length > 0 ? pagedTemplates.map(tmpl => (
                                            <div
                                                key={tmpl.key}
                                                className="template-card"
                                                onClick={() => setDetailTemplate(tmpl)}
                                            >
                                                <div className="template-content">
                                                    <h3>{tmpl.name}</h3>
                                                    <p>{tmpl.description}</p>

                                                    <div className="tmpl-meta-row">
                                                        <span className="tmpl-meta-item">📁 {tmpl.category}</span>
                                                        <span className="tmpl-meta-item">✨ {tmpl.features ?? 0} features</span>
                                                    </div>

                                                    {tmpl.tags?.length > 0 && (
                                                        <div className="tmpl-tags-row">
                                                            {tmpl.tags.slice(0, 3).map(tag => (
                                                                <span key={tag} className="tmpl-tag">{tag}</span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="no-templates-msg">
                                                No templates match your search.
                                            </div>
                                        )}
                                    </div>

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div className="pagination-row">
                                            <button
                                                className="page-btn"
                                                disabled={currentPage === 1}
                                                onClick={() => setCurrentPage(p => p - 1)}
                                            >
                                                <ChevronLeft size={15} /> Back
                                            </button>
                                            <span className="page-info">
                                                Page {currentPage} / {totalPages}
                                                <span className="page-total"> · {filteredTemplates.length} templates</span>
                                            </span>
                                            <button
                                                className="page-btn"
                                                disabled={currentPage === totalPages}
                                                onClick={() => setCurrentPage(p => p + 1)}
                                            >
                                                Next <ChevronRight size={15} />
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {/* ── Error & Generate ─────────────────────── */}
                    {error && !showBrowser && <p className="project-error">{error}</p>}

                    <div className="turbo-mode-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '0.5rem', color: 'red' }}>
                            <input 
                                type="checkbox" 
                                checked={isTurboMode} 
                                onChange={(e) => setIsTurboMode(e.target.checked)} 
                                style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer', accentColor: '#818cf8' }}
                            />
                            <strong>⚡ Turbo Mode</strong>(Use for quick iterations and prototyping..)
                        </label>
                    </div>

                    <div className="generate-button-container">
                        <button
                            className="generate-button"
                            onClick={handleGenerate}
                            disabled={isGenerating}
                        >
                            <span>{isGenerating ? "Starting build…" : "Generate Magic ✨"}</span>
                        </button>
                    </div>

                </div>
            </section>
        </section>
    );
};

export default Project;