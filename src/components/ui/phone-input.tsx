import countryApi from "@/features/country/api/country.api";
import { CountryCodeType } from "@/features/country/country.type";
import { Colors, useTheme } from "@/hooks/theme.hook";
import { Check, ChevronDown } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import Input from "./input";
import PickerSheet from "./picker-sheet";

type Props = {
    /** The local part of the number — the dial code is kept separately. */
    value: string;
    onChangeText: (value: string) => void;
    dialCode: string;
    onDialCodeChange: (dialCode: string) => void;
    label?: string;
    required?: boolean;
    placeholder?: string;
};

export default function PhoneInput({
    value,
    onChangeText,
    dialCode,
    onDialCodeChange,
    label,
    required,
    placeholder,
}: Props) {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    const [isOpen, setIsOpen] = useState(false);
    const [countries, setCountries] = useState<CountryCodeType[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasError, setHasError] = useState(false);
    // Several countries share a dial code (+1 is US, Canada, Jamaica...), so remember
    // the row that was actually tapped and only fall back to a lookup by code.
    const [pickedCountry, setPickedCountry] = useState<CountryCodeType | null>(null);

    async function loadCountries() {
        setIsLoading(true);
        setHasError(false);
        try {
            setCountries(await countryApi.getCountryCodes());
        } catch {
            setHasError(true);
        } finally {
            setIsLoading(false);
        }
    }

    // Fetched up front so the trigger can show the right flag before the picker opens.
    useEffect(() => {
        loadCountries();
    }, []);

    const selectedCountry = pickedCountry?.dialCode === dialCode
        ? pickedCountry
        : countries.find((country) => country.dialCode === dialCode);

    const matches = useCallback(
        (country: CountryCodeType, search: string) =>
            country.name.toLowerCase().includes(search) ||
            country.dialCode.includes(search) ||
            country.code.toLowerCase() === search,
        []
    );

    const selectCountry = (country: CountryCodeType) => {
        setPickedCountry(country);
        onDialCodeChange(country.dialCode);
        setIsOpen(false);
    };

    return (
        <>
            <Input
                label={label}
                required={required}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                keyboardType="phone-pad"
                leftAdornment={
                    <Pressable style={styles.trigger} onPress={() => setIsOpen(true)} hitSlop={6}>
                        <Text style={styles.triggerFlag}>{selectedCountry?.flag ?? "🏳"}</Text>
                        <Text style={styles.triggerCode}>{dialCode}</Text>
                        <ChevronDown size={14} color={colors.textSecondary} />
                    </Pressable>
                }
            />

            <PickerSheet
                visible={isOpen}
                title="Select country"
                searchPlaceholder="Search country or code"
                items={countries}
                keyExtractor={(country) => country.code}
                matches={matches}
                onSelect={selectCountry}
                onClose={() => setIsOpen(false)}
                isLoading={isLoading}
                errorMessage={hasError ? "Could not load the country list." : null}
                onRetry={loadCountries}
                emptyMessage="No countries match that search."
                renderItem={(country) => (
                    <>
                        <Text style={styles.rowFlag}>{country.flag}</Text>
                        <Text style={styles.rowName} numberOfLines={1}>
                            {country.name}
                        </Text>
                        <Text style={styles.rowCode}>{country.dialCode}</Text>
                        {country.dialCode === dialCode ? (
                            <Check size={16} color={colors.accent} />
                        ) : null}
                    </>
                )}
            />
        </>
    );
}

const createStyles = (colors: Colors) => StyleSheet.create({
    trigger: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    triggerFlag: {
        fontSize: 16,
    },
    triggerCode: {
        color: colors.textPrimary,
        fontSize: 15,
        fontWeight: "600",
    },
    rowFlag: {
        fontSize: 18,
    },
    rowName: {
        flex: 1,
        color: colors.textPrimary,
        fontSize: 14,
    },
    rowCode: {
        color: colors.textSecondary,
        fontSize: 14,
        fontWeight: "600",
    },
});
