// app/api/expenses/route.ts

import { NextResponse } from "next/server";
import db from "@/lib/db";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// This function securely gets the logged-in user on the server
async function getSupabaseUser() {
  // The fix is to 'await' the cookies() function call
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

// Function to CREATE a new expense
export async function POST(request: Request) {
  try {
    const user = await getSupabaseUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { amount, currency, category, description, date } = body;

    if (!amount || !category || !description || !date) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const newExpense = await db.expense.create({
      data: {
        amount: parseFloat(amount),
        currency,
        category,
        description,
        date: new Date(date),
        ownerId: user.id, // Use the REAL user ID from the session
      },
    });

    return NextResponse.json(newExpense, { status: 201 });
  } catch (error) {
    console.error("[EXPENSES_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// Function to GET expenses
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId"); // Check for a userId in the URL

    const expenses = await db.expense.findMany({
      // If a userId is provided, filter expenses for that user.
      // Otherwise, return all expenses (for admin/manager views).
      where: userId ? { ownerId: userId } : {},
      include: {
        owner: {
          select: { name: true },
        },
      },
      orderBy: {
        date: "desc",
      },
    });
    return NextResponse.json(expenses);
  } catch (error) {
    console.error("[EXPENSES_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
