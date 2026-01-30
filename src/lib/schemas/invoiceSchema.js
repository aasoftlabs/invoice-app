import { z } from "zod";

export const invoiceSchema = z.object({
    invoiceNo: z.string().min(1, "Invoice number is required"),
    date: z.string().min(1, "Date is required"),
    dueDate: z.string().optional(),

    // Client Details
    clientName: z.string().optional(),
    clientCompany: z.string().optional(),
    clientAddress: z.string().min(1, "Address is required"),
    clientGst: z.string().optional(),

    // Items
    items: z.array(
        z.object({
            description: z.string().min(1, "Description is required"),
            subDescription: z.string().optional(),
            rate: z.coerce.number().min(0, "Rate must be positive"),
            qty: z.coerce.number().min(1, "Quantity must be at least 1"),
        })
    ).min(1, "At least one item is required"),

    // Settings
    taxRate: z.coerce.number().min(0).default(0),
    type: z.enum(["Standard", "Digital"]).default("Digital"),
    showQrCode: z.boolean().default(false),
    status: z.string().default("Pending"),
});

export const defaultInvoiceValues = {
    invoiceNo: "",
    date: new Date().toISOString().split("T")[0],
    dueDate: "",
    clientName: "",
    clientCompany: "",
    clientAddress: "",
    clientGst: "",
    items: [
        { description: "Web Application Development", subDescription: "", rate: 40000, qty: 1 }
    ],
    taxRate: 0,
    type: "Digital",
    showQrCode: false,
};
