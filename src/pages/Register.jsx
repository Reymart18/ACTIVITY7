import { useState } from "react"
import axios from "axios"

export default function Register({ onRegister }) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    try {
      const res = await axios.post("http://localhost:3000/auth/register", {
        name,
        email,
        password,
      })

      const { user, token } = res.data
      localStorage.setItem("token", token)
      onRegister(user)
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed")
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#2A2529] to-[#F3F0E7]">
      <div className="bg-white/20 backdrop-blur-md p-8 rounded-lg shadow-lg border-solid border-3 border-[#262424] w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="p-2 border rounded-md w-full"
            required
          />
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
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="p-2 border rounded-md w-full"
            required
          />

          <button
            type="submit"
            className="bg-[#2A2529] text-white px-4 py-2 rounded-md hover:bg-[#262E36] transition-colors"
          >
            Register
          </button>
        </form>

        <p className="mt-4 text-center text-gray-600">
          Already have an account?{" "}
          <span
            className="text-gray-900 cursor-pointer hover:underline"
            onClick={() => onRegister("login")}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  )
}
