import { z } from "zod";

export const profileSchema = z
    .object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        currentPassword: z.string().optional(),
        newPassword: z.string().optional(),
        confirmNewPassword: z.string().optional(),
    })
    .refine(
        (data) => {
            // If new password is provided, current password is required
            if (data.newPassword && !data.currentPassword) {
                return false;
            }
            return true;
        },
        {
            message: "Current password is required to set a new password",
            path: ["currentPassword"],
        }
    )
    .refine(
        (data) => {
            // If new password is provided, it must match confirmation
            if (data.newPassword && data.newPassword !== data.confirmNewPassword) {
                return false;
            }
            return true;
        },
        {
            message: "Passwords do not match",
            path: ["confirmNewPassword"],
        }
    );
