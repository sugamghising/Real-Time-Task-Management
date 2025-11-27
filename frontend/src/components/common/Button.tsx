import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  fullWidth = false,
  className = "",
  ...props
}) => {
  const baseStyles =
    "px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary:
      "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-400",
  };

  const widthStyles = fullWidth ? "w-full" : "";

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${widthStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
