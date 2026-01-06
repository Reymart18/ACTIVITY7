export default function BurgerMenu({ onClick, isOpen }) {
  return (
    <button
      className="flex flex-col justify-between w-8 h-6 p-1 focus:outline-none"
      onClick={onClick}
    >
      <span
        className={`block h-1 w-full bg-white rounded transition-transform duration-300 ${
          isOpen ? "rotate-45 translate-y-2" : ""
        }`}
      ></span>
      <span
        className={`block h-1 w-full bg-white rounded transition-opacity duration-300 ${
          isOpen ? "opacity-0" : "opacity-100"
        }`}
      ></span>
      <span
        className={`block h-1 w-full bg-white rounded transition-transform duration-300 ${
          isOpen ? "-rotate-45 -translate-y-2" : ""
        }`}
      ></span>
    </button>
  )
}
