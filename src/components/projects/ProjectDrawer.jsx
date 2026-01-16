import { useState, useEffect } from "react";
import { X, FolderPlus, ListPlus, Calendar, Users, Search, CheckCircle } from "lucide-react";

export default function ProjectDrawer({ type, isOpen, onClose, onSave, teamMembers = [] }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [taskDeadline, setTaskDeadline] = useState("");
  const [status, setStatus] = useState("Not started");
  const [members, setMembers] = useState([]); // array of user IDs
  const [userSearch, setUserSearch] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setName("");
      setDescription("");
      setDeadline("");
      setTaskDeadline("");
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
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}
      
      {/* Drawer */}
      <div
        className={`
          fixed top-0 right-0 h-full bg-white shadow-2xl z-50
          transition-all duration-500 ease-in-out overflow-hidden
          ${isOpen ? "w-[480px]" : "w-0"}
        `}
      >
        <div className={`flex flex-col h-full transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}>
          {isOpen && (
            <>
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                    {type === "project" ? (
                      <FolderPlus className="w-5 h-5 text-white" />
                    ) : (
                      <ListPlus className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {type === "project" ? "New Project" : "New Task"}
                  </h3>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Form Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">

                {/* Name Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {type === "project" ? "Project Name" : "Task Name"}
                  </label>
                  <input
                    type="text"
                    placeholder={`Enter ${type === "project" ? "project" : "task"} name...`}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                  />
                </div>

                {type === "project" && (
                  <>
                    {/* Description */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        placeholder="Describe your project..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none resize-none"
                      />
                    </div>
                    
                    {/* Deadline */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Deadline
                      </label>
                      <input
                        type="date"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        min={(() => {
                          const today = new Date();
                          const year = today.getFullYear();
                          const month = String(today.getMonth() + 1).padStart(2, '0');
                          const day = String(today.getDate()).padStart(2, '0');
                          return `${year}-${month}-${day}`;
                        })()}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                      />
                    </div>
                  </>
                )}

                {type === "task" && (
                  <>
                    {/* Status */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                      >
                        <option>Not started</option>
                        <option>In progress</option>
                        <option>Finished</option>
                      </select>
                    </div>

                    {/* Task Deadline */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Task Deadline
                      </label>
                      <input
                        type="date"
                        value={taskDeadline}
                        onChange={(e) => setTaskDeadline(e.target.value)}
                        min={(() => {
                          const today = new Date();
                          const year = today.getFullYear();
                          const month = String(today.getMonth() + 1).padStart(2, '0');
                          const day = String(today.getDate()).padStart(2, '0');
                          return `${year}-${month}-${day}`;
                        })()}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                      />
                    </div>

                    {/* Assign Members */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Users className="w-4 h-4 inline mr-1" />
                        Assign to Members
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search members..."
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                        />
                      </div>
                      <ul className="mt-2 border border-gray-200 rounded-lg max-h-48 overflow-auto">
                        {filteredUsers.length > 0 ? (
                          filteredUsers.map((user) => (
                            <li
                              key={user.id}
                              className={`px-4 py-3 cursor-pointer transition-colors flex items-center justify-between ${
                                members.includes(user.id) 
                                  ? "bg-indigo-50 hover:bg-indigo-100" 
                                  : "hover:bg-gray-50"
                              }`}
                              onClick={() => toggleMember(user.id)}
                            >
                              <span className="font-medium text-gray-900">{user.name}</span>
                              {members.includes(user.id) && (
                                <CheckCircle className="w-5 h-5 text-indigo-600" />
                              )}
                            </li>
                          ))
                        ) : (
                          <li className="px-4 py-3 text-gray-500 text-sm text-center">
                            No members found
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Selected Members */}
                    {members.length > 0 && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Selected Members ({members.length})
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {members.map(id => {
                            const user = teamMembers.find(u => u.id === id);
                            return (
                              <span 
                                key={id} 
                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium"
                              >
                                {user?.name || id}
                                <button
                                  onClick={() => toggleMember(id)}
                                  className="hover:text-indigo-900"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Footer Actions */}
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (type === "project") {
                        onSave({ name, description, deadline, tasks: [] });
                      } else {
                        onSave({ name, status, members, deadline: taskDeadline }); // members: user IDs
                      }
                    }}
                    className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    {type === "project" ? "Create Project" : "Add Task"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}