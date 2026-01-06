import { useState, useEffect } from "react"
import Header from "./components/layout/Header"
import Sidebar from "./components/layout/Sidebar"

// Pages
import DashboardPage from "./pages/DashboardPage"
import ProjectsPage from "./pages/ProjectsPage"
import Login from "./pages/Login"
import Register from "./pages/Register"

function App() {
  // Auth state
  const [user, setUser] = useState(null)
  const [page, setPage] = useState("login") // login | register | dashboard

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activePage, setActivePage] = useState("Dashboard")

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

  // Restore user from localStorage on app load
  useEffect(() => {
    const savedUser = localStorage.getItem("user")
    const token = localStorage.getItem("token")
    if (savedUser && token) {
      setUser(JSON.parse(savedUser))
      setPage("dashboard")
    }
  }, [])

  // Handle login
  const handleLogin = (loggedUser) => {
    if (loggedUser === "register") {
      setPage("register")
    } else {
      setUser(loggedUser)
      localStorage.setItem("user", JSON.stringify(loggedUser)) // save user
      setPage("dashboard")
    }
  }

  // Handle register
  const handleRegister = (newUser) => {
    if (newUser === "login") {
      setPage("login")
    } else {
      setUser(newUser)
      localStorage.setItem("user", JSON.stringify(newUser)) // save user
      setPage("dashboard")
    }
  }

  // Handle logout
  const handleLogout = () => {
    setUser(null)
    setPage("login")
    setSidebarOpen(false) // close sidebar on logout
    localStorage.removeItem("user")
    localStorage.removeItem("token")
  }

  // Render dashboard pages
  const renderPage = () => {
    switch (activePage) {
      case "Dashboard":
        return <DashboardPage />
      case "Projects":
        return <ProjectsPage />
      default:
        return <DashboardPage />
    }
  }

  // If not logged in
  if (!user) {
    return page === "login" ? (
      <Login onLogin={handleLogin} />
    ) : (
      <Register onRegister={handleRegister} />
    )
  }

  // Dashboard layout
  return (
    <div className="flex">
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        setActivePage={setActivePage}
        activePage={activePage}
      />
      <div className="flex-1 min-h-screen transition-all duration-300">
        <Header toggleMenu={toggleSidebar} menuOpen={sidebarOpen} onLogout={handleLogout} />
        <main className="pt-16 p-6">{renderPage()}</main>
      </div>
    </div>
  )
}

export default App
