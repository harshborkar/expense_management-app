// app/admin/page.tsx

"use client";

import React, { useState } from "react";

// --- (ICON for UI) ---
const XMarkIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-4 h-4"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

// --- UPDATED TYPE DEFINITIONS ---
type UserRole = "Admin" | "Manager" | "Employee";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  manager?: string;
}

interface Expense {
  id: string;
  employeeName: string;
  employeeId: string;
  date: string;
  amount: number;
  currency: string;
  category: "Travel" | "Food" | "Office Supplies" | "Other";
  description: string;
  status: "Pending" | "Approved" | "Rejected";
}

// Updated ApprovalRule type to match the new wireframe's complexity
interface RuleApprover {
  userId: string;
  name: string;
  isRequired: boolean;
}

interface ApprovalRule {
  id: string;
  name: string;
  isManagerApprover: boolean; // "Is manager an approver?"
  approvers: RuleApprover[];
  isSequential: boolean; // "Approvers Sequence"
  minimumApprovalPercentage: number | null; // Can be null if not used
}

// --- MOCK DATA ---
const mockUsers: User[] = [
  {
    id: "usr_1",
    name: "Alice Johnson (Admin)",
    email: "alice@company.com",
    role: "Admin",
  },
  {
    id: "usr_2",
    name: "Bob Williams (Manager)",
    email: "bob@company.com",
    role: "Manager",
    manager: "Alice Johnson",
  },
  {
    id: "usr_3",
    name: "Charlie Brown (Employee)",
    email: "charlie@company.com",
    role: "Employee",
    manager: "Bob Williams",
  },
  {
    id: "usr_4",
    name: "Diana Miller (Employee)",
    email: "diana@company.com",
    role: "Employee",
    manager: "Bob Williams",
  },
  {
    id: "usr_5",
    name: "John Smith (Finance)",
    email: "john@company.com",
    role: "Manager",
  },
  {
    id: "usr_6",
    name: "Mitchell Green (Director)",
    email: "mitchell@company.com",
    role: "Manager",
  },
  {
    id: "usr_7",
    name: "Andreas Wolfer (CFO)",
    email: "andreas@company.com",
    role: "Manager",
  },
];

const mockExpenses: Expense[] = [
  // ... (same as before) ...
];

// Updated mock data for the new rule structure
const mockRules: ApprovalRule[] = [
  {
    id: "rule_1",
    name: "Miscellaneous Expenses Over $100",
    isManagerApprover: true,
    approvers: [
      { userId: "usr_5", name: "John Smith (Finance)", isRequired: true },
    ],
    isSequential: true,
    minimumApprovalPercentage: null,
  },
  {
    id: "rule_2",
    name: "Project Team Approvals (Parallel)",
    isManagerApprover: false,
    approvers: [
      { userId: "usr_5", name: "John Smith (Finance)", isRequired: false },
      { userId: "usr_6", name: "Mitchell Green (Director)", isRequired: true },
      { userId: "usr_7", name: "Andreas Wolfer (CFO)", isRequired: false },
    ],
    isSequential: false,
    minimumApprovalPercentage: 60,
  },
];

// --- UI COMPONENTS ---
// NOTE: UserManagementTab and AllExpensesTab are unchanged from the previous version.
// I've included them here so you have the full, single file to copy.

