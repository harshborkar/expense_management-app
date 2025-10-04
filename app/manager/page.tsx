// app/manager/page.tsx

"use client";

import React, { useState, useEffect, useMemo } from "react";

// --- TYPE DEFINITIONS ---
interface ExpenseData {
  id: string;
  approvalSubject: string;
  requestOwner: string;
  category: "Travel" | "Food" | "Office Supplies" | "Other";
  status: "Pending" | "Approved" | "Rejected";
  originalAmount: number;
  originalCurrency: "USD" | "EUR" | "GBP";
  // This will hold the final calculated amount in the selected base currency
  displayAmount?: number;
}

// --- MOCK DATA (from your backend, without converted amounts) ---
const mockBackendExpenses: ExpenseData[] = [
  {
    id: "exp_101",
    approvalSubject: "Client Dinner Q4",
    requestOwner: "Sarah",
    category: "Food",
    status: "Pending",
    originalAmount: 567,
    originalCurrency: "USD",
  },
  {
    id: "exp_205",
    approvalSubject: "Flight to Singapore",
    requestOwner: "Charlie Brown",
    category: "Travel",
    status: "Pending",
    originalAmount: 1200,
    originalCurrency: "USD",
  },
  {
    id: "exp_310",
    approvalSubject: "New Office Monitors",
    requestOwner: "Diana Miller",
    category: "Office Supplies",
    status: "Pending",
    originalAmount: 450,
    originalCurrency: "EUR",
  },
];

// --- MANAGER PAGE COMPONENT ---
export default function ManagerPage() {
  // State for the raw expenses, loading status, and errors
  const [originalExpenses] = useState<ExpenseData[]>(mockBackendExpenses);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for currency selection and conversion rates
  const [currencyList, setCurrencyList] = useState<string[]>([]);
  const [baseCurrency, setBaseCurrency] = useState<string>("INR"); // Default to INR
  const [rates, setRates] = useState<{ [key: string]: number } | null>(null);

  // This derived state will hold the expenses with calculated amounts
  const processedExpenses = useMemo(() => {
    if (!rates) return [];

    const targetRate = rates[baseCurrency];
    if (!targetRate) return []; // Return empty if the selected currency isn't in our rates list

    return originalExpenses.map((exp) => {
      // Convert original amount to USD first (our standard base for rates)
      const originalToUsdRate = rates[exp.originalCurrency] || 1;
      const amountInUsd = exp.originalAmount / originalToUsdRate;

      // Now convert the USD amount to the selected base currency
      const displayAmount = amountInUsd * targetRate;

      return { ...exp, displayAmount };
    });
  }, [baseCurrency, rates, originalExpenses]);

  // useEffect to fetch initial data: currency list and exchange rates
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        // Fetch both APIs in parallel for better performance
        const [ratesResponse, currenciesResponse] = await Promise.all([
          fetch("https://api.exchangerate-api.com/v4/latest/USD"),
          fetch("https://restcountries.com/v3.1/all?fields=currencies"),
        ]);

        if (!ratesResponse.ok)
          throw new Error("Failed to fetch conversion rates.");
        if (!currenciesResponse.ok)
          throw new Error("Failed to fetch currency list.");

        // Process exchange rates
        const ratesData = await ratesResponse.json();
        setRates(ratesData.rates);

        // Process and flatten the currency list
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
        console.error("API Error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []); // Runs only once on component mount

  // --- Action Handlers ---
  const [expenseStatuses, setExpenseStatuses] = useState<
    Record<string, "Pending" | "Approved" | "Rejected">
  >({});

  const handleApprove = (expenseId: string) => {
    setExpenseStatuses((prev) => ({ ...prev, [expenseId]: "Approved" }));
  };
  const handleReject = (expenseId: string) => {
    setExpenseStatuses((prev) => ({ ...prev, [expenseId]: "Rejected" }));
  };

  const getStatus = (expenseId: string) =>
    expenseStatuses[expenseId] || "Pending";

  const getStatusChipClass = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-500/20 text-green-300";
      case "Rejected":
        return "bg-red-500/20 text-red-300";
      default:
        return "bg-yellow-500/20 text-yellow-300";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
        Loading approvals and rates...
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
          {/* Header with Currency Selector */}
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
                className="bg-gray-900 border border-gray-600 rounded-md p-2 text-white focus:ring-blue-500 focus:border-blue-500"
              >
                {currencyList.map((currencyCode) => (
                  <option key={currencyCode} value={currencyCode}>
                    {currencyCode}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-gray-300">
              <thead className="text-xs text-gray-400 uppercase">
                <tr>
                  <th className="p-4">Approval Subject</th>
                  <th className="p-4">Request Owner</th>
                  <th className="p-4">Request Status</th>
                  <th className="p-4">Total amount (in {baseCurrency})</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {processedExpenses.map((expense) => {
                  const status = getStatus(expense.id);
                  return (
                    <tr
                      key={expense.id}
                      className="border-t border-gray-700 hover:bg-gray-700/50"
                    >
                      <td className="p-4 font-medium text-white">
                        {expense.approvalSubject}
                      </td>
                      <td className="p-4">{expense.requestOwner}</td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusChipClass(
                            status
                          )}`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-mono font-bold text-white">
                            {expense.displayAmount?.toLocaleString(undefined, {
                              style: "currency",
                              currency: baseCurrency,
                            })}
                          </span>
                          <span className="text-xs text-gray-400 font-mono">
                            ({expense.originalAmount} {expense.originalCurrency}
                            )
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        {status === "Pending" && (
                          <div className="flex justify-center items-center space-x-2">
                            <button
                              onClick={() => handleApprove(expense.id)}
                              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(expense.id)}
                              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
