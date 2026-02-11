import { prisma } from "../db/prisma";

type OrderLookup =
  | { id: string; trackingId?: never }
  | { trackingId: string; id?: never };

export const getOrderDetails = async (lookup: OrderLookup) => {
  if ("id" in lookup) {
    return prisma.order.findUnique({ where: { id: lookup.id } });
  }

  return prisma.order.findFirst({
    where: { trackingId: lookup.trackingId }
  });
};

export const getDeliveryStatus = async (lookup: OrderLookup) => {
  const order = await getOrderDetails(lookup);
  if (!order) return null;

  return {
    status: order.status,
    trackingId: order.trackingId
  };
};

export const updateOrderStatus = async (
  lookup: OrderLookup,
  status: string
) => {
  const order = await getOrderDetails(lookup);
  if (!order) return null;

  return prisma.order.update({
    where: { id: order.id },
    data: { status }
  });
};
