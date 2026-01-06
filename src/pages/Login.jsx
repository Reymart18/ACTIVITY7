import { useState } from "react"
import axios from "axios"

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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#1A1A1A] to-[#BEBEBF]">
      <div className="bg-white/20 backdrop-blur-md p-8 rounded-lg shadow-lg border border-[#F8F8F8] w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-2 border rounded-md w-full"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-2 border rounded-md w-full"
            required
          />
          <button
            type="submit"
            className="bg-[#394142] text-white px-4 py-2 rounded-md hover:bg-[#2f3637] transition-colors"
          >
            Login
          </button>
        </form>

        <p className="mt-4 text-center text-gray-600">
          Don’t have an account?{" "}
          <span
            className="text-blue-600 cursor-pointer hover:underline"
            onClick={() => onLogin("register")}
          >
            Register
          </span>
        </p>
      </div>
    </div>
  )
}
