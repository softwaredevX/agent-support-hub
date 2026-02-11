// src/db/seed.ts
import { prisma } from "./prisma";

async function seed() {
  await prisma.order.createMany({
    data: [
      { status: "processing", trackingId: "TRACK100" },
      { status: "shipped", trackingId: "TRACK101" },
      { status: "in_transit", trackingId: "TRACK102" },
      { status: "delivered", trackingId: "TRACK103" },
      { status: "cancelled", trackingId: "TRACK104" },
      { status: "order is placed", trackingId: "TRACK105" }
    ]
  });


  await prisma.invoice.createMany({
    data: [
      { amount: 149.99, status: "paid" },
      { amount: 89.5, status: "pending" },
      { amount: 249.0, status: "overdue" },
      { amount: 39.0, status: "refunded" },
      { amount: 19.99, status: "paid" }
    ]
  });

  await prisma.conversation.create({
    data: {
      title: "Shipping delay on order",
      messages: {
        create: [
          { role: "user", content: "Where is my order? It says shipped." },
          {
            role: "assistant",
            content:
              "I can help with that. Please share your tracking ID so I can check the status."
          }
        ]
      }
    }
  });

  await prisma.conversation.create({
    data: {
      title: "Refund request",
      messages: {
        create: [
          { role: "user", content: "I need a refund for invoice #2." },
          {
            role: "assistant",
            content:
              "I can start a refund request. Please confirm the invoice amount and reason."
          }
        ]
      }
    }
  });
}

seed();
