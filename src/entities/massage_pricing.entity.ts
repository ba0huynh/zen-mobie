import z from "zod"

export const MassagePricingSchema = z.object({
    id: z.string(),
    massageId: z.string(),
    price: z.number(),
    duration: z.number(),
})