import z from "zod";

export const PlaceSchema = z.object({
    id: z.string(),
    name: z.string(),
    address: z.string(),
    location: z.object({
        latitude: z.number(),
        longitude: z.number(),
    }),
})
export type PlaceType = z.infer<typeof PlaceSchema>
