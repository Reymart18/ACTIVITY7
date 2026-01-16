import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { CheckCircle2, Clock, AlertCircle, Calendar, ListTodo, TrendingUp } from "lucide-react";

function deriveProjectStatus(tasks = []) {
  const total = tasks.length;
  const finished = tasks.filter(t => (t.status || "").toLowerCase() === "finished").length;
  const inProg = tasks.filter(t => (t.status || "").toLowerCase() === "in progress").length;
  const notStarted = tasks.filter(t => (t.status || "").toLowerCase() === "not started").length;

  if (total > 0 && finished === total) return "finished";
  // If any task is in progress OR some are finished but not all, it's in progress
  if (inProg > 0 || (finished > 0 && finished < total)) return "inProgress";
  // Otherwise (no finished, no in-progress), treat as unfinished
  return "unfinished";
}

function pendingCount(tasks = []) {
  return tasks.filter(t => (t.status || "").toLowerCase() !== "finished").length;
}

export default function DashboardPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch projects from backend
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:3000/projects", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProjects(res.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch projects");
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // Compute derived stats from tasks (ignores project.status from backend)
  const { finished, inProgress, unfinished } = useMemo(() => {
    const statuses = projects.map(p => deriveProjectStatus(p.tasks || []));
    return {
      finished: statuses.filter(s => s === "finished").length,
      inProgress: statuses.filter(s => s === "inProgress").length,
      unfinished: statuses.filter(s => s === "unfinished").length,
    };
  }, [projects]);

  if (loading) return <p>Loading projects...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h2>
        <p className="text-gray-600">Track your projects and monitor progress at a glance</p>
      </div>

      {/* Project Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="relative overflow-hidden p-6 rounded-xl shadow-lg flex flex-col bg-gradient-to-br from-emerald-500 to-emerald-600 text-white transform transition-all hover:scale-105 hover:shadow-xl">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10"></div>
          <div className="flex items-center justify-between mb-2">
            <CheckCircle2 className="w-8 h-8" />
            <span className="text-4xl font-bold">{finished}</span>
          </div>
          <span className="text-sm font-medium opacity-90">Finished Projects</span>
          <div className="mt-2 flex items-center text-xs opacity-80">
            <TrendingUp className="w-3 h-3 mr-1" />
            <span>All tasks completed</span>
          </div>
        </div>
        <div className="relative overflow-hidden p-6 rounded-xl shadow-lg flex flex-col bg-gradient-to-br from-amber-500 to-orange-600 text-white transform transition-all hover:scale-105 hover:shadow-xl">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10"></div>
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8" />
            <span className="text-4xl font-bold">{inProgress}</span>
          </div>
          <span className="text-sm font-medium opacity-90">In Progress</span>
          <div className="mt-2 flex items-center text-xs opacity-80">
            <TrendingUp className="w-3 h-3 mr-1" />
            <span>Active projects</span>
          </div>
        </div>
        <div className="relative overflow-hidden p-6 rounded-xl shadow-lg flex flex-col bg-gradient-to-br from-rose-500 to-red-600 text-white transform transition-all hover:scale-105 hover:shadow-xl">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10"></div>
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="w-8 h-8" />
            <span className="text-4xl font-bold">{unfinished}</span>
          </div>
          <span className="text-sm font-medium opacity-90">Unfinished Projects</span>
          <div className="mt-2 flex items-center text-xs opacity-80">
            <TrendingUp className="w-3 h-3 mr-1" />
            <span>Needs attention</span>
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
          <ListTodo className="w-6 h-6 mr-2 text-[#2A2529]" />
          Your Projects
        </h3>
      </div>

      {/* Project Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => {
          const tasks = project.tasks || [];
          const derivedStatus = deriveProjectStatus(tasks);
          const pending = pendingCount(tasks);

          const statusClass =
            derivedStatus === "finished"
              ? "text-emerald-600"
              : derivedStatus === "inProgress"
              ? "text-amber-600"
              : "text-rose-600";

          const badgeClass =
            derivedStatus === "finished"
              ? "bg-emerald-100 text-emerald-700 border-emerald-200"
              : derivedStatus === "inProgress"
              ? "bg-amber-100 text-amber-700 border-amber-200"
              : "bg-rose-100 text-rose-700 border-rose-200";

          return (
            <div key={project.id} className="group p-6 bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-xl hover:border-gray-300 transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-xl text-gray-900 group-hover:text-[#2A2529] transition-colors">{project.name}</h3>
                <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${badgeClass}`}>
                  {derivedStatus === "finished" ? "Completed" : derivedStatus === "inProgress" ? "In Progress" : "Not Started"}
                </span>
              </div>

              {project.description && (
                <p className="text-sm text-gray-600 mt-2 line-clamp-2 leading-relaxed">{project.description}</p>
              )}

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-700">
                    <ListTodo className="w-4 h-4 mr-2 text-gray-500" />
                    <span><span className="font-semibold text-[#2A2529]">{pending}</span> tasks pending</span>
                  </div>
                  <div className={`flex items-center font-medium ${statusClass}`}>
                    {derivedStatus === "finished" && <CheckCircle2 className="w-4 h-4 mr-1" />}
                    {derivedStatus === "inProgress" && <Clock className="w-4 h-4 mr-1" />}
                    {derivedStatus === "unfinished" && <AlertCircle className="w-4 h-4 mr-1" />}
                  </div>
                </div>
              </div>

              {project.deadline && (
                <div className="mt-3 flex items-center text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                  <Calendar className="w-3.5 h-3.5 mr-2" />
                  <span>Due: <span className="font-medium">{new Date(project.deadline).toLocaleDateString()}</span></span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}