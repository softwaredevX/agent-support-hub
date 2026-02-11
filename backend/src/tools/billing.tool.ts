import { prisma } from "../db/prisma";

export const getInvoiceDetails = async (invoiceId: string) => {
  return prisma.invoice.findUnique({ where: { id: invoiceId } });
};

export const getRefundStatus = async (invoiceId: string) => {
  const invoice = await getInvoiceDetails(invoiceId);
  if (!invoice) return null;

  return {
    status: invoice.status,
    amount: invoice.amount
  };
};
