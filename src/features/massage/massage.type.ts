import { MassageSchema } from "@/entities/massage.entity";
import { MassagePricingSchema } from "@/entities/massage_pricing.entity";
import { MassageTranslationSchema } from "@/entities/massage_translation.entity";
import z from "zod";

export const MassageItemSchema = MassageSchema.extend({
    ...MassageTranslationSchema.pick({ description: true, name: true, }).shape,
    pricing: MassagePricingSchema.pick({price:true, duration:true}).array()
})
export type MassageItemType = z.infer<typeof MassageItemSchema>