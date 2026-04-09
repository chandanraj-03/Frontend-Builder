import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    User, Bell, Shield, Terminal, LogOut, Cpu, AlertTriangle, Image as ImageIcon, Search, Save, Eye, Plus
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/authcontext';
import { settingsAPI, authAPI } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import './setting.css';

const SettingPage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('profile');

    // Profile state
    const [profileData, setProfileData] = useState({ fullName: "", email: "", bio: "", avatar: "" });
    // Avatar file input ref
    const avatarRef = useRef(null);
    // LLM state
    const [llmData, setLlmData] = useState({ default_model: "", api_key: "", ollama_url: "http://localhost:11434" });
    // Password state
    const [pwdData, setPwdData] = useState({ current: "", next: "", confirm: "" });
    // Show password toggles
    const [showPwd, setShowPwd] = useState({ current: false, next: false, confirm: false, apiKey: false });
    // Notification prefs (client-side — saved as a user preference)
    const [notifPrefs, setNotifPrefs] = useState({
        buildComplete: true,
        buildFailed: true,
    });
    // Session settings
    const [sessionTimeout, setSessionTimeout] = useState('24h');
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    // UI state
    const [isSaving, setIsSaving] = useState(false);
    const [pwdStatus, setPwdStatus] = useState({ msg: '', error: false });
    const [isChangingPwd, setIsChangingPwd] = useState(false);
    // Reference to store the original API key
    const [originalApiKey, setOriginalApiKey] = useState("");

    useEffect(() => {
        // Load profile
        settingsAPI.getProfile()
            .then((d) => setProfileData({ fullName: d.name || "", email: d.email || "", bio: d.bio || "", avatar: d.avatar || "" }))
            .catch(() => {
                // fallback to auth user
                if (user) setProfileData({ fullName: user.name || "", email: user.email || "", bio: user.bio || "", avatar: "" });
            });
        // Load LLM
        settingsAPI.getLLM()
            .then((d) => {
                // Store the masked key to detect if user modified it
                setOriginalApiKey(d.api_key || "");
                setLlmData({
                    default_model: d.ollama_model || "",
                    api_key: d.api_key || "",
                    ollama_url: d.ollama_host || "http://localhost:11434",
                })
            })
            .catch(() => { });
        // Load notification prefs from DB
        settingsAPI.getNotifications()
            .then((d) => setNotifPrefs({
                buildComplete: d.buildComplete ?? true,
                buildFailed: d.buildFailed ?? true,
            }))
            .catch(() => { /* use defaults */ });
    }, []);

    const showMsg = (msg, error = false) => {
        if (error) toast.error(msg);
        else toast.success(msg);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Collect all changes from all tabs
            const promises = [];
            
            // Always save all tabs that have changes
            if (profileData.fullName || profileData.email) {
                promises.push(
                    settingsAPI.updateProfile({ 
                        name: profileData.fullName, 
                        email: profileData.email, 
                        bio: profileData.bio, 
                        avatar: profileData.avatar 
                    })
                );
            }
            
            if (activeTab === 'llm') {
                // Only send API key if it's different from what was loaded (i.e., user modified it)
                const apiKeyToSend = llmData.api_key !== originalApiKey 
                    ? llmData.api_key 
                    : originalApiKey;  // Send original (unchanged) if user didn't modify it
                promises.push(
                    settingsAPI.updateLLM({
                        ollama_model: llmData.default_model.trim(),
                        ollama_host: llmData.ollama_url.trim(),
                        api_key: apiKeyToSend,
                    })
                );
                if (llmData.default_model.trim()) {
                    localStorage.setItem("savedDefaultModel", llmData.default_model.trim());
                } else {
                    localStorage.removeItem("savedDefaultModel");
                }
            }
            
            promises.push(
                settingsAPI.updateNotifications(notifPrefs)
            );
            
            if (promises.length > 0) {
                await Promise.all(promises);
            }
            
            if (activeTab === 'security') {
                showMsg("Use 'Change Password' button to update password.");
            } else {
                showMsg("All settings saved successfully.");
            }
        } catch (e) {
            showMsg(e.message || "Save failed.", true);
        } finally {
            setIsSaving(false);
        }
    };

    const handleChangePassword = async () => {
        setPwdStatus({ msg: '', error: false });
        if (!pwdData.current) { setPwdStatus({ msg: 'Enter your current password.', error: true }); return; }
        if (!pwdData.next) { setPwdStatus({ msg: 'Enter a new password.', error: true }); return; }
        if (pwdData.next.length < 6) { setPwdStatus({ msg: 'New password must be at least 6 characters.', error: true }); return; }
        if (pwdData.next !== pwdData.confirm) { setPwdStatus({ msg: "New passwords don't match.", error: true }); return; }
        setIsChangingPwd(true);
        try {
            await settingsAPI.changePassword(pwdData.current, pwdData.next);
            setPwdData({ current: '', next: '', confirm: '' });
            setPwdStatus({ msg: 'Password changed successfully!', error: false });
            toast.success('Password changed!');
        } catch (e) {
            const msg = e.message || 'Failed to change password.';
            setPwdStatus({ msg, error: true });
            toast.error(msg);
        } finally {
            setIsChangingPwd(false);
        }
    };

    const handleDeleteAccount = async () => {
        const confirmed = window.confirm(
            "Are you sure? This will permanently delete your account, all projects, builds, and artifacts. This cannot be undone."
        );
        if (!confirmed) return;
        try {
            await authAPI.deleteAccount();
            // Clear all localStorage data
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("savedDefaultModel");
            // Logout and redirect to login
            logout();
            toast.success("Account deleted successfully.");
            navigate("/login");
        } catch (e) {
            const msg = e.message || 'Failed to delete account.';
            toast.error(msg);
            console.error('Account deletion error:', e);
        }
    };

    return (
        <section className="settings-layout-light">
            {/* Feature 11 — Shared Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <main className="main-content-light">
                {/* Top Header (White) */}
                <header className="top-header-light">
                    <div className="search-bar">
                        <Search size={16} className="search-icon" />
                        <input type="text" placeholder="Search projects..." />
                        <span className="shortcut">⌘K</span>
                    </div>
                    <div className="header-actions">
                        <button className="new-project-btn">
                            <Plus size={16} /> New Project
                        </button>
                        <button className="notification-btn">
                            <Bell size={18} />
                        </button>
                    </div>
                </header>

                <div className="settings-wrapper">
                    <div className="settings-header">
                        <h1>Settings</h1>
                        <p>Manage your profile, LLM configuration, and account preferences.</p>
                    </div>

                    <div className="settings-body">
                        {/* Settings Left Navigation (Dark) */}
                        <nav className="settings-side-nav">
                            <button className={`nav-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
                                <User size={16} /> Profile
                            </button>
                            <button className={`nav-btn ${activeTab === 'llm' ? 'active' : ''}`} onClick={() => setActiveTab('llm')}>
                                <Cpu size={16} /> LLM / Ollama
                            </button>
                            <button className={`nav-btn ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>
                                <Bell size={16} /> Notifications
                            </button>
                            <button className={`nav-btn ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
                                <Shield size={16} /> Security
                            </button>
                            <button className={`nav-btn ${activeTab === 'account' ? 'active' : ''}`} onClick={() => setActiveTab('account')}>
                                <AlertTriangle size={16} /> Account
                            </button>
                        </nav>

                        {/* Settings Content Panels */}
                        <div className="settings-content-panels">
                            {activeTab === 'profile' && (
                                <form className="panel-card" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                                    <div className="panel-header">
                                        <h2>Personal Information</h2>
                                        <p>Update your name, email, and bio displayed in the workspace.</p>
                                    </div>

                                    <div className="avatar-section">
                                        <div className="avatar-circle">
                                            {profileData.avatar
                                                ? <img src={profileData.avatar} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                                : <User size={32} />}
                                        </div>
                                        <div className="avatar-actions">
                                            {/* Hidden file input */}
                                            <input
                                                ref={avatarRef}
                                                type="file"
                                                accept="image/*"
                                                style={{ display: 'none' }}
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;
                                                    if (file.size > 2 * 1024 * 1024) {
                                                        showMsg('Image must be under 2 MB.', true);
                                                        return;
                                                    }
                                                    const reader = new FileReader();
                                                    reader.onload = (ev) => setProfileData(p => ({ ...p, avatar: ev.target.result }));
                                                    reader.readAsDataURL(file);
                                                }}
                                            />
                                            <button type="button" className="change-avatar-btn" onClick={() => avatarRef.current?.click()}>Change Avatar</button>
                                        </div>
                                    </div>

                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>Full Name</label>
                                            <input
                                                type="text"
                                                value={profileData.fullName}
                                                onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Email Address</label>
                                            <input
                                                type="email"
                                                value={profileData.email}
                                                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group mt-6">
                                        <label>Bio</label>
                                        <textarea
                                            rows={4}
                                            value={profileData.bio}
                                            onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                                        />
                                    </div>
                                </form>
                            )}

                            {activeTab === 'notifications' && (
                                <div className="panel-card">
                                    <div className="panel-header">
                                        <h2>Notification Preferences</h2>
                                        <p>Choose which events trigger notifications.</p>
                                    </div>

                                    <div className="toggle-list">
                                        {[
                                            { key: 'buildComplete', label: 'Build Complete', desc: 'Notify when an agent pipeline finishes successfully.' },
                                            { key: 'buildFailed', label: 'Build Failed', desc: 'Notify when a build pipeline encounters an error.' },
                                        ].map(({ key, label, desc }) => (
                                            <div className="toggle-item" key={key}>
                                                <div className="toggle-info">
                                                    <h4>{label}</h4>
                                                    <p>{desc}</p>
                                                </div>
                                                <div
                                                    className={`toggle-switch ${notifPrefs[key] ? 'active' : 'inactive'}`}
                                                    onClick={() => setNotifPrefs(p => ({ ...p, [key]: !p[key] }))}
                                                    style={{ cursor: 'pointer' }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'security' && (
                                <>
                                    <div className="panel-card">
                                        <div className="panel-header">
                                            <h2>Change Password</h2>
                                            <p>Update your account password. Your JWT sessions will be refreshed.</p>
                                        </div>
                                        <div className="form-group mt-4">
                                            <label>Current Password</label>
                                            <div className="input-with-icon">
                                                <input
                                                    type={showPwd.current ? 'text' : 'password'}
                                                    value={pwdData.current}
                                                    onChange={(e) => setPwdData({ ...pwdData, current: e.target.value })}
                                                />
                                                <Eye size={16} className="input-icon" style={{ cursor: 'pointer' }}
                                                    onClick={() => setShowPwd(p => ({ ...p, current: !p.current }))} />
                                            </div>
                                        </div>
                                        <div className="form-group mt-6">
                                            <label>New Password</label>
                                            <div className="input-with-icon">
                                                <input
                                                    type={showPwd.next ? 'text' : 'password'}
                                                    value={pwdData.next}
                                                    onChange={(e) => setPwdData({ ...pwdData, next: e.target.value })}
                                                />
                                                <Eye size={16} className="input-icon" style={{ cursor: 'pointer' }}
                                                    onClick={() => setShowPwd(p => ({ ...p, next: !p.next }))} />
                                            </div>
                                            <p className="input-hint">Minimum 8 characters.</p>
                                        </div>
                                        <div className="form-group mt-6">
                                            <label>Confirm New Password</label>
                                            <div className="input-with-icon">
                                                <input
                                                    type={showPwd.confirm ? 'text' : 'password'}
                                                    value={pwdData.confirm}
                                                    onChange={(e) => setPwdData({ ...pwdData, confirm: e.target.value })}
                                                />
                                                <Eye size={16} className="input-icon" style={{ cursor: 'pointer' }}
                                                    onClick={() => setShowPwd(p => ({ ...p, confirm: !p.confirm }))} />
                                            </div>
                                        </div>

                                        {/* Inline status message */}
                                        {pwdStatus.msg && (
                                            <p style={{
                                                marginTop: '1rem',
                                                fontSize: '0.875rem',
                                                color: pwdStatus.error ? '#ef4444' : '#4ade80',
                                                fontWeight: 500,
                                            }}>
                                                {pwdStatus.msg}
                                            </p>
                                        )}

                                        <div style={{ marginTop: '1.5rem' }}>
                                            <button
                                                type="button"
                                                className="save-changes-btn"
                                                onClick={handleChangePassword}
                                                disabled={isChangingPwd}
                                                style={{ width: 'auto' }}
                                            >
                                                <Save size={16} /> {isChangingPwd ? 'Changing…' : 'Change Password'}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="panel-card mt-6">
                                        <div className="panel-header mb-0">
                                            <h2>Advanced Security</h2>
                                        </div>
                                        <div className="toggle-list mt-6">
                                            <div className="toggle-item no-border pb-0">
                                                <div className="toggle-info">
                                                    <h4>Two-Factor Authentication</h4>
                                                    <p>Add an extra layer of security using TOTP (Coming Soon).</p>
                                                </div>
                                                <div 
                                                    className={`toggle-switch ${twoFactorEnabled ? 'active' : 'inactive'}`}
                                                    onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                                                    style={{ cursor: 'pointer', opacity: 0.5 }}
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group mt-8">
                                            <label>JWT Session Timeout</label>
                                            <select 
                                                value={sessionTimeout}
                                                onChange={(e) => setSessionTimeout(e.target.value)}
                                            >
                                                <option value="24h">24 hours</option>
                                                <option value="7d">7 days</option>
                                                <option value="30d">30 days</option>
                                            </select>
                                        </div>
                                    </div>
                                </>
                            )}

                            {activeTab === 'account' && (
                                <div className="panel-card danger-card">
                                    <div className="panel-header">
                                        <h2>Danger Zone</h2>
                                        <p>Irreversible actions for your account.</p>
                                    </div>
                                    <div className="danger-action-row mt-6">
                                        <div className="toggle-info">
                                            <h4 className="text-danger">Delete Account</h4>
                                            <p className="text-danger-muted">Permanently deletes all projects, builds, and artifacts.</p>
                                        </div>
                                        <button className="delete-btn" onClick={handleDeleteAccount}>Delete</button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'llm' && (
                                <div className="panel-card">
                                    <div className="panel-header">
                                        <h2>LLM Configuration</h2>
                                        <p>Configure external language models or local Ollama instances.</p>
                                    </div>

                                    <div className="form-group mt-6">
                                        <label>Custom / Default Model</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. gpt-4o, claude-3-5-sonnet, gemini-1.5-pro, qwen3-vl:8b…"
                                            value={llmData.default_model}
                                            onChange={(e) => setLlmData({ ...llmData, default_model: e.target.value })}
                                        />
                                        <p className="input-hint">This model will be used as the default for all new projects after saving.</p>
                                    </div>
                                    <div className="form-group mt-6">
                                        <label>API Key <span style={{ fontWeight: 400, color: '#94a3b8' }}>(for external models)</span></label>
                                        <div className="input-with-icon">
                                            <input
                                                type={showPwd.apiKey ? 'text' : 'password'}
                                                placeholder="sk-… or leave blank for local Ollama"
                                                value={llmData.api_key}
                                                onChange={(e) => setLlmData({ ...llmData, api_key: e.target.value })}
                                            />
                                            <Eye size={16} className="input-icon" style={{ cursor: 'pointer' }}
                                                onClick={() => setShowPwd(p => ({ ...p, apiKey: !p.apiKey }))} />
                                        </div>
                                        <p className="input-hint">{originalApiKey && originalApiKey.includes('*') ? 'Your API key is securely stored (masked above). To change it, enter a new key.' : 'Leave blank if using a local Ollama model.'}</p>
                                    </div>
                                    <div className="form-group mt-6">
                                        <label>Ollama Connection URL <span style={{ fontWeight: 400, color: '#94a3b8' }}>(optional)</span></label>
                                        <input
                                            type="text"
                                            value={llmData.ollama_url}
                                            onChange={(e) => setLlmData({ ...llmData, ollama_url: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bottom-save-container">
                        <button className="save-changes-btn" onClick={handleSave} disabled={isSaving}>
                            <Save size={16} /> {isSaving ? "Saving…" : "Save Changes"}
                        </button>
                    </div>

                </div>
            </main>
        </section>
    );
};

export default SettingPage;