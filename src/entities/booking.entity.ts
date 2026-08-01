import z from "zod";

export const BookingSchema = z.object({
    id: z.string(),
    createdAt: z.string(),
    startTime: z.string(),
    phone: z.string(),
    address: z.string(),
    note: z.string().nullable(),
})
export type BookingType = z.infer<typeof BookingSchema>