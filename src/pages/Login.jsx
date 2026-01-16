import { useState } from "react"
import axios from "axios"
import { CheckCircle2, ListTodo, Target, Users } from "lucide-react"

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    try {
      const res = await axios.post("http://localhost:3000/auth/login", {
        email,
        password,
      })

      const { user, token } = res.data
      localStorage.setItem("token", token) // save JWT token
      onLogin(user)
    } catch (err) {
      setError(err.response?.data?.message || "Login failed")
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Image/Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#2A2529] via-[#3d3538] to-[#262E36] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE4YzAtMS4xLS45LTItMi0ycy0yIC45LTIgMiAuOSAyIDIgMiAyLS45IDItMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50"></div>
        
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-white">
          <div className="max-w-lg">
            <div className="mb-8">
              <ListTodo className="w-20 h-20 mb-4 text-[#F3F0E7]" />
              <h1 className="text-5xl font-bold mb-4 leading-tight">Task Management Made Simple</h1>
              <p className="text-xl text-gray-300 mb-8">Organize, track, and complete your projects efficiently</p>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4 bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-1">Track Progress</h3>
                  <p className="text-gray-300 text-sm">Monitor your tasks and projects in real-time with intuitive dashboards</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                <Target className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-1">Set Goals</h3>
                  <p className="text-gray-300 text-sm">Define clear objectives and milestones for every project</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                <Users className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-1">Collaborate</h3>
                  <p className="text-gray-300 text-sm">Work together seamlessly with your team members</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gradient-to-br from-[#F3F0E7] to-white p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h2 className="text-4xl font-bold text-[#2A2529] mb-2">Welcome</h2>
            <p className="text-gray-600">Sign in to continue to your dashboard</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2529] focus:border-transparent transition-all outline-none"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2529] focus:border-transparent transition-all outline-none"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#2A2529] text-white py-3 rounded-lg hover:bg-[#262E36] transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Sign In
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <span
                className="text-[#2A2529] font-semibold cursor-pointer hover:underline"
                onClick={() => onLogin("register")}
              >
                Create Account
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
