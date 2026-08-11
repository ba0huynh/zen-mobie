import z from "zod";

/** Shape returned by countriesnow.space /countries/codes. */
export const CountryCodeResponseSchema = z.object({
    error: z.boolean(),
    msg: z.string(),
    data: z.object({
        name: z.string(),
        code: z.string(),
        dial_code: z.string(),
    }).array(),
})

export type CountryCodeType = {
    /** ISO 3166-1 alpha-2, e.g. "VN". */
    code: string
    name: string
    /** Calling code including the plus, e.g. "+84". */
    dialCode: string
    flag: string
}
