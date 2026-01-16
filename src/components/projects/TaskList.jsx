import { useEffect, useState } from "react";
import { Calendar, Clock } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function TaskList({ tasks = [], teamMembers = [], currentUser, onRespond, onUpdateStatus, onFinish }) {
  if (!tasks || tasks.length === 0) return <p className="text-sm text-gray-500">No tasks yet</p>;

  const [selectedFiles, setSelectedFiles] = useState({});   // { [taskKey]: File | null }
  const [uploading, setUploading] = useState({});           // { [taskKey]: boolean }
  const [modal, setModal] = useState({ open: false, taskKey: null, index: 0, proofs: [] });

  const nameForId = (id) => {
    const user = teamMembers.find(u => u.id === id);
    return user?.name ?? String(id);
  };

  const initials = (value) => {
    const str = typeof value === "string" ? value : String(value ?? "");
    const parts = str.trim().split(/\s+/);
    const a = parts[0]?.[0] || "";
    const b = parts[1]?.[0] || "";
    const res = (a + b).toUpperCase();
    return res || (str.trim()[0]?.toUpperCase() || "?");
  };

  const statusPill = (status = "") => {
    const s = String(status).toLowerCase();
    if (s === "finished") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (s === "in progress") return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-gray-50 text-gray-700 border-gray-200";
  };

  const allowedStatuses = ["Not started", "In progress"]; // Finished handled by upload button

  const handleUpdate = async (task, newStatus) => {
    try {
      await onUpdateStatus?.(task.id, newStatus);
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to update status");
    }
  };

  const handleUploadFinish = async (taskKey, task) => {
    const file = selectedFiles[taskKey];
    if (!file) {
      alert("Please choose an image file as proof.");
      return;
    }
    if (uploading[taskKey]) return;
    try {
      setUploading(prev => ({ ...prev, [taskKey]: true }));
      await onFinish?.(task.id, file);
      setSelectedFiles(prev => ({ ...prev, [taskKey]: null }));
      // Open modal to show the newly uploaded proof
      const updatedTask = (tasks.find(t => (t.id ?? t.name) === (task.id ?? task.name)) || task);
      const proofs = Array.isArray(updatedTask.proofs) ? updatedTask.proofs : [];
      if (proofs.length) {
        setModal({ open: true, taskKey, index: proofs.length - 1, proofs });
      }
    } catch (e) {
      alert(e?.response?.data?.message || "Failed to upload proof and finish task");
    } finally {
      setUploading(prev => ({ ...prev, [taskKey]: false }));
    }
  };

  const imgSrc = (url) => (/^https?:\/\//i.test(url) ? url : `${API_BASE}${url}`);

  const openProofs = (taskKey, proofs) => {
    if (!proofs || proofs.length === 0) return;
    setModal({ open: true, taskKey, index: 0, proofs });
  };

  const closeModal = () => setModal({ open: false, taskKey: null, index: 0, proofs: [] });

  return (
    <>
      <ul className="space-y-3">
        {tasks.map((task, idx) => {
          const taskKey = task.id ?? task.name ?? String(idx);
          const hasAssignments = Array.isArray(task.assignments);
          const members = hasAssignments
            ? task.assignments.map(a => a.userId)
            : (Array.isArray(task.members) ? task.members : []);
          const memberNames = members.map(nameForId);

          const myAssignment = hasAssignments && currentUser
            ? task.assignments.find(a => a.userId === currentUser.id)
            : null;

          const canEditStatus =
            (myAssignment && myAssignment.status === 'accepted') ||
            (!hasAssignments && currentUser && Array.isArray(task.members) && task.members.includes(currentUser.id));

          const proofs = Array.isArray(task.proofs) ? task.proofs : [];

          return (
            <li key={task.id || `${task.name}-${idx}`} className="rounded-lg border border-gray-200 bg-white/50 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 w-full">
                  {/* Title + status pill + View proofs button inline */}
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium text-gray-900">{task.name}</span>
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] ${statusPill(task.status)}`}>
                      {task.status || "Not started"}
                    </span>
                    <button
                      onClick={() => openProofs(taskKey, proofs)}
                      className={`ml-2 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition
                        ${proofs.length ? "bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200" : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"}`}
                      disabled={proofs.length === 0}
                      title={proofs.length === 0 ? "No proofs yet" : "View proofs"}
                    >
                      {/* icon */}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M3 7h18M3 17h18M7 3v18M17 3v18" stroke="currentColor" strokeWidth="1.8" />
                      </svg>
                      <span>View proofs</span>
                      {proofs.length > 0 && (
                        <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-semibold text-white">
                          {proofs.length}
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Task Deadline */}
                  {task.deadline && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs">
                      <Calendar className="w-3.5 h-3.5 text-purple-500" />
                      <span className="text-gray-600">Due:</span>
                      <span className="font-semibold text-purple-700">
                        {new Date(task.deadline).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </span>
                      {(() => {
                        const today = new Date();
                        const deadline = new Date(task.deadline);
                        const diffTime = deadline - today;
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        if (diffDays < 0) {
                          return <span className="text-red-600 font-medium">(Overdue)</span>;
                        } else if (diffDays <= 3) {
                          return <span className="text-amber-600 font-medium">({diffDays} day{diffDays !== 1 ? 's' : ''} left)</span>;
                        }
                        return null;
                      })()}
                    </div>
                  )}

                  {/* Members */}
                  {memberNames.length > 0 ? (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {(hasAssignments ? task.assignments : members.map(uid => ({ userId: uid, status: undefined }))).map((a, i) => {
                        const displayName = nameForId(a.userId ?? members[i]);
                        const state = String(a.status || "").toLowerCase();
                        const stateClass =
                          state === "accepted" ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                          state === "rejected" ? "bg-red-100 text-red-700 border-red-200" :
                          state === "pending" ? "bg-yellow-100 text-yellow-700 border-yellow-200" :
                          "bg-gray-100 text-gray-700 border-gray-200";
                        return (
                          <span
                            key={`${task.id || task.name}-${a.userId ?? members[i]}`}
                            className={`inline-flex items-center gap-2 rounded-full border px-2 py-1 text-xs ${stateClass}`}
                          >
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-[10px] font-semibold text-gray-700">
                              {initials(displayName)}
                            </span>
                            <span className="pr-0.5">{displayName}{a.status ? ` (${a.status})` : ""}</span>
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-gray-500">Unassigned</p>
                  )}

                  {/* Accept/Reject for pending */}
                  {myAssignment && myAssignment.status === 'pending' && (
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => onRespond?.(task.id, 'accept')}
                        className="rounded-md bg-green-600 px-2 py-1 text-xs text-white hover:bg-green-500"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => onRespond?.(task.id, 'reject')}
                        className="rounded-md bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-500"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {/* Status update (non-finished) + Finish section */}
                  {canEditStatus && (
                    <div className="mt-3 flex items-center gap-4 flex-wrap">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Update status (non-finished)</label>
                        <select
                          value={task.status === "Finished" ? "Finished" : (task.status || "Not started")}
                          onChange={(e) => handleUpdate(task, e.target.value)}
                          className="w-52 rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none"
                          disabled={Boolean(uploading[taskKey])}
                        >
                          {allowedStatuses.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                          {/* Finished via upload button */}
                          <option value="Finished" disabled>Finished (use button)</option>
                        </select>
                      </div>

                      <div className="flex items-end gap-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Proof image</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              setSelectedFiles(prev => ({ ...prev, [taskKey]: file }));
                            }}
                            className="text-sm"
                            disabled={Boolean(uploading[taskKey])}
                          />
                        </div>
                        <button
                          onClick={() => handleUploadFinish(taskKey, task)}
                          className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-emerald-500 disabled:opacity-50"
                          disabled={!selectedFiles[taskKey] || Boolean(uploading[taskKey])}
                          title={!selectedFiles[taskKey] ? "Choose an image file first" : "Upload proof and mark Finished"}
                        >
                          {uploading[taskKey] ? "Uploading..." : "Upload & Mark Finished"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Attractive modal lightbox for proofs */}
      <ProofsModal
        open={modal.open}
        proofs={modal.proofs}
        index={modal.index}
        onClose={closeModal}
        onIndexChange={(i) => setModal(prev => ({ ...prev, index: i }))}
        nameForId={nameForId}
      />
    </>
  );
}

/* Modal component */
function ProofsModal({ open, proofs = [], index = 0, onClose, onIndexChange, nameForId }) {
  const [current, setCurrent] = useState(index);

  useEffect(() => setCurrent(index), [index, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, current, proofs]);

  const next = () => {
    const i = (current + 1) % (proofs.length || 1);
    setCurrent(i);
    onIndexChange?.(i);
  };
  const prev = () => {
    const i = (current - 1 + (proofs.length || 1)) % (proofs.length || 1);
    setCurrent(i);
    onIndexChange?.(i);
  };

  if (!open) return null;

  const p = proofs[current];
  const src = p ? (/^https?:\/\//i.test(p.url) ? p.url : `${API_BASE}${p.url}`) : "";
  const caption = p ? `by ${nameForId(p.userId)} • ${new Date(p.createdAt).toLocaleString()}` : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="relative w-full max-w-4xl rounded-lg bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2">
          <div className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" className="text-blue-600">
              <path d="M12 5l4 4H8l4-4zM12 19l-4-4h8l-4 4z" fill="currentColor" />
            </svg>
            <span className="text-sm font-semibold text-gray-800">
              Proofs {proofs.length ? `(${proofs.length})` : ""}
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
          {/* Main image viewer */}
          <div className="md:col-span-9 relative bg-gray-50">
            {p ? (
              <>
                <img
                  src={src}
                  alt="Proof"
                  className="max-h-[65vh] w-full object-contain bg-white"
                />
                {/* Navigation */}
                {proofs.length > 1 && (
                  <>
                    <button
                      onClick={prev}
                      className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow hover:bg-white"
                      title="Previous"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24">
                        <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
                      </svg>
                    </button>
                    <button
                      onClick={next}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow hover:bg-white"
                      title="Next"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24">
                        <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
                      </svg>
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="flex h-64 items-center justify-center text-sm text-gray-500">No proof</div>
            )}
          </div>

          {/* Sidebar: caption + actions + thumbnails */}
          <div className="md:col-span-3 border-t md:border-t-0 md:border-l border-gray-200 flex flex-col">
            <div className="px-3 py-2">
              <div className="text-xs text-gray-600">{caption}</div>
              {p && (
                <div className="mt-2 flex items-center gap-2">
                  <a
                    href={src}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
                    title="Open full image"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M14 3h7v7M21 3l-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      <path d="M10 21H3v-7M3 21l7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                    Open
                  </a>
                  <a
                    href={src}
                    download
                    className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                    title="Download image"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M12 3v10M8 9l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      <path d="M4 19h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                    Download
                  </a>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            <div className="mt-2 grid grid-cols-3 gap-2 p-3 overflow-y-auto max-h-[30vh]">
              {proofs.map((thumb, i) => {
                const thumbSrc = /^https?:\/\//i.test(thumb.url) ? thumb.url : `${API_BASE}${thumb.url}`;
                const active = i === current;
                return (
                  <button
                    key={`${thumb.url}-${i}`}
                    onClick={() => { setCurrent(i); onIndexChange?.(i); }}
                    className={`relative overflow-hidden rounded-md border ${active ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200 hover:border-blue-300"}`}
                    title={`Proof ${i + 1}`}
                  >
                    <img src={thumbSrc} alt={`Proof ${i + 1}`} className="h-20 w-full object-cover" />
                    {active && (
                      <span className="absolute right-1 top-1 rounded bg-blue-600 px-1 text-[10px] font-semibold text-white">
                        Viewing
                      </span>
                    )}
                  </button>
                );
              })}
              {proofs.length === 0 && (
                <div className="col-span-3 text-center text-xs text-gray-500">No proofs yet</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}