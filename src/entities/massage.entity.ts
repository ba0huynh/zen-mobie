import z from "zod";

export const MassageSchema = z.object({
    id: z.string(),
    image: z.string(),
});