import { useState, useEffect } from "react";
import axios from "axios";
import ProjectCard from "../components/projects/ProjectCard";
import ProjectDrawer from "../components/projects/ProjectDrawer";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerType, setDrawerType] = useState("");
  const [currentProjectIndex, setCurrentProjectIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [users, setUsers] = useState([]);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };
  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; }
  })();

  const fetchProjects = async () => {
    try {
      const res = await axios.get("http://localhost:3000/projects", { headers });
      setProjects(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    (async () => {
      try {
        const res = await axios.get("http://localhost:3000/users", { headers });
        setUsers(res.data);
      } catch (err) {}
    })();

    const onRefresh = () => fetchProjects();
    window.addEventListener("projects:refresh", onRefresh);
    return () => window.removeEventListener("projects:refresh", onRefresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddProject = async (project) => {
    try {
      const res = await axios.post("http://localhost:3000/projects", project, { headers });
      setProjects([...projects, res.data]);
      setDrawerOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add project");
    }
  };

  const handleAddTask = async (task) => {
    try {
      const project = projects[currentProjectIndex];
      const res = await axios.post(
        `http://localhost:3000/projects/${project.id}/tasks`,
        task,
        { headers }
      );
      const updated = projects.slice();
      updated[currentProjectIndex] = res.data;
      setProjects(updated);
      setDrawerOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add task");
    }
  };

  const handleRespond = async (projectId, taskId, action) => {
    try {
      await axios.post(
        `http://localhost:3000/projects/${projectId}/tasks/${taskId}/respond`,
        { action },
        { headers }
      );
      await fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to respond");
    }
  };

  const handleUpdateStatus = async (projectId, taskId, status) => {
    try {
      const res = await axios.patch(
        `http://localhost:3000/projects/${projectId}/tasks/${taskId}/status`,
        { status },
        { headers }
      );
      setProjects(prev => prev.map(p => (p.id === projectId ? res.data : p)));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleFinishTask = async (projectId, taskId, file) => {
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await axios.post(
        `http://localhost:3000/projects/${projectId}/tasks/${taskId}/finish`,
        form,
        { headers }
      );
      setProjects(prev => prev.map(p => (p.id === projectId ? res.data : p)));
      await fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to finish task with proof");
    }
  };

  if (loading) return <p>Loading projects...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="relative flex">
      <div className="flex-1 transition-all duration-500">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">Projects</h2>
            <p className="text-gray-600">Manage your projects and tasks here.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => { setDrawerType("project"); setDrawerOpen(true); }}
              className="px-4 py-2 bg-[#4569AD] text-white rounded-md hover:bg-[#36538a] transition-colors"
            >
              + Add Project
            </button>
          </div>
        </div>

        {projects.length === 0 ? (
          <p className="text-gray-600">No projects yet. Create one!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((project, idx) => {
              const canManage = currentUser && project.userId === currentUser.id; // Only creator
              return (
                <ProjectCard
                  key={project.id}
                  project={project}
                  teamMembers={users}
                  currentUser={currentUser}
                  canManage={canManage}
                  onRespond={(taskId, action) => handleRespond(project.id, taskId, action)}
                  onUpdateStatus={(taskId, status) => handleUpdateStatus(project.id, taskId, status)}
                  onFinish={(taskId, file) => handleFinishTask(project.id, taskId, file)}
                  openTaskDrawer={() => {
                    if (!canManage) return; // guard
                    setCurrentProjectIndex(idx);
                    setDrawerType("task");
                    setDrawerOpen(true);
                  }}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Pass canManage to drawer; show assignment inputs only to owner */}
      <ProjectDrawer
        type={drawerType}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSave={drawerType === "project" ? handleAddProject : handleAddTask}
        teamMembers={users}
        canManage={
          drawerType === "task" &&
          currentProjectIndex !== null &&
          currentUser &&
          projects[currentProjectIndex]?.userId === currentUser.id
        }
      />
    </div>
  );
}