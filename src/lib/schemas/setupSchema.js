import { z } from "zod";

export const setupSchema = z.object({
    // Admin User (Only for first run, typically)
    adminUser: z.object({
        name: z.string().optional(),
        email: z.string().email("Invalid email").optional().or(z.literal("")),
        password: z.string().min(6, "Min 6 chars").optional().or(z.literal("")),
        confirmPassword: z.string().optional().or(z.literal("")),
    }).optional(),

    // Company Details
    name: z.string().min(1, "Company name is required"),
    billingName: z.string().optional(),
    slogan: z.string().optional(),
    tagline: z.string().optional(),
    address: z.string().min(1, "Address is required"),

    // Registration
    registrationNo: z.string().optional(),
    registrationType: z.string().optional(),
    pan: z.string().optional(),
    gstIn: z.string().optional(),

    // Contact
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    phone: z.string().optional(),

    // Bank Details
    bankDetails: z.object({
        bankName: z.string().optional(),
        accountName: z.string().optional(),
        accountNumber: z.string().optional(),
        ifscCode: z.string().optional(),
        branch: z.string().optional(),
    }),

    // Branding
    formatting: z.object({
        color: z.string().default("#1d4ed8"),
        font: z.string().default("sans"),
    }),
    logo: z.string().optional(), // Base64 string
}).refine((data) => {
    // If admin password is provided, confirm password must match
    if (data.adminUser?.password && data.adminUser.password !== data.adminUser.confirmPassword) {
        return false;
    }
    return true;
}, {
    message: "Passwords do not match",
    path: ["adminUser", "confirmPassword"],
});
