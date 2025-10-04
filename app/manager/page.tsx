// app/manager/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";

// Updated type to include the calculated displayAmount
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
  displayAmount?: number;
};

export default function ManagerPage() {
  // State for raw expenses from your database
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // States for currency conversion
  const [rates, setRates] = useState<{ [key: string]: number } | null>(null);
  const [baseCurrency, setBaseCurrency] = useState<string>("INR");
  const [currencyList, setCurrencyList] = useState<string[]>([]);

  // useEffect now fetches ALL data needed for the page on initial load
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const [expensesResponse, ratesResponse, currenciesResponse] =
          await Promise.all([
            fetch("/api/expenses"), // Fetch expenses from your database
            fetch("https://api.exchangerate-api.com/v4/latest/USD"), // Fetch conversion rates
            fetch("https://restcountries.com/v3.1/all?fields=currencies"), // Fetch list of all currencies
          ]);

        if (!expensesResponse.ok) throw new Error("Failed to fetch expenses.");
        if (!ratesResponse.ok)
          throw new Error("Failed to fetch conversion rates.");
        if (!currenciesResponse.ok)
          throw new Error("Failed to fetch currency list.");

        // Process and set expenses from your database
        const allExpenses: Expense[] = await expensesResponse.json();
        setExpenses(allExpenses.filter((exp) => exp.status === "PENDING"));

        // Process and set conversion rates
        const ratesData = await ratesResponse.json();
        setRates(ratesData.rates);

        // Process and set the full currency list for the dropdown
        const currenciesData = await currenciesResponse.json();
        const currencySet = new Set<string>();
        currenciesData.forEach((country: { currencies: object }) => {
          if (country.currencies) {
            Object.keys(country.currencies).forEach((code) =>
              currencySet.add(code)
            );
          }
        });
        setCurrencyList(Array.from(currencySet).sort());
      } catch (err: any) {
        setError(err.message);
        console.error("Fetch Error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // useMemo re-calculates the display amounts whenever the base currency or data changes
  const processedExpenses = useMemo(() => {
    if (!rates) return expenses;
    const targetRate = rates[baseCurrency];
    if (!targetRate) return expenses;

    return expenses.map((exp) => {
      const originalToUsdRate = rates[exp.currency] || 1;
      const amountInUsd = exp.amount / originalToUsdRate;
      const displayAmount = amountInUsd * targetRate;
      return { ...exp, displayAmount };
    });
  }, [expenses, rates, baseCurrency]);

  // --- ACTION HANDLERS (Unchanged) ---
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
      if (!response.ok) throw new Error("Failed to update status.");
      setExpenses((currentExpenses) =>
        currentExpenses.filter((exp) => exp.id !== expenseId)
      );
    } catch (err) {
      console.error("Update Error:", err);
      alert("Failed to update expense status.");
    }
  };

  if (isLoading) {
    /* ... loading spinner ... */
  }
  if (error) {
    /* ... error message ... */
  }

  return (
    <main className="bg-gray-900 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">
          Manager Dashboard
        </h1>
        <div className="bg-gray-800 rounded-xl border border-gray-700">
          <div className="p-4 border-b border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <h2 className="text-xl font-semibold text-white mb-2 sm:mb-0">
              Approvals to review
            </h2>
            <div className="flex items-center space-x-2">
              <label
                htmlFor="currency-select"
                className="text-sm text-gray-400"
              >
                View totals in:
              </label>
              <select
                id="currency-select"
                value={baseCurrency}
                onChange={(e) => setBaseCurrency(e.target.value)}
                className="bg-gray-900 border border-gray-600 rounded-md p-2 text-white"
              >
                {currencyList.map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-gray-300">
              <thead className="text-xs text-gray-400 uppercase">
                <tr>
                  <th className="p-4">Request Owner</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Total Amount (in {baseCurrency})</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {processedExpenses.length > 0 ? (
                  processedExpenses.map((expense) => (
                    <tr
                      key={expense.id}
                      className="border-t border-gray-700 hover:bg-gray-700/50"
                    >
                      <td className="p-4 font-medium text-white">
                        {expense.owner.name}
                      </td>
                      <td className="p-4">{expense.description}</td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-mono font-bold text-white">
                            {expense.displayAmount?.toLocaleString(undefined, {
                              style: "currency",
                              currency: baseCurrency,
                            })}
                          </span>
                          <span className="text-xs text-gray-400 font-mono">
                            ({expense.amount} {expense.currency})
                          </span>
                        </div>
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
                    <td colSpan={4} className="text-center p-8 text-gray-500">
                      No pending approvals. 🎉
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
