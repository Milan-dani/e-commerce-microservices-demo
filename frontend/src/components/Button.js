// src/components/Button.js
"use client";

import { motion } from "framer-motion";

const base =
  "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed";
const variants = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
  secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-300",
  ghost: "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-300",
  danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  // Fixed outline variants
  "primary-outline":
    "border border-blue-600 text-blue-600 bg-transparent hover:bg-blue-600 hover:text-white focus:ring-blue-500",
  "secondary-outline":
    "border border-gray-300 text-gray-800 bg-transparent hover:bg-gray-100 focus:ring-gray-300",
  "ghost-outline":
    "border border-gray-300 text-gray-700 bg-transparent hover:bg-gray-100 focus:ring-gray-300",
  "danger-outline":
    "border border-red-600 text-red-600 bg-transparent hover:bg-red-500 hover:text-white focus:ring-red-500",
};
const sizes = {
  sm: "h-9 px-3 text-sm gap-2",
  md: "h-10 px-4 text-sm gap-2.5",
  lg: "h-11 px-5 text-base gap-3",
};

export default function Button({
  children,
  icon: Icon, // pass an icon component (e.g., from lucide-react)
  iconPosition = "left", // 'left' | 'right'
  variant = "primary", // 'primary' | 'secondary' | 'ghost' | 'danger'
  size = "md", // 'sm' | 'md' | 'lg'
  isLoading = false,
  className = "",
  as = "button",
  ...props
}) {
  const Comp = as;
  const classes = [base, variants[variant], sizes[size], className].join(" ");

  const content = (
    <>
      {Icon && iconPosition === "left" && <Icon className="w-4 h-4 shrink-0" />}
      {children && <span className="truncate">{children}</span>}
      {Icon && iconPosition === "right" && (
        <Icon className="w-4 h-4 shrink-0" />
      )}
    </>
  );

  return (
    <motion.div whileHover={{ scale: 0.99 }} whileTap={{ scale: 0.98 }}>
      <Comp
        className={classes}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            <span>Loading...</span>
          </span>
        ) : (
          content
        )}
      </Comp>
    </motion.div>
  );
}

// example usage

// <Button icon={ShoppingCart} iconPosition="left" variant="primary" size="md">Add to Cart</Button>
// <Button variant="secondary" icon={Heart} iconPosition="right">
//Wishlist </Button>

// <Button variant="ghost" size="sm">
// Text Only </Button>

// <Button variant="danger" size="lg" isLoading>
// Remove </Button>

{/* <Button icon={Trash2} variant="danger-outline"></Button>
<Button icon={Trash2} variant="ghost-outline"></Button>
<Button icon={Trash2} variant="primary-outline"></Button>
<Button icon={Trash2} variant="secondary-outline"></Button> */}