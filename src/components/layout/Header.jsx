import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import BurgerMenu from "./BurgerMenu";
import NotificationsBell from "./NotificationsBell";
import { FaUserCircle, FaSignOutAlt } from "react-icons/fa";

export default function Header({
  toggleMenu,
  menuOpen,
  onLogout,
}) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notifRefresh, setNotifRefresh] = useState(0); // refresh bell after actions

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = { Authorization: `Bearer ${token}` };

  const storedUser = useMemo(() => {
    if (typeof window === "undefined") return null;
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (storedUser) {
      setUser(storedUser);
      return;
    }
    const fetchMe = async () => {
      if (!token) return;
      try {
        setLoading(true);
        // Adjust if your backend uses a different endpoint
        const res = await axios.get("http://localhost:3000/users/me", { headers });
        setUser(res.data);
        localStorage.setItem("user", JSON.stringify(res.data));
      } catch {
        // no-op
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const displayName =
    user?.name ||
    user?.fullName ||
    user?.username ||
    user?.email ||
    (loading ? "Loading…" : "User");

  const initials = (value) => {
    const str = typeof value === "string" ? value : String(value ?? "");
    const parts = str.trim().split(/\s+/);
    const a = parts[0]?.[0] || "";
    const b = parts[1]?.[0] || "";
    const res = (a + b).toUpperCase();
    return res || (str.trim()[0]?.toUpperCase() || "?");
  };

  // Handle Accept/Reject from the header's bell
  const handleBellRespond = async (projectId, taskId, action) => {
    try {
      await axios.post(
        `http://localhost:3000/projects/${projectId}/tasks/${taskId}/respond`,
        { action },
        { headers }
      );
      // Refresh notifications list
      setNotifRefresh((x) => x + 1);
      // Tell any page (e.g., ProjectsPage) to refetch projects
      window.dispatchEvent(new CustomEvent("projects:refresh"));
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to respond to assignment");
    }
  };

  return (
    <header className="top-0 left-0 w-full flex items-center justify-between p-4 md:p-6 bg-black text-white z-40 shadow-md font-poppins">
      {/* Left side: Burger + Title */}
      <div className="flex items-center">
        <BurgerMenu onClick={toggleMenu} isOpen={menuOpen} />
        <h1 className="ml-4 text-lg md:text-xl font-bold tracking-wide">Project Manager</h1>
      </div>

      {/* Right side: Notifications + Profile + Logout */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Notification bell (now in header) */}
        <div className="mr-1">
          <NotificationsBell onRespond={handleBellRespond} refreshKey={notifRefresh} />
        </div>

        {/* Profile chip */}
        <div
          className="group hidden sm:flex items-center gap-2 rounded-full bg-white/5 px-2.5 py-1.5 md:px-3 md:py-2 ring-1 ring-white/10 hover:ring-white/20 transition"
          title={displayName}
        >
          {displayName && displayName !== "User" ? (
            <div className="relative inline-flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 text-white shadow-sm">
              <span className="text-xs md:text-sm font-semibold">{initials(displayName)}</span>
            </div>
          ) : (
            <FaUserCircle className="text-gray-300 h-8 w-8 md:h-9 md:w-9" />
          )}
          <div className="hidden md:block">
            <div className="text-sm font-medium">{displayName}</div>
            {user?.role && <div className="text-xs text-gray-400">{user.role}</div>}
          </div>
        </div>

        {/* Logout button */}
        <button
          onClick={onLogout}
          className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-1.5 md:px-3.5 md:py-2 text-xs md:text-sm text-white hover:bg-white/15 transition-colors"
          title="Logout"
        >
          <FaSignOutAlt className="h-4 w-4 md:h-5 md:w-5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}