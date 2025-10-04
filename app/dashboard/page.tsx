// app/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button"; // Assuming you have this component

// Define a type for your expense data for better code quality
type Expense = {
  id?: string;
  employee?: string;
  description: string;
  date: string;
  category: string;
  paidBy: string;
  remarks: string;
  amount: number | string;
  currency: string;
  status?: string;
};

export default function EmployeeDashboard() {
  // This state will now hold data fetched from the database
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true); // To show a loading message

  const [formData, setFormData] = useState({
    description: "",
    category: "",
    date: "",
    paidBy: "",
    remarks: "",
    amount: "",
    currency: "INR",
  });

  const [showExpenseSection, setShowExpenseSection] = useState(false);

  // --- DATA FETCHING ---
  // This function fetches all expenses from your database
  const fetchExpenses = async () => {
    try {
      setIsLoading(true);
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

  // useEffect hook runs this function once when the component loads
  useEffect(() => {
    fetchExpenses();
  }, []);

  // --- FORM HANDLING ---
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // This is the new handleSubmit function that sends data to the backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { description, date, category, paidBy, amount } = formData;
    if (!description || !date || !category || !paidBy || !amount) {
      alert("Please fill all required fields before submitting!");
      return;
    }

    // You can keep your other date validations here...

    try {
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount), // Ensure amount is a number
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit expense.");
      }

      alert("Expense submitted successfully!");
      // Clear the form
      setFormData({
        description: "",
        category: "",
        date: "",
        paidBy: "",
        remarks: "",
        amount: "",
        currency: "INR",
      });
      // Refresh the expense list to show the new entry
      fetchExpenses();
    } catch (error) {
      console.error("Submission Error:", error);
      alert("There was an error submitting your expense.");
    }
  };

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-gray-100 space-y-10">
      {/* ========== Upload New Expense Form ========== */}
      <section className="bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-gray-100 mb-4 border-b border-gray-700 pb-2">
          Upload New Expense
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
            <input
              name="paidBy"
              placeholder="Paid By"
              value={formData.paidBy}
              onChange={handleChange}
              className="border border-gray-700 bg-gray-900 text-gray-200 p-2 rounded"
            />
            <input
              name="remarks"
              placeholder="Remarks"
              value={formData.remarks}
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

      {/* Toggle Button */}
      <div className="text-center">
        <Button
          onClick={() => setShowExpenseSection(!showExpenseSection)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {showExpenseSection ? "Hide Expense Table" : "Show Expense Table"}
        </Button>
      </div>

      {/* Conditionally Shown Table Section */}
      {showExpenseSection && (
        <section>
          {isLoading ? (
            <p className="text-center text-gray-400">Loading expenses...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-700 rounded-lg overflow-hidden">
                <thead className="bg-gray-800 text-gray-300 text-sm">
                  <tr>
                    {[
                      "Description",
                      "Date",
                      "Category",
                      "Amount",
                      "Currency",
                      "Status",
                    ].map((head) => (
                      <th key={head} className="p-2 border border-gray-700">
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-gray-200">
                  {expenses.map((exp) => (
                    <tr key={exp.id} className="text-center hover:bg-gray-800">
                      <td className="p-2 border border-gray-700">
                        {exp.description}
                      </td>
                      <td className="p-2 border border-gray-700">
                        {new Date(exp.date).toLocaleDateString()}
                      </td>
                      <td className="p-2 border border-gray-700">
                        {exp.category}
                      </td>
                      <td className="p-2 border border-gray-700">
                        {exp.amount}
                      </td>
                      <td className="p-2 border border-gray-700">
                        {exp.currency}
                      </td>
                      <td
                        className={`p-2 border border-gray-700 font-semibold ${
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
      )}
    </div>
  );
}
