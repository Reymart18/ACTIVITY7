import TaskList from "./TaskList";
import { Trash2 } from "lucide-react";

export default function ProjectCard({
  project,
  openTaskDrawer,
  teamMembers = [],
  currentUser,
  onRespond,
  onUpdateStatus,
  onFinish,
  canManage, // only true for project creator
  onDelete,
}) {
  const tasks = project.tasks || [];
  const finished = tasks.filter(t => (t.status || "").toLowerCase() === "finished").length;
  const inProgress = tasks.filter(t => (t.status || "").toLowerCase() === "in progress").length;
  const notStarted = tasks.filter(t => (t.status || "").toLowerCase() === "not started").length;

  // Calculate days until deadline
  const getDaysUntilDeadline = () => {
    if (!project.deadline) return null;
    const today = new Date();
    const deadline = new Date(project.deadline);
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysLeft = getDaysUntilDeadline();
  const isOverdue = daysLeft !== null && daysLeft < 0;
  const isUrgent = daysLeft !== null && daysLeft >= 0 && daysLeft <= 3;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-200/50 bg-white shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
      
      {/* Gradient overlay effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 via-purple-50/20 to-pink-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      <div className="relative p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">{project.name}</h3>
            {project.description && <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>}
          </div>

          {/* Only project creator can create/assign tasks and delete */}
          {canManage && (
            <div className="ml-3 flex items-center gap-2">
              <button
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete the project "${project.name}"? This action cannot be undone.`)) {
                    onDelete?.(project.id);
                  }
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-red-500 to-red-600 px-3 py-2 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:from-red-600 hover:to-red-700 hover:shadow-lg hover:scale-105 active:scale-95"
                title="Delete project"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={openTaskDrawer}
                className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:from-emerald-600 hover:to-emerald-700 hover:shadow-lg hover:scale-105 active:scale-95"
                title="Add task"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="transition-transform group-hover:rotate-90 duration-300">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
                Task
              </button>
            </div>
          )}
        </div>

        {/* Prominent Deadline Display */}
        {project.deadline && (
          <div className={`mb-4 p-4 rounded-xl border-2 ${
            isOverdue 
              ? 'bg-red-50 border-red-200' 
              : isUrgent 
              ? 'bg-amber-50 border-amber-200' 
              : 'bg-indigo-50 border-indigo-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                isOverdue 
                  ? 'bg-red-500' 
                  : isUrgent 
                  ? 'bg-amber-500' 
                  : 'bg-indigo-500'
              }`}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className={`text-xs font-medium mb-1 ${
                  isOverdue 
                    ? 'text-red-600' 
                    : isUrgent 
                    ? 'text-amber-600' 
                    : 'text-indigo-600'
                }`}>
                  {isOverdue ? 'OVERDUE' : isUrgent ? 'URGENT' : 'DEADLINE'}
                </p>
                <p className={`text-lg font-bold ${
                  isOverdue 
                    ? 'text-red-900' 
                    : isUrgent 
                    ? 'text-amber-900' 
                    : 'text-indigo-900'
                }`}>
                  {new Date(project.deadline).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </p>
                {daysLeft !== null && (
                  <p className={`text-xs font-medium mt-0.5 ${
                    isOverdue 
                      ? 'text-red-700' 
                      : isUrgent 
                      ? 'text-amber-700' 
                      : 'text-indigo-700'
                  }`}>
                    {isOverdue 
                      ? `${Math.abs(daysLeft)} day${Math.abs(daysLeft) !== 1 ? 's' : ''} overdue` 
                      : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`
                    }
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-bold text-gray-900">
              {tasks.length > 0 ? Math.round((finished / tasks.length) * 100) : 0}%
            </span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${tasks.length > 0 ? (finished / tasks.length) * 100 : 0}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-gray-600">
            <span>{finished} of {tasks.length} completed</span>
            {tasks.length > 0 && finished < tasks.length && (
              <span className="text-amber-600 font-medium">{tasks.length - finished} remaining</span>
            )}
          </div>
        </div>

        {/* Task Statistics */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100/80 px-3 py-1.5 border border-gray-200">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="font-semibold text-gray-900">{tasks.length}</span>
            <span className="text-gray-600 text-sm">tasks</span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Chip count={finished} label="Finished" color="emerald" />
            <Chip count={inProgress} label="In progress" color="amber" />
            <Chip count={notStarted} label="Not started" color="slate" />
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
    emerald: "bg-emerald-100 text-emerald-700 border-emerald-300",
    amber: "bg-amber-100 text-amber-700 border-amber-300",
    slate: "bg-slate-100 text-slate-700 border-slate-300",
  }[color] || "bg-gray-100 text-gray-700 border-gray-300";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium ${map}`}>
      <span className="font-bold">{count}</span>
      <span className="font-medium">{label}</span>
    </span>
  );
}