export default function BurgerMenu({ onClick, isOpen }) {
  return (
    <button
      className="flex flex-col justify-between w-8 h-6 p-1 focus:outline-none"
      onClick={onClick}
    >
      <span
        className={`block h-1 w-full rounded transition-transform duration-900 ${
          isOpen ? "rotate-45 translate-y-2 bg-black" : "bg-white"
        }`}
      ></span>
      <span
        className={`block h-1 w-full rounded transition-opacity duration-300 ${
          isOpen ? "opacity-0 bg-black" : "opacity-100 bg-white"
        }`}
      ></span>
      <span
        className={`block h-1 w-full rounded transition-transform duration-900 ${
          isOpen ? "-rotate-45 -translate-y-2 bg-black" : "bg-white"
        }`}
      ></span>
    </button>
  )
}
