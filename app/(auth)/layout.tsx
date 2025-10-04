// app/(auth)/layout.tsx

import React from "react";

// All layout components must accept a "children" prop
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // They must also render that "children" prop
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      {children}
    </div>
  );
}
