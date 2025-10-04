// app/manager/page.tsx
"use client";

import React, { useState, useEffect } from "react";

// Define a type for your expense data
type Expense = {
  id: string;
  description: string;
  date: string;
  amount: number;
  currency: string;
  category: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  owner: {
    name: string;
  };
};

export default function ManagerPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- DATA FETCHING ---
  const fetchPendingExpenses = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/expenses"); // Fetches all expenses
      if (!response.ok) {
        throw new Error("Failed to fetch expenses.");
      }
      const allExpenses: Expense[] = await response.json();
      // On the manager page, we only care about PENDING expenses
      setExpenses(allExpenses.filter((exp) => exp.status === "PENDING"));
    } catch (err: any) {
      setError(err.message);
      console.error("Fetch Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingExpenses();
  }, []);

  // --- ACTION HANDLERS ---
  const handleApproval = async (
    expenseId: string,
    newStatus: "APPROVED" | "REJECTED"
  ) => {
    try {
      const response = await fetch(`/api/expenses/${expenseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status.");
      }

      // Remove the approved/rejected item from the list for an instant UI update
      setExpenses((currentExpenses) =>
        currentExpenses.filter((exp) => exp.id !== expenseId)
      );
    } catch (err) {
      console.error("Update Error:", err);
      alert("Failed to update expense status.");
    }
  };

  const getStatusChipClass = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-500/20 text-green-300";
      case "REJECTED":
        return "bg-red-500/20 text-red-300";
      default:
        return "bg-yellow-500/20 text-yellow-300";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
        Loading approvals...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-red-400">
        Error: {error}
      </div>
    );
  }

  return (
    <main className="bg-gray-900 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">
          Manager Dashboard
        </h1>
        <div className="bg-gray-800 rounded-xl border border-gray-700">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white">
              Approvals to review
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-gray-300">
              <thead className="text-xs text-gray-400 uppercase">
                <tr>
                  <th className="p-4">Request Owner</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.length > 0 ? (
                  expenses.map((expense) => (
                    <tr
                      key={expense.id}
                      className="border-t border-gray-700 hover:bg-gray-700/50"
                    >
                      <td className="p-4 font-medium text-white">
                        {expense.owner.name}
                      </td>
                      <td className="p-4">{expense.description}</td>
                      <td className="p-4">
                        {new Date(expense.date).toLocaleDateString()}
                      </td>
                      <td className="p-4 font-mono">
                        {expense.amount.toFixed(2)} {expense.currency}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusChipClass(
                            expense.status
                          )}`}
                        >
                          {expense.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center items-center space-x-2">
                          <button
                            onClick={() =>
                              handleApproval(expense.id, "APPROVED")
                            }
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              handleApproval(expense.id, "REJECTED")
                            }
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="border-t border-gray-700">
                    <td colSpan={6} className="text-center p-8 text-gray-500">
                      No pending approvals. Great job! 🎉
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
