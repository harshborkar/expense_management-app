// app/api/expenses/route.ts

import { NextResponse } from "next/server";
import db from "@/lib/db";

// Function to CREATE a new expense
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, currency, category, description, date, ownerId } = body;

    // In a real app, you get ownerId from the user's session
    const currentUserId = ownerId || "cmgbuy2ug0000c2y8wxmnhl9n"; // Use a REAL user ID from your DB

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
        ownerId: currentUserId,
      },
    });

    return NextResponse.json(newExpense, { status: 201 });
  } catch (error) {
    console.error("[EXPENSES_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// Function to GET all expenses
export async function GET() {
  try {
    const expenses = await db.expense.findMany({
      // Include the owner's name in the response
      include: {
        owner: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        date: "desc", // Show the newest expenses first
      },
    });
    return NextResponse.json(expenses);
  } catch (error) {
    console.error("[EXPENSES_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
