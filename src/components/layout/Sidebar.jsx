import BurgerMenu from "./BurgerMenu"

export default function Sidebar({ isOpen, toggleSidebar, setActivePage, activePage }) {
  const menuItems = ["Dashboard", "Projects"]

  return (
    <aside
  className={`fixed top-0 left-0 h-full w-64 bg-[#E2E2DE] border-r-2 border-[#2A2529] text-gray-600 z-50 transform transition-transform duration-800
  ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
  style={{ borderBottomRightRadius: "200px" }} // <-- adjust here
>
      {/* Sidebar header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-300 dark:border-gray-700 text-[#2A2529]">
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
                  ? "bg-[#2A2529] font-semibold"
                  : "hover:bg-[#2A2529]"
              }`}
          >
            {item}
          </li>
        ))}
      </ul>
    </aside>
  )
}
