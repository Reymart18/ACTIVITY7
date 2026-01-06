import { useState, useEffect, useMemo } from "react";
import axios from "axios";

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
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

      {/* Project Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-lg shadow-md flex flex-col items-center bg-[#799851] text-white">
          <span className="text-xl font-bold">{finished}</span>
          <span className="text-sm opacity-90">Finished Projects</span>
        </div>
        <div className="p-4 rounded-lg shadow-md flex flex-col items-center bg-[#FF8237] text-white">
          <span className="text-xl font-bold">{inProgress}</span>
          <span className="text-sm opacity-90">In Progress</span>
        </div>
        <div className="p-4 rounded-lg shadow-md flex flex-col items-center bg-[#cb4c46] text-white">
          <span className="text-xl font-bold">{unfinished}</span>
          <span className="text-sm opacity-90">Unfinished Projects</span>
        </div>
      </div>

      {/* Project Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div key={project.id} className="p-4 bg-white rounded-lg shadow-md border border-gray-100">
              <div className="flex items-start justify-between">
                <h3 className="font-bold text-lg text-gray-900">{project.name}</h3>
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] ${badgeClass}`}>
                  {derivedStatus}
                </span>
              </div>

              {project.description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{project.description}</p>
              )}

              <div className="mt-3 text-sm">
                <div className="text-gray-700">
                  <span className="font-medium">{pending}</span> tasks pending
                </div>
                <div className={`mt-1 ${statusClass}`}>
                  Status: {derivedStatus}
                </div>
              </div>

              {project.deadline && (
                <div className="mt-2 text-xs text-gray-500">
                  Due {new Date(project.deadline).toLocaleDateString()}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}