import { z } from "zod";

export const verifySchema = z.object({
    invoiceNo: z.string().min(1, "Invoice number is required"),
    amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
});
