import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Plus, FolderKanban, Eye,
    Settings, LogOut, History as HistoryIcon
} from 'lucide-react';
import { useAuth } from '../context/authcontext';
import './Sidebar.css';

const NAV_LINKS = [
    { to: '/overview', icon: LayoutDashboard, label: 'Overview' },
    { to: '/project', icon: Plus, label: 'Create New Project' },
    { to: '/history', icon: HistoryIcon, label: 'History' },
    { to: '/build-log', icon: FolderKanban, label: 'Build Log' },
    { to: '/preview', icon: Eye, label: 'Preview' },
    { to: '/settings', icon: Settings, label: 'Settings' },
];

const Sidebar = () => {
    const { logout } = useAuth();
    const { pathname } = useLocation();

    return (
        <aside className="side_bar">
            <div className="sidebar-top">
                <Link to="/overview" className="navbar-link">
                    <img src="/logo.png" alt="Logo" className="navbar-logo-icon" />
                </Link>
                <span className="navbar-title">Prototype Builder</span>
            </div>

            <ul className="sidebar-menu">
                {NAV_LINKS.map(({ to, icon: Icon, label }) => (
                    <li key={to} className={pathname === to ? 'active' : ''}>
                        <Link to={to}>
                            {label}
                        </Link>
                    </li>
                ))}
                <li className="logout">
                    <button onClick={logout} className="nav-logout-btn">
                        Logout
                    </button>
                </li>
            </ul>
        </aside>
    );
};

export default Sidebar;
