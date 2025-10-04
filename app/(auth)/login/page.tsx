// app/(auth)/login/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase"; // Import the Supabase client

export default function AuthPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  // --- UPDATED handleSubmit with Supabase Auth ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    const { name, email, password } = formData;

    try {
      if (isRegister) {
        // --- Supabase Registration ---
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            // You can store extra user data like 'name' here
            data: { name },
          },
        });
        if (error) throw error;
        setSuccess(
          "Registration successful! Check your email for a confirmation link."
        );
        setIsRegister(false);
      } else {
        // --- Supabase Login ---
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/dashboard"); // Redirect on successful login
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  // The rest of your component's JSX remains the same...
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-100">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">
          {isRegister ? "Create an Account" : "Login to Continue"}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ... all your input fields ... */}
          {isRegister && (
            <div>
              <label className="block text-sm text-gray-300 mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                className="w-full px-3 py-2 rounded bg-gray-700 text-gray-200 border border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          )}
          <div>
            <label className="block text-sm text-gray-300 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full px-3 py-2 rounded bg-gray-700 text-gray-200 border border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full px-3 py-2 rounded bg-gray-700 text-gray-200 border border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          {error && (
            <p className="text-red-400 text-sm text-center bg-red-900/50 py-2 rounded">
              {error}
            </p>
          )}
          {success && (
            <p className="text-green-400 text-sm text-center bg-green-900/50 py-2 rounded">
              {success}
            </p>
          )}
          <Button
            type="submit"
            disabled={isLoading}
            className={`w-full ${
              isRegister
                ? "bg-green-600 hover:bg-green-700"
                : "bg-blue-600 hover:bg-blue-700"
            } disabled:bg-gray-500`}
          >
            {isLoading ? "Processing..." : isRegister ? "Register" : "Login"}
          </Button>
        </form>
        <p className="text-gray-400 text-sm text-center mt-4">
          {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError("");
              setSuccess("");
              setFormData({ name: "", email: "", password: "" });
            }}
            className="text-blue-400 hover:underline"
          >
            {isRegister ? "Login" : "Register"}
          </button>
        </p>
      </div>
    </div>
  );
}
