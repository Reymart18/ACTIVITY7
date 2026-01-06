import { useEffect, useState } from "react";
import axios from "axios";

export default function NotificationsBell({ onRespond, refreshKey = 0 }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get("http://localhost:3000/notifications", { headers });
      const data = res.data || [];
      setItems(data);
      setUnread(data.filter((n) => n.status === "unread").length);
    } catch (e) {
      // no-op
    }
  };

  useEffect(() => {
    fetchNotifications();
    const id = setInterval(fetchNotifications, 15000);
    return () => clearInterval(id);
  }, []);

  // Refetch when parent signals a response was taken
  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const markAllRead = async () => {
    try {
      const ids = items.filter(i => i.status === "unread").map(i => i.id);
      if (ids.length) {
        await axios.post("http://localhost:3000/notifications/read", { ids }, { headers });
      }
      fetchNotifications();
    } catch (e) {
      // no-op
    }
  };

  return (
    <div className="relative">
      <button
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-700 shadow hover:bg-gray-50"
        onClick={() => setOpen((o) => !o)}
        title="Notifications"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 0 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M9 17a3 3 0 0 0 6 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-80 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-sm font-semibold text-gray-800">Notifications</span>
            <button onClick={markAllRead} className="text-xs text-blue-600 hover:underline">
              Mark all read
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
            {items.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-gray-500">No notifications</div>
            ) : (
              items.map((n) => {
                const isUnread = n.status === "unread";
                const isAssignment = n.type === "task_assigned";
                // Show Accept/Reject only when unread assignment
                const showActions = isAssignment && isUnread;

                return (
                  <div key={n.id} className={`px-4 py-3 ${isUnread ? "bg-blue-50/40" : ""}`}>
                    <div className="text-sm text-gray-800">{n.message}</div>

                    {showActions && n.projectId && n.taskId && (
                      <div className="mt-2 flex gap-2">
                        <button
                          className="rounded-md bg-green-600 px-2 py-1 text-xs text-white hover:bg-green-500"
                          onClick={() => onRespond?.(n.projectId, n.taskId, "accept")}
                        >
                          Accept
                        </button>
                        <button
                          className="rounded-md bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-500"
                          onClick={() => onRespond?.(n.projectId, n.taskId, "reject")}
                        >
                          Reject
                        </button>
                      </div>
                    )}

                    <div className="mt-1 text-[11px] text-gray-500">
                      {new Date(n.createdAt).toLocaleString()}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}