import TaskList from "./TaskList";

export default function ProjectCard({
  project,
  openTaskDrawer,
  teamMembers = [],
  currentUser,
  onRespond,
  onUpdateStatus,
  onFinish,
  canManage, // only true for project creator
}) {
  const tasks = project.tasks || [];
  const finished = tasks.filter(t => (t.status || "").toLowerCase() === "finished").length;
  const inProgress = tasks.filter(t => (t.status || "").toLowerCase() === "in progress").length;
  const notStarted = tasks.filter(t => (t.status || "").toLowerCase() === "not started").length;

  return (
    <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
      <div className="p-5">
        <div className="mb-3 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
            {project.description && <p className="mt-1 text-sm text-gray-600 line-clamp-2">{project.description}</p>}
          </div>

          {/* Only project creator can create/assign tasks */}
          {canManage && (
            <button
              onClick={openTaskDrawer}
              className="inline-flex items-center gap-1 rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-green-500"
              title="Add task"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="-ml-0.5">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Task
            </button>
          )}
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-gray-500">
          {project.deadline && (
            <div className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M7 3v4M17 3v4M4 9h16M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1M6 5H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
              <span>Due {new Date(project.deadline).toLocaleDateString()}</span>
            </div>
          )}
          <div className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1">
            <span className="font-medium text-gray-700">{tasks.length}</span> tasks
          </div>
          <div className="ml-auto inline-flex items-center gap-2">
            <Chip count={finished} label="Finished" color="emerald" />
            <Chip count={inProgress} label="In progress" color="amber" />
            <Chip count={notStarted} label="Not started" color="gray" />
          </div>
        </div>

        <TaskList
          tasks={tasks}
          teamMembers={teamMembers}
          currentUser={currentUser}
          onRespond={onRespond}
          onUpdateStatus={onUpdateStatus}
          onFinish={onFinish}
        />
      </div>
    </div>
  );
}

function Chip({ count, label, color }) {
  const map = {
    emerald: "bg-emerald-100 text-emerald-700 border-emerald-200",
    amber: "bg-amber-100 text-amber-700 border-amber-200",
    gray: "bg-gray-100 text-gray-700 border-gray-200",
  }[color] || "bg-gray-100 text-gray-700 border-gray-200";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] ${map}`}>
      <span className="font-semibold">{count}</span>
      <span>{label}</span>
    </span>
  );
}