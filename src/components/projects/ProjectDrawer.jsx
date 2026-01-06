import { useState, useEffect } from "react";

export default function ProjectDrawer({ type, isOpen, onClose, onSave, teamMembers = [] }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState("Not started");
  const [members, setMembers] = useState([]); // array of user IDs
  const [userSearch, setUserSearch] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setName("");
      setDescription("");
      setDeadline("");
      setStatus("Not started");
      setMembers([]);
      setUserSearch("");
    }
  }, [isOpen]);

  const filteredUsers = teamMembers.filter(user =>
    user.name.toLowerCase().includes(userSearch.toLowerCase())
  );

  const toggleMember = (userId) => {
    setMembers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  return (
    <div
      className={`
        fixed top-0 right-0 h-full bg-white shadow-xl z-30
        transition-all duration-500 ease-in-out overflow-hidden
        ${isOpen ? "w-96 p-6 opacity-100" : "w-0 p-0 opacity-0"}
      `}
    >
      <div className="flex flex-col h-full">
        {isOpen && (
          <>
            <h3 className="text-xl font-bold mb-4">
              {type === "project" ? "New Project" : "New Task"}
            </h3>

            <input
              type="text"
              placeholder={type === "project" ? "Project Name" : "Task Name"}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mb-4 p-2 border rounded-md w-full"
            />

            {type === "project" && (
              <>
                <textarea
                  placeholder="Project Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mb-4 p-2 border rounded-md w-full"
                />
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="mb-4 p-2 border rounded-md w-full"
                />
              </>
            )}

            {type === "task" && (
              <>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mb-4 p-2 border rounded-md w-full"
                >
                  <option>Not started</option>
                  <option>In progress</option>
                  <option>Finished</option>
                </select>

                <input
                  type="text"
                  placeholder="Search user..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="mb-2 p-2 border rounded-md w-full"
                />
                <ul className="mb-4 border rounded max-h-40 overflow-auto">
                  {filteredUsers.map((user) => (
                    <li
                      key={user.id}
                      className={`px-2 py-1 cursor-pointer hover:bg-gray-200 ${
                        members.includes(user.id) ? "bg-gray-100" : ""
                      }`}
                      onClick={() => toggleMember(user.id)}
                    >
                      {user.name}
                    </li>
                  ))}
                </ul>

                {members.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {members.map(id => {
                      const user = teamMembers.find(u => u.id === id);
                      return (
                        <span key={id} className="px-2 py-1 text-xs bg-gray-200 rounded">
                          {user?.name || id}
                        </span>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            <div className="mt-auto flex justify-end space-x-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (type === "project") {
                    onSave({ name, description, deadline, tasks: [] });
                  } else {
                    onSave({ name, status, members }); // members: user IDs
                  }
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-500"
              >
                Save
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}