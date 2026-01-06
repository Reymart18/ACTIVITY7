import BurgerMenu from "./BurgerMenu"

export default function Sidebar({ isOpen, toggleSidebar, setActivePage, activePage }) {
  const menuItems = ["Dashboard", "Projects"]

  return (
    <aside
      className={`fixed top-0 left-0 h-full w-64 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white z-50 transform transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
    >
      {/* Sidebar header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-300 dark:border-gray-700">
        <span className="text-lg font-bold">Menu</span>
        <BurgerMenu onClick={toggleSidebar} isOpen={isOpen} />
      </div>

      {/* Menu items */}
      <ul className="flex flex-col mt-6 space-y-2 px-2">
        {menuItems.map((item) => (
          <li
            key={item}
            onClick={() => setActivePage(item)} // <-- set active page
            className={`p-3 cursor-pointer rounded-md transition-colors duration-200
              ${
                activePage === item
                  ? "bg-gray-300 dark:bg-gray-700 font-semibold"
                  : "hover:bg-gray-200 dark:hover:bg-gray-800"
              }`}
          >
            {item}
          </li>
        ))}
      </ul>
    </aside>
  )
}
