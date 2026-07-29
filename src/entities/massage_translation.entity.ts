import z from "zod";
import { LanguageCodes } from "./entity.type";

export const MassageTranslationSchema = z.object({
    massageId: z.string(),
    name: z.string(),
    languageCode: z.enum(LanguageCodes),
    description: z.string(),
});