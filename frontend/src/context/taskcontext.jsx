/**
 * TaskContext — global project / build state
 *
 * Provides: projects, currentProject, setCurrentProject,
 *           createProject(), startBuild(), deleteProject(),
 *           buildLogs, buildStatus, isBuilding
 */
import React, { createContext, useContext, useState, useRef, useCallback } from "react";
import toast from 'react-hot-toast';
import { projectsAPI, buildAPI, settingsAPI } from "../services/api";

const TaskContext = createContext(null);

export function TaskProvider({ children }) {
  const [projects,        setProjects]       = useState([]);
  const [currentProject,  setCurrentProject] = useState(null);
  const [buildLogs,       setBuildLogs]      = useState([]);
  const [buildStatus,     setBuildStatus]    = useState(null);  // running|completed|failed|cancelled
  const [isBuilding,      setIsBuilding]     = useState(false);
  const [notifPrefs,      setNotifPrefs]     = useState({
    buildComplete: true,
    buildFailed: true,
  });
  const wsRef = useRef(null);

  // Load notification preferences on mount
  React.useEffect(() => {
    settingsAPI.getNotifications()
      .then((d) => setNotifPrefs({
        buildComplete: d.buildComplete ?? true,
        buildFailed: d.buildFailed ?? true,
      }))
      .catch(() => { /* use defaults */ });
  }, []);

  const loadProjects = useCallback(async () => {
    const res = await projectsAPI.list();
    setProjects(res.projects || []);
    return res.projects || [];
  }, []);

  const createProject = useCallback(async (title, prompt, color_theme, ollama_model, turbo_mode = false) => {
    const project = await projectsAPI.create(title, prompt, color_theme, ollama_model, turbo_mode);
    setProjects((prev) => [project, ...prev]);
    setCurrentProject(project);
    return project;
  }, []);

  const deleteProject = useCallback(async (id) => {
    await projectsAPI.delete(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (currentProject?.id === id) setCurrentProject(null);
  }, [currentProject]);

  const startBuild = useCallback(async (projectId) => {
    setBuildLogs([]);
    setBuildStatus("running");
    setIsBuilding(true);

    // Start build on server
    await buildAPI.start(projectId);

    // Open WebSocket for live logs
    const ws = buildAPI.connect(projectId);
    wsRef.current = ws;

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === "log") {
        setBuildLogs((prev) => [...prev, msg]);
      } else if (msg.type === "status") {
        setBuildStatus(msg.status);
        if (msg.status !== "running") {
          setIsBuilding(false);
          ws.close();
          // Notify based on user preferences
          if (msg.status === "completed" && notifPrefs.buildComplete) {
            toast.success("✅ Build completed successfully!");
          } else if (msg.status === "failed" && notifPrefs.buildFailed) {
            toast.error("❌ Build failed. Check logs for details.");
          }
          // refresh project record
          projectsAPI.get(projectId).then((p) => {
            setCurrentProject(p);
            setProjects((prev) => prev.map((x) => (x.id === p.id ? p : x)));
          });
        }
      }
    };

    ws.onerror = () => { 
      setBuildStatus("failed"); 
      setIsBuilding(false);
      if (notifPrefs.buildFailed) {
        toast.error("Build connection lost.");
      }
    };
  }, [notifPrefs]);

  const cancelBuild = useCallback(async (projectId) => {
    await buildAPI.cancel(projectId);
    wsRef.current?.close();
    setIsBuilding(false);
    toast.success("Build cancelled.");
  }, []);

  return (
    <TaskContext.Provider value={{
      projects, loadProjects,
      currentProject, setCurrentProject,
      createProject, deleteProject,
      buildLogs, buildStatus, isBuilding,
      startBuild, cancelBuild,
      notifPrefs, setNotifPrefs,
    }}>
      {children}
    </TaskContext.Provider>
  );
}

export const useTask = () => useContext(TaskContext);
