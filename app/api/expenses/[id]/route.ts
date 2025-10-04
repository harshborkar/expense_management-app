// app/api/expenses/[id]/route.ts

import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function PATCH(
  request: Request
  // We have removed the second 'context' argument to avoid the error
) {
  try {
    // New Method: Get the ID directly from the request URL
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop(); // Gets the last part of the URL path, which is the ID

    if (!id) {
      return new NextResponse("Expense ID not found in URL", { status: 400 });
    }

    const { status } = await request.json();

    if (!status || !["APPROVED", "REJECTED"].includes(status)) {
      return new NextResponse("Invalid status provided", { status: 400 });
    }

    const updatedExpense = await db.expense.update({
      where: { id: id }, // Use the ID we extracted from the URL
      data: { status },
    });

    return NextResponse.json(updatedExpense);
  } catch (error) {
    console.error("[EXPENSE_PATCH]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
