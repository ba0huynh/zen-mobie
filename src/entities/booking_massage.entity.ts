import z from "zod";

export const BookingMassageSchema = z.object({
    bookingId: z.string(),
    massageId: z.string(),
    price: z.number(),
    duration: z.number(),
})
export type BookingMassageType = z.infer<typeof BookingMassageSchema>
