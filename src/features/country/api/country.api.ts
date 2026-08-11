import { parseData } from "@/utils/parseData";
import { CountryCodeResponseSchema, CountryCodeType } from "../country.type";

/**
 * restcountries.com is not an option: v3.1 was deprecated (it 301s to a notice
 * served with HTTP 200) and v5 requires an Authorization key, which a client
 * bundle cannot keep secret. This one is keyless and sends `Allow-Origin: *`.
 */
const COUNTRY_CODES_URL = "https://countriesnow.space/api/v0.1/countries/codes";

/** The list never changes within a session — fetch it once and reuse it. */
let cachedCountries: CountryCodeType[] | null = null;

/** The API returns no emoji, so build the flag from the ISO code. */
function flagFromCode(code: string) {
    const REGIONAL_INDICATOR_OFFSET = 127397;
    return String.fromCodePoint(
        ...[...code.toUpperCase()].map((letter) => REGIONAL_INDICATOR_OFFSET + letter.charCodeAt(0))
    );
}

async function getCountryCodes(): Promise<CountryCodeType[]> {
    if (cachedCountries) return cachedCountries;

    // Deliberately not api.fetchJson: that helper sets Content-Type: application/json,
    // which turns this GET into a CORS-preflighted request it does not need to be.
    const response = await fetch(COUNTRY_CODES_URL, {
        method: "GET",
        headers: { Accept: "application/json" },
    });

    if (!response.ok) throw new Error(`Country list request failed (${response.status})`);

    const body = parseData(CountryCodeResponseSchema, await response.json());
    if (body.error) throw new Error(body.msg);

    cachedCountries = body.data
        .map((country) => ({
            code: country.code,
            name: country.name,
            // A few arrive spaced, e.g. "+1 684" for American Samoa.
            dialCode: country.dial_code.replace(/\s+/g, ""),
            flag: flagFromCode(country.code),
        }))
        .filter((country) => country.dialCode.length > 1)
        .sort((a, b) => a.name.localeCompare(b.name));

    return cachedCountries;
}

const countryApi = {
    getCountryCodes,
} as const;

export default countryApi;
