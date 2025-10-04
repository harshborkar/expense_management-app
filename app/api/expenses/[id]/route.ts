// app/api/expenses/[id]/route.ts

import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function PATCH(
  request: Request,
  // The fix is to take the whole context object here...
  context: { params: { id: string } }
) {
  try {
    // ...and then get the id from context.params
    const { id } = context.params;
    const { status } = await request.json();

    if (!status || !["APPROVED", "REJECTED"].includes(status)) {
      return new NextResponse("Invalid status provided", { status: 400 });
    }

    const updatedExpense = await db.expense.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(updatedExpense);
  } catch (error) {
    console.error("[EXPENSE_PATCH]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