const UserManagementTab = () => (
  <div>
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-2xl font-semibold text-white">User Management</h2>
      <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        + Add User
      </button>
    </div>
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <table className="min-w-full text-left text-sm text-gray-300">
        <thead className="bg-gray-900 text-xs uppercase">
          <tr>
            <th className="p-4">Name</th>
            <th className="p-4">Email</th>
            <th className="p-4">Role</th>
            <th className="p-4">Manager</th>
            <th className="p-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {mockUsers.map((user, index) => (
            <tr
              key={user.id}
              className={`border-t border-gray-700 ${
                index % 2 === 0 ? "bg-gray-800" : "bg-gray-850"
              }`}
            >
              <td className="p-4 font-medium text-white">{user.name}</td>
              <td className="p-4">{user.email}</td>
              <td className="p-4">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    user.role === "Admin"
                      ? "bg-red-500 text-white"
                      : user.role === "Manager"
                      ? "bg-yellow-500 text-black"
                      : "bg-green-500 text-black"
                  }`}
                >
                  {user.role}
                </span>
              </td>
              <td className="p-4">{user.manager || "N/A"}</td>
              <td className="p-4">
                <a href="#" className="text-blue-400 hover:underline">
                  Edit
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const AllExpensesTab = () => (
  <div>
    <h2 className="text-2xl font-semibold text-white mb-4">
      All Company Expenses
    </h2>
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <table className="min-w-full text-left text-sm text-gray-300">
        <thead className="bg-gray-900 text-xs uppercase">
          <tr>
            <th className="p-4">Employee</th>
            <th className="p-4">Date</th>
            <th className="p-4">Amount</th>
            <th className="p-4">Category</th>
            <th className="p-4">Status</th>
            <th className="p-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {mockExpenses.map((expense, index) => (
            <tr
              key={expense.id}
              className={`border-t border-gray-700 ${
                index % 2 === 0 ? "bg-gray-800" : "bg-gray-850"
              }`}
            >
              <td className="p-4 font-medium text-white">
                {expense.employeeName}
              </td>
              <td className="p-4">{expense.date}</td>
              <td className="p-4 font-mono">
                {expense.amount.toFixed(2)} {expense.currency}
              </td>
              <td className="p-4">{expense.category}</td>
              <td className="p-4">
                <span
                  className={`px-2 py-1 font-semibold text-xs rounded-full ${
                    expense.status === "Approved"
                      ? "bg-green-200 text-green-900"
                      : expense.status === "Rejected"
                      ? "bg-red-200 text-red-900"
                      : "bg-yellow-200 text-yellow-900"
                  }`}
                >
                  {expense.status}
                </span>
              </td>
              <td className="p-4">
                <a href="#" className="text-blue-400 hover:underline mr-4">
                  Details
                </a>
                {expense.status !== "Approved" && (
                  <a href="#" className="text-red-400 hover:underline">
                    Override
                  </a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// --- NEW Approval Rule Form Component ---
const ApprovalRuleForm = ({
  rule,
  onSave,
  onCancel,
}: {
  rule: ApprovalRule | null;
  onSave: (rule: ApprovalRule) => void;
  onCancel: () => void;
}) => {
  // Form state initialized with the rule being edited, or a blank slate for a new rule
  const [formData, setFormData] = useState<ApprovalRule>(
    rule || {
      id: `rule_${Date.now()}`,
      name: "",
      isManagerApprover: true,
      approvers: [],
      isSequential: true,
      minimumApprovalPercentage: null,
    }
  );

  const handleApproverChange = (
    index: number,
    key: keyof RuleApprover,
    value: any
  ) => {
    const newApprovers = [...formData.approvers];
    (newApprovers[index] as any)[key] = value;
    setFormData({ ...formData, approvers: newApprovers });
  };

  // TODO: In a real app, this would be a search dropdown.
  // For the hackathon, we'll just add a mock user.
  const addApprover = () => {
    const newUser: User | undefined = mockUsers.find((u) => u.id === "usr_7"); // Mock adding CFO
    if (newUser && !formData.approvers.find((a) => a.userId === newUser.id)) {
      setFormData({
        ...formData,
        approvers: [
          ...formData.approvers,
          { userId: newUser.id, name: newUser.name, isRequired: false },
        ],
      });
    }
  };

  const removeApprover = (userId: string) => {
    setFormData({
      ...formData,
      approvers: formData.approvers.filter((a) => a.userId !== userId),
    });
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-white">
      <h3 className="text-xl font-bold mb-6">
        {rule ? "Edit Approval Rule" : "Create New Approval Rule"}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column */}
        <div>
          <label
            htmlFor="ruleName"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            Description about rules
          </label>
          <input
            type="text"
            id="ruleName"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Approval rule for miscellaneous expenses"
            className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Approvers List */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-300">
                Approvers
              </label>
              <div className="flex items-center">
                <input
                  id="isManagerApprover"
                  type="checkbox"
                  className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500"
                  checked={formData.isManagerApprover}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      isManagerApprover: e.target.checked,
                    })
                  }
                />
                <label
                  htmlFor="isManagerApprover"
                  className="ml-2 text-sm text-gray-300"
                >
                  Is manager an approver?
                </label>
              </div>
            </div>

            <div className="space-y-2 p-3 bg-gray-900/50 rounded-md border border-gray-700">
              {formData.approvers.map((approver, index) => (
                <div
                  key={approver.userId}
                  className="flex items-center justify-between"
                >
                  <span className="text-gray-200">
                    {index + 1}. {approver.name}
                  </span>
                  <div className="flex items-center">
                    <input
                      id={`required-${index}`}
                      type="checkbox"
                      className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-blue-600"
                      checked={approver.isRequired}
                      onChange={(e) =>
                        handleApproverChange(
                          index,
                          "isRequired",
                          e.target.checked
                        )
                      }
                    />
                    <label
                      htmlFor={`required-${index}`}
                      className="ml-2 mr-4 text-sm text-gray-400"
                    >
                      Required
                    </label>
                    <button
                      onClick={() => removeApprover(approver.userId)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <XMarkIcon />
                    </button>
                  </div>
                </div>
              ))}
              {formData.approvers.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-2">
                  No additional approvers added.
                </p>
              )}
            </div>
            <button
              onClick={addApprover}
              className="text-blue-400 hover:text-blue-300 text-sm mt-2"
            >
              + Add Approver
            </button>
          </div>

          {/* Sequence & Percentage */}
          <div className="flex items-center">
            <input
              id="isSequential"
              type="checkbox"
              className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-blue-600"
              checked={formData.isSequential}
              onChange={(e) =>
                setFormData({ ...formData, isSequential: e.target.checked })
              }
            />
            <label
              htmlFor="isSequential"
              className="ml-2 text-sm text-gray-300"
            >
              Approvers Sequence Matters
            </label>
          </div>

          <div>
            <label
              htmlFor="percentage"
              className="block text-sm font-medium text-gray-300"
            >
              Minimum Approval Percentage
            </label>
            <div className="relative mt-1">
              <input
                type="number"
                id="percentage"
                placeholder="e.g., 60"
                value={formData.minimumApprovalPercentage || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    minimumApprovalPercentage: e.target.value
                      ? parseInt(e.target.value)
                      : null,
                  })
                }
                className="w-24 bg-gray-900 border border-gray-600 rounded-md p-2 pl-3 pr-6 text-center"
              />
              <span className="absolute inset-y-0 right-2 flex items-center text-gray-400">
                %
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 mt-8 pt-4 border-t border-gray-700">
        <button
          onClick={onCancel}
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(formData)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Save Rule
        </button>
      </div>
    </div>
  );
};

// --- REFACTORED Approval Rules Tab ---
const ApprovalRulesTab = () => {
  const [view, setView] = useState<"list" | "form">("list");
  const [rules, setRules] = useState<ApprovalRule[]>(mockRules);
  const [selectedRule, setSelectedRule] = useState<ApprovalRule | null>(null);

  const handleCreateNew = () => {
    setSelectedRule(null);
    setView("form");
  };

  const handleEdit = (rule: ApprovalRule) => {
    setSelectedRule(rule);
    setView("form");
  };

  const handleSave = (ruleToSave: ApprovalRule) => {
    // In a real app, you'd send this to your API
    // For now, we'll just update our local state
    const existingRuleIndex = rules.findIndex((r) => r.id === ruleToSave.id);
    if (existingRuleIndex > -1) {
      const updatedRules = [...rules];
      updatedRules[existingRuleIndex] = ruleToSave;
      setRules(updatedRules);
    } else {
      setRules([...rules, ruleToSave]);
    }
    setView("list");
  };

  const handleCancel = () => {
    setView("list");
    setSelectedRule(null);
  };

  if (view === "form") {
    return (
      <ApprovalRuleForm
        rule={selectedRule}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-white">
          Approval Workflows
        </h2>
        <button
          onClick={handleCreateNew}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          + Create New Rule
        </button>
      </div>
      <div className="space-y-4">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex justify-between items-start"
          >
            <div>
              <h3 className="text-lg font-bold text-white">{rule.name}</h3>
              <div className="mt-2 text-sm text-gray-400">
                {rule.isManagerApprover && (
                  <p>• Manager is the first approver.</p>
                )}
                <p>• {rule.approvers.length} additional approver(s).</p>
                <p>
                  • Approval is {rule.isSequential ? "Sequential" : "Parallel"}.
                </p>
                {rule.minimumApprovalPercentage && (
                  <p>• Requires {rule.minimumApprovalPercentage}% approval.</p>
                )}
              </div>
            </div>
            <button
              onClick={() => handleEdit(rule)}
              className="text-blue-400 hover:underline"
            >
              Edit
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- MAIN ADMIN PAGE COMPONENT (unchanged) ---
export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("rules"); // Default to 'rules' to show the new component

  const renderTabContent = () => {
    switch (activeTab) {
      case "users":
        return <UserManagementTab />;
      case "expenses":
        return <AllExpensesTab />;
      case "rules":
        return <ApprovalRulesTab />;
      default:
        return null;
    }
  };

  const TabButton = ({
    tabName,
    label,
  }: {
    tabName: string;
    label: string;
  }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`px-4 py-2 text-sm font-medium rounded-md ${
        activeTab === tabName
          ? "bg-blue-600 text-white"
          : "text-gray-300 hover:bg-gray-700"
      }`}
    >
      {label}
    </button>
  );

  return (
    <main className="bg-gray-900 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Admin Dashboard</h1>
        <div className="flex space-x-2 border-b border-gray-700 mb-6">
          <TabButton tabName="users" label="User Management" />
          <TabButton tabName="expenses" label="All Expenses" />
          <TabButton tabName="rules" label="Approval Rules" />
        </div>
        <div>{renderTabContent()}</div>
      </div>
    </main>
  );
}
