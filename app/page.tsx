// app/page.tsx

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-24">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white sm:text-6xl">
          Expense Management
        </h1>
        <p className="mt-4 text-lg text-gray-400">A Hackathon Project</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/admin"
          className="rounded-md bg-blue-600 px-6 py-3 text-center font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          Admin Dashboard
        </Link>
        <Link
          href="/manager"
          className="rounded-md bg-indigo-600 px-6 py-3 text-center font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Manager Dashboard
        </Link>
      </div>
    </main>
  );
}
