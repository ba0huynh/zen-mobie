import z from "zod";

export const BookingSchema = z.object({
    id: z.string(),
    createdAt: z.string(),
    startTime: z.string(),
    name: z.string(),
    phone: z.string(),
    email: z.string(),
    address: z.string(),
    note: z.string().nullable(),
    /** Omitted when the guest has no preference. */
    gender: z.enum(["male", "female"]).optional(),
})
export type BookingType = z.infer<typeof BookingSchema>
