import React, { useEffect } from "react";

const Message = ({ message, onClose, type }) => {
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  const bgColor = type === "error" ? "bg-red-50" : "bg-green-50";
  const textColor = type === "error" ? "text-red-600" : "text-green-600";
  const buttonColor =
    type === "error"
      ? "text-red-400 hover:text-red-700"
      : "text-green-400 hover:text-green-700";

  return (
    <div
      dir="rtl"
      className={`
    ${bgColor} ${textColor}
    fixed top-4 left-1/2 transform -translate-x-1/2
    w-[calc(100%-2rem)] sm:w-1/2
    max-w-md
    p-2 rounded-lg
    flex items-center justify-between
    shadow-lg
    z-50
    animate-fade-in
    transition-all duration-300
  `}
    >
      <span
        className="flex-1 px-2 
 text-xs 
    xs:text-sm
    sm:text-base
    md:text-[15px]
    lg:text-base
    xl:text-[16px] 
  "
      >
        {message}
      </span>

      <button
        type="button"
        className={`
      ${buttonColor}
      font-bold
      text-lg 
      xs:text-xl
      sm:text-2xl
      leading-none
      focus:outline-none
      hover:opacity-80
      transition-opacity
    `}
        onClick={onClose}
        aria-label="close"
      >
        ×
      </button>
    </div>
  );
};

export default Message;
