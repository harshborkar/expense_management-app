// prisma/seed.ts

import { PrismaClient, Role } from "@prisma/client";
const db = new PrismaClient();

async function main() {
  // Clean up existing data
  console.log("Deleting existing data...");
  await db.expense.deleteMany();
  await db.user.deleteMany();

  console.log("Seeding new data...");

  // Create Users
  const admin = await db.user.create({
    data: {
      email: "admin@company.com",
      name: "Alice Admin",
      role: Role.ADMIN,
    },
  });

  const manager = await db.user.create({
    data: {
      email: "manager@company.com",
      name: "Bob Manager",
      role: Role.MANAGER,
    },
  });

  const employee1 = await db.user.create({
    data: {
      email: "charlie@company.com",
      name: "Charlie Brown",
      role: Role.EMPLOYEE,
      managerId: manager.id, // Assign Charlie to Bob
    },
  });

  const employee2 = await db.user.create({
    data: {
      email: "diana@company.com",
      name: "Diana Miller",
      role: Role.EMPLOYEE,
      managerId: manager.id, // Assign Diana to Bob
    },
  });

  console.log("Created users:", { admin, manager, employee1, employee2 });

  // Create Expenses for employees
  await db.expense.createMany({
    data: [
      {
        amount: 567.0,
        currency: "USD",
        category: "Food",
        description: "Client Dinner Q4",
        date: new Date("2025-10-01T10:00:00Z"),
        status: "PENDING",
        ownerId: employee1.id, // Charlie's expense
      },
      {
        amount: 450.5,
        currency: "EUR",
        category: "Office Supplies",
        description: "New Office Monitors",
        date: new Date("2025-09-28T12:00:00Z"),
        status: "PENDING",
        ownerId: employee2.id, // Diana's expense
      },
      {
        amount: 75.0,
        currency: "USD",
        category: "Travel",
        description: "Taxi to airport",
        date: new Date("2025-09-25T15:30:00Z"),
        status: "APPROVED",
        ownerId: employee1.id, // Charlie's expense
      },
      {
        amount: 35.2,
        currency: "USD",
        category: "Other",
        description: "Project poster printing",
        date: new Date("2025-09-22T11:00:00Z"),
        status: "REJECTED",
        ownerId: employee2.id, // Diana's expense
      },
    ],
  });

  console.log("Seeding complete. 🌱");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
