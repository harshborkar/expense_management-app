// app/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

// This type matches the data structure from your API
type Expense = {
  id: string;
  description: string;
  date: string;
  amount: number;
  currency: string;
  category: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  owner?: {
    name: string;
  };
};

export default function EmployeeDashboard() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    description: "",
    category: "",
    date: "",
    amount: "",
    currency: "INR",
    // Removed paidBy and remarks to match the database schema
  });

  // --- DATA FETCHING ---
  const fetchExpenses = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/expenses");
      if (!response.ok) {
        throw new Error("Failed to fetch expenses.");
      }
      const data = await response.json();
      setExpenses(data);
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- USER AUTHENTICATION CHECK ---
  useEffect(() => {
    const checkUserAndFetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        // If no user is logged in, redirect to the login page
        router.push("/login");
      } else {
        // If user is logged in, fetch the expenses
        fetchExpenses();
      }
    };
    checkUserAndFetchData();
  }, [router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- FORM SUBMISSION ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.description ||
      !formData.date ||
      !formData.category ||
      !formData.amount
    ) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount), // Convert amount to a number
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit expense.");
      }

      alert("Expense submitted successfully!");
      setFormData({
        description: "",
        category: "",
        date: "",
        amount: "",
        currency: "INR",
      });
      fetchExpenses(); // Refresh the expense list to show the new entry
    } catch (error) {
      console.error("Submission Error:", error);
      alert("There was an error submitting your expense.");
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gray-900 min-h-screen text-gray-100 space-y-10">
      <section className="bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">
          Submit a New Expense
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleChange}
              className="border border-gray-700 bg-gray-900 text-gray-200 p-2 rounded"
            />
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="border border-gray-700 bg-gray-900 text-gray-200 p-2 rounded"
            />
            <input
              name="category"
              placeholder="Category"
              value={formData.category}
              onChange={handleChange}
              className="border border-gray-700 bg-gray-900 text-gray-200 p-2 rounded"
            />
            <div className="flex gap-2">
              <input
                type="number"
                name="amount"
                placeholder="Amount"
                value={formData.amount}
                onChange={handleChange}
                className="border border-gray-700 bg-gray-900 text-gray-200 p-2 rounded w-full"
              />
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="border border-gray-700 bg-gray-900 text-gray-200 p-2 rounded"
              >
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>
          <Button
            type="submit"
            className="mt-2 bg-green-600 hover:bg-green-700"
          >
            Add Expense
          </Button>
        </form>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-bold text-white">All Company Expenses</h2>
        {isLoading ? (
          <p className="text-center text-gray-400">Loading expenses...</p>
        ) : (
          <div className="overflow-x-auto bg-gray-800 rounded-lg">
            <table className="w-full text-sm text-left text-gray-300">
              <thead className="text-xs text-gray-400 uppercase bg-gray-900">
                <tr>
                  <th className="px-6 py-3">Owner</th>
                  <th className="px-6 py-3">Description</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp) => (
                  <tr
                    key={exp.id}
                    className="border-b border-gray-700 hover:bg-gray-700/50"
                  >
                    <td className="px-6 py-4 font-medium text-white">
                      {exp.owner?.name || "Unknown"}
                    </td>
                    <td className="px-6 py-4">{exp.description}</td>
                    <td className="px-6 py-4">
                      {new Date(exp.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-mono">
                      {exp.amount.toLocaleString(undefined, {
                        style: "currency",
                        currency: exp.currency,
                      })}
                    </td>
                    <td
                      className={`px-6 py-4 font-semibold ${
                        exp.status === "APPROVED"
                          ? "text-green-400"
                          : exp.status === "REJECTED"
                          ? "text-red-400"
                          : "text-yellow-400"
                      }`}
                    >
                      {exp.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
