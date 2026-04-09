import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
    CheckCircle2, Download, Loader2, AlertCircle, Clock, ExternalLink,
    FolderOpen, FileJson, FileCode2, Code2, ChevronRight, ChevronDown,
    Copy, Eye
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/authcontext';
import { useTask } from '../../context/taskcontext';
import { artifactsAPI, getToken, projectsAPI } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import './preview.css';

const Preview = () => {
    const { logout } = useAuth();
    const { currentProject, buildStatus, isBuilding, setCurrentProject } = useTask();
    const [searchParams] = useSearchParams();
    const [localProject, setLocalProject] = useState(null);
    const [activeTab, setActiveTab] = useState('source');
    const [isFolderOpen, setIsFolderOpen] = useState(true);
    const [activeFile, setActiveFile] = useState(null);
    const [fileContents, setFileContents] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [artifactMeta, setArtifactMeta] = useState(null);

    // ── Load project from URL parameter if not in context ─────────────
    useEffect(() => {
        const projectId = searchParams.get('id');
        if (!currentProject && projectId) {
            projectsAPI.get(projectId)
                .then(proj => {
                    setLocalProject(proj);
                    setCurrentProject(proj);
                })
                .catch(err => {
                    console.error('Failed to load project:', err);
                    toast.error('Failed to load project.');
                });
        }
    }, [searchParams, currentProject, setCurrentProject]);

    const project = currentProject || localProject;

    // ── Live Preview HTML assembly ─────────────────────────────────
    const buildPreviewHtml = () => {
        const html = fileContents['index.html'] || '';
        const css = Object.entries(fileContents)
            .filter(([f]) => f.endsWith('.css'))
            .map(([, c]) => c).join('\n');
        const js = Object.entries(fileContents)
            .filter(([f]) => f.endsWith('.js'))
            .map(([, c]) => c).join('\n');
        let full = html;
        if (css) full = full.replace('</head>', `<style>${css}</style>\n</head>`);
        if (js) full = full.replace('</body>', `<script>${js}<\/script>\n</body>`);
        return full;
    };

    const handleOpenPreview = () => {
        const full = buildPreviewHtml();
        const blob = new Blob([full], { type: 'text/html' });
        window.open(URL.createObjectURL(blob), '_blank');
    };

    const handleDownload = async () => {
        if (!project?.id) return;
        const toastId = toast.loading('Preparing download…');
        try {
            const url = artifactsAPI.download(project.id);
            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            if (!res.ok) throw new Error('Download failed');
            const blob = await res.blob();
            const objectUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = objectUrl;
            a.download = `${project.title || 'project'}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(objectUrl);
            toast.success('Download started!', { id: toastId });
        } catch (err) {
            toast.error('Download failed.', { id: toastId });
            console.error('Download error:', err);
        }
    };

    // Feature 8 — Copy code button
    const handleCopyCode = () => {
        const content = displayContents[currentFile] || '';
        navigator.clipboard.writeText(content)
            .then(() => toast.success('Copied to clipboard!'))
            .catch(() => toast.error('Failed to copy.'));
    };

    useEffect(() => {
        if (!project?.id) return;
        setIsLoading(true);
        artifactsAPI.list(project.id)
            .then(async (res) => {
                const items = res.artifacts || [];
                const contents = {};
                for (const item of items) {
                    try {
                        const full = await artifactsAPI.get(project.id, item.id);
                        const fname = full.filename || full.name || item.artifact_type || `file_${item.id}`;
                        contents[fname] = full.content || full.body || "";
                    } catch { /* skip */ }
                }
                setFileContents(contents);
                if (Object.keys(contents).length > 0) {
                    setActiveFile(Object.keys(contents)[0]);
                }
                setArtifactMeta({ fileCount: items.length });
            })
            .catch(() => { })
            .finally(() => setIsLoading(false));
    }, [project?.id]);

    const buildTime = (() => {
        const start = project?.created_at;
        const end = project?.completed_at || project?.updated_at;
        if (!start || !end) return "—";
        const ms = new Date(end) - new Date(start);
        if (isNaN(ms) || ms < 0) return "—";
        const secs = Math.floor(ms / 1000);
        if (secs < 60) return `${secs}s`;
        const mins = Math.floor(secs / 60);
        return `${mins}m ${secs % 60}s`;
    })();

    const displayContents = Object.keys(fileContents).length > 0 ? fileContents : {
        'index.html': `<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8" />\n    <title>Portfolio</title>\n</head>\n<body>\n    <h1>Your generated site will appear here.</h1>\n</body>`,
        'style.css': `body {\n    font-family: 'Inter', sans-serif;\n    margin: 0;\n    padding: 0;\n}`,
        'script.js': `document.addEventListener('DOMContentLoaded', () => {\n    console.log('Ready.');\n});`,
    };
    const currentFile = activeFile || Object.keys(displayContents)[0] || 'index.html';

    const getFileIcon = (filename) => {
        if (filename.endsWith('.html')) return <FileCode2 className="text-orange-500" size={16} />;
        if (filename.endsWith('.css')) return <FileJson className="text-blue-500" size={16} />;
        if (filename.endsWith('.js')) return <Code2 className="text-yellow-500" size={16} />;
        return <FileCode2 size={16} />;
    };

    return (
        <section className="preview-layout">
            {/* Feature 11 — Shared Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <main className="preview-main">
                <div className="preview-content-area">
                    {/* Project Header card */}
                    <div className="project-status-header">
                        <div className="project-title-area">
                            <div className={`status-badge ${buildStatus === 'completed' ? 'success'
                                : buildStatus === 'failed' ? 'error'
                                    : buildStatus === 'cancelled' ? 'cancelled'
                                        : isBuilding ? 'building'
                                            : project?.status === 'completed' ? 'success'
                                                : project?.status === 'failed' ? 'error'
                                                    : 'pending'
                                }`}>
                                {(buildStatus === 'completed' || (!buildStatus && project?.status === 'completed'))
                                    ? <><CheckCircle2 size={16} /> Build Complete</>
                                    : (buildStatus === 'failed' || (!buildStatus && project?.status === 'failed'))
                                        ? <><AlertCircle size={16} /> Build Failed</>
                                        : buildStatus === 'cancelled'
                                            ? <><AlertCircle size={16} /> Cancelled</>
                                            : isBuilding
                                                ? <><Loader2 size={16} className="spin-icon" /> Building…</>
                                                : <><Clock size={16} /> Pending</>
                                }
                            </div>
                            <h1>{project?.title || "Generated Project"}</h1>
                            <div className="project-meta">
                                <span>📄 {artifactMeta?.fileCount ?? Object.keys(displayContents).length} files</span>
                                <span className="divider">|</span>
                                <span>⏱️ {buildTime} build time</span>
                            </div>
                        </div>
                        <div className="project-actions">
                            <button
                                className="action-btn primary"
                                onClick={handleOpenPreview}
                                disabled={!fileContents['index.html']}
                            >
                                <ExternalLink size={16} /> Open Preview
                            </button>
                            <button
                                className="action-btn outline"
                                onClick={handleDownload}
                                disabled={!project?.id}
                            >
                                <Download size={16} /> Download
                            </button>
                        </div>
                    </div>

                    {/* Editor Container */}
                    <div className="editor-container">
                        <div className="editor-tabs-bar">
                            <div className="tab-group left">
                                <div className="tab-title">FILE MANAGER</div>
                            </div>
                            <div className="tab-group right">
                                <button
                                    className={`view-tab ${activeTab === 'source' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('source')}
                                >
                                    <Code2 size={16} /> Source
                                </button>
                                {/* Feature 1 — Live Preview tab */}
                                <button
                                    className={`view-tab ${activeTab === 'preview' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('preview')}
                                    disabled={!fileContents['index.html']}
                                    title={!fileContents['index.html'] ? 'No HTML available yet' : 'Live preview'}
                                >
                                    <Eye size={16} /> Preview
                                </button>
                                {/* Feature 8 — Copy Code button */}
                                {activeTab === 'source' && (
                                    <button
                                        className="view-tab copy-btn"
                                        onClick={handleCopyCode}
                                        title="Copy current file to clipboard"
                                    >
                                        <Copy size={16} /> Copy
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="editor-workarea">
                            {/* File Explorer Pane */}
                            <div className="file-explorer-pane">
                                <div className="file-tree">
                                    <div
                                        className="tree-node folder"
                                        onClick={() => setIsFolderOpen(!isFolderOpen)}
                                    >
                                        {isFolderOpen ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
                                        <FolderOpen size={16} className="text-yellow-500 folder-icon" />
                                        <span>{currentProject?.title?.slice(0, 20) || "project"}</span>
                                    </div>

                                    {isFolderOpen && (
                                        <div className="folder-contents">
                                            {Object.keys(displayContents).map(file => (
                                                <div
                                                    key={file}
                                                    className={`tree-node file ${currentFile === file ? 'active' : ''}`}
                                                    onClick={() => setActiveFile(file)}
                                                >
                                                    {getFileIcon(file)}
                                                    <span>{file}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="file-info-box">
                                    <div className="info-header">File Info</div>
                                    <div className="info-row">
                                        <span className="label">Language</span>
                                        <span className="value">{currentFile.split('.').pop().toUpperCase()}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Lines</span>
                                        <span className="value">{(displayContents[currentFile] || "").split('\n').length}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Size</span>
                                        <span className="value">{((displayContents[currentFile] || "").length / 1024).toFixed(1)} KB</span>
                                    </div>
                                </div>
                            </div>

                            {/* Code / Preview Pane */}
                            <div className="code-viewer-pane">
                                {activeTab === 'source' ? (
                                    <div className="code-editor">
                                        <div className="line-numbers">
                                            {(displayContents[currentFile] || "").split('\n').map((_, i) => (
                                                <div key={i + 1} className="line-number">{i + 1}</div>
                                            ))}
                                        </div>
                                        <pre className="code-content">
                                            <code>{displayContents[currentFile] || (isLoading ? "Loading…" : "No content")}</code>
                                        </pre>
                                    </div>
                                ) : (
                                    /* Feature 1 — Live iframe Preview */
                                    <div className="live-preview-container">
                                        <iframe
                                            key={currentProject?.id}
                                            srcDoc={buildPreviewHtml()}
                                            sandbox="allow-scripts allow-same-origin"
                                            className="preview-iframe"
                                            title="Live Preview"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </section>
    );
};

export default Preview;