// components/ui/Button.tsx
import React from "react";

// Define the props the button can accept, including all standard button attributes
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

// Create the Button component
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <button
        // Combine default styles with any custom classes passed in
        className={`inline-flex items-center justify-center rounded-md text-sm font-medium text-white transition-colors focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none px-4 py-2 ${className}`}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
