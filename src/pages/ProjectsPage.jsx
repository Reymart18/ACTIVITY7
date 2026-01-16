import { useState, useEffect } from "react";
import axios from "axios";
import ProjectCard from "../components/projects/ProjectCard";
import ProjectDrawer from "../components/projects/ProjectDrawer";
import { FolderKanban, CheckCircle2, Clock, Calendar, TrendingUp, Plus } from "lucide-react";

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

  const handleDeleteProject = async (projectId) => {
    try {
      await axios.delete(`http://localhost:3000/projects/${projectId}`, { headers });
      setProjects(prev => prev.filter(p => p.id !== projectId));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete project");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col items-center gap-4">
        <svg className="animate-spin h-12 w-12 text-indigo-600" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-gray-600 font-medium">Loading projects...</p>
      </div>
    </div>
  );
  if (error) return <p className="text-red-500">{error}</p>;

  const totalProjects = projects.length;
  const allTasks = projects.flatMap(p => p.tasks || []);
  const completedTasks = allTasks.filter(t => (t.status || "").toLowerCase() === "finished").length;
  const totalTasks = allTasks.length;
  const remainingTasks = totalTasks - completedTasks;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Count upcoming deadlines (within 7 days) for both projects and tasks
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const projectDeadlinesWithin7Days = projects.filter(p => {
    if (!p.deadline) return false;
    const deadlineDate = new Date(p.deadline);
    return deadlineDate >= now && deadlineDate <= sevenDaysFromNow;
  }).length;
  const taskDeadlinesWithin7Days = allTasks.filter(t => {
    if (!t.deadline) return false;
    const deadlineDate = new Date(t.deadline);
    return deadlineDate >= now && deadlineDate <= sevenDaysFromNow;
  }).length;
  const upcomingDeadlines = projectDeadlinesWithin7Days + taskDeadlinesWithin7Days;

  return (
    <div className="relative flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex-1 transition-all duration-500 p-6">
        {/* Enhanced Header Section */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                    <FolderKanban className="w-7 h-7 text-white" />
                  </div>
                  <h2 className="text-4xl font-bold text-gray-900">
                    Projects
                  </h2>
                </div>
                <p className="text-gray-600 text-lg ml-14">Manage and track your projects effortlessly</p>
              </div>

              <button
                onClick={() => { setDrawerType("project"); setDrawerOpen(true); }}
                className="group relative px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <Plus className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300" />
                Add Project
              </button>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-5 border border-indigo-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-indigo-600 mb-1">Total Projects</p>
                    <p className="text-3xl font-bold text-indigo-900">{totalProjects}</p>
                  </div>
                  <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                    <FolderKanban className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              
              <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-5 border border-emerald-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-emerald-600 mb-1">Completed Tasks</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold text-emerald-900">{completedTasks}</p>
                      <span className="text-lg font-semibold text-emerald-700">/ {totalTasks}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-2 bg-emerald-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-500"
                          style={{ width: `${completionPercentage}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-emerald-700">{completionPercentage}%</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              
              <div className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-5 border border-amber-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-amber-600 mb-1">Remaining Tasks</p>
                    <p className="text-3xl font-bold text-amber-900">{remainingTasks}</p>
                    <div className="mt-2 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-amber-600" />
                      <span className="text-xs font-medium text-amber-700">In progress</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              
              <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600 mb-1">Upcoming Deadlines</p>
                    <p className="text-3xl font-bold text-purple-900">{upcomingDeadlines}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-6">
              <FolderKanban className="w-12 h-12 text-indigo-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No projects yet</h3>
            <p className="text-gray-600 mb-6 text-center max-w-md">Start organizing your work by creating your first project!</p>
            <button
              onClick={() => { setDrawerType("project"); setDrawerOpen(true); }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Create Your First Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
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
                  onDelete={handleDeleteProject}
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