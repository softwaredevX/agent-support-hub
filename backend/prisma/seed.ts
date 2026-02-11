import { prisma } from "../src/db/prisma";

const seed = async () => {
  const conversationId = "c1111111-1111-4111-8111-111111111111";
  const orderId = "11111111-1111-4111-8111-111111111111";
  const invoiceId = "22222222-2222-4222-8222-222222222222";

  await prisma.order.createMany({
    data: [
      {
        id: orderId,
        status: "shipped",
        trackingId: "TRACK123"
      },
      {
        id: "33333333-3333-4333-8333-333333333333",
        status: "processing",
        trackingId: "TRACK999"
      }
    ],
    skipDuplicates: true
  });

  await prisma.invoice.createMany({
    data: [
      {
        id: invoiceId,
        amount: 149.99,
        status: "refunded"
      },
      {
        id: "44444444-4444-4444-8444-444444444444",
        amount: 89.5,
        status: "paid"
      }
    ],
    skipDuplicates: true
  });

  await prisma.conversation.upsert({
    where: { id: conversationId },
    update: { title: "Order tracking question" },
    create: { id: conversationId, title: "Order tracking question" }
  });

  await prisma.message.createMany({
    data: [
      {
        id: "m1111111-1111-4111-8111-111111111111",
        conversationId,
        role: "user",
        content: "Hi, can you check order TRACK123?",
        createdAt: new Date()
      },
      {
        id: "m2222222-2222-4222-8222-222222222222",
        conversationId,
        role: "assistant",
        content: "Sure, I can look up that order.",
        createdAt: new Date()
      },
      {
        id: "m3333333-3333-4333-8333-333333333333",
        conversationId,
        role: "user",
        content: "Also check invoice 22222222-2222-4222-8222-222222222222",
        createdAt: new Date()
      }
    ],
    skipDuplicates: true
  });
};

seed()
  .catch(err => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
