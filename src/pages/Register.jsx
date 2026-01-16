import { useState } from "react"
import axios from "axios"
import { Rocket, Sparkles, TrendingUp, Zap } from "lucide-react"

export default function Register({ onRegister }) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    try {
      await axios.post("http://localhost:3000/auth/register", {
        name,
        email,
        password,
      })

      // Do NOT auto-login: no token storage
      setSuccess("Registration successful! Please login to continue.")
      // Optionally reset form fields
      setName("")
      setEmail("")
      setPassword("")
      setConfirmPassword("")
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed")
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gradient-to-br from-white to-[#F3F0E7] p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h2 className="text-4xl font-bold text-[#2A2529] mb-2">Get Started</h2>
            <p className="text-gray-600">Create your account and boost your productivity</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2529] focus:border-transparent transition-all outline-none"
                required
              />
            </div>

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

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2A2529] focus:border-transparent transition-all outline-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#2A2529] text-white py-3 rounded-lg hover:bg-[#262E36] transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Create Account
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <span
                className="text-[#2A2529] font-semibold cursor-pointer hover:underline"
                onClick={() => onRegister("login")}
              >
                Sign In
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Image/Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#262E36] via-[#3d3538] to-[#2A2529] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE4YzAtMS4xLS45LTItMi0ycy0yIC45LTIgMiAuOSAyIDIgMiAyLS45IDItMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50"></div>
        
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-white">
          <div className="max-w-lg">
            <div className="mb-8">
              <Rocket className="w-20 h-20 mb-4 text-[#F3F0E7]" />
              <h1 className="text-5xl font-bold mb-4 leading-tight">Start Your Journey Today</h1>
              <p className="text-xl text-gray-300 mb-8">Join thousands of users managing their tasks effectively</p>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4 bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                <Zap className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-1">Instant Setup</h3>
                  <p className="text-gray-300 text-sm">Get started in seconds with our streamlined onboarding process</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                <Sparkles className="w-6 h-6 text-pink-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-1">Intuitive Interface</h3>
                  <p className="text-gray-300 text-sm">Beautiful design that makes task management a breeze</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-1">Boost Productivity</h3>
                  <p className="text-gray-300 text-sm">Achieve more with smart features and organized workflows</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}