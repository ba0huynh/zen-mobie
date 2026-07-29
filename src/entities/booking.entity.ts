import z from "zod";

export const BookingSchema = z.object({
    id: z.string(),
    massageId: z.string(),
    price: z.number(),
    duration: z.number(),
    createdAt: z.string(),
    startTime: z.string(),
    phone: z.string(),
    address: z.string(),
})
export type BookingType = z.infer<typeof BookingSchema>