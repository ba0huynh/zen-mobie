import { Language } from "@/features/i18n";
import { useTranslation } from "react-i18next";

export default function useTranslate(prefix: string = '') {
    const { t: tHelp, i18n} = useTranslation();
    function t(key: string,vars?: Record<string, string | number>) {
        const hasNameSpace = key.includes(":")
        return tHelp(`${(hasNameSpace?'':prefix)}${key}`,vars);
    }
    const currentLanguage = i18n.language as Language;
    return { currentLanguage, t};
}