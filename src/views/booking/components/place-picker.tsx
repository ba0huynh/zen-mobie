import Input from "@/components/ui/input";
import PickerSheet from "@/components/ui/picker-sheet";
import { PlaceType } from "@/entities/place.entity";
import { Colors, useTheme } from "@/hooks/theme.hook";
import { Check, ChevronDown, Home, MapPin } from "lucide-react-native";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

/** `id: null` is the manual-address option, so it needs its own list key. */
const MANUAL_OPTION_KEY = "manual";

type PlaceOption = {
    id: string | null;
    name: string;
    description: string;
};

const MANUAL_OPTION: PlaceOption = {
    id: null,
    name: "At home / my own address",
    description: "Type the address yourself",
};

type Props = {
    places: PlaceType[];
    selectedPlaceId: string | null;
    onSelect: (placeId: string | null) => void;
    /** Manual address — only editable while no place is picked. */
    address: string;
    onAddressChange: (value: string) => void;
};

export default function PlacePicker({
    places,
    selectedPlaceId,
    onSelect,
    address,
    onAddressChange,
}: Props) {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const [isOpen, setIsOpen] = useState(false);

    const options: PlaceOption[] = [
        MANUAL_OPTION,
        ...places.map((place) => ({
            id: place.id,
            name: place.name,
            description: place.address,
        })),
    ];
    const selectedOption = options.find((option) => option.id === selectedPlaceId) ?? MANUAL_OPTION;

    const matches = useCallback(
        (option: PlaceOption, search: string) =>
            option.name.toLowerCase().includes(search) ||
            option.description.toLowerCase().includes(search),
        []
    );

    return (
        <>
            <Pressable style={styles.trigger} onPress={() => setIsOpen(true)}>
                {selectedPlaceId ? (
                    <MapPin size={16} color={colors.textSecondary} />
                ) : (
                    <Home size={16} color={colors.textSecondary} />
                )}
                <View style={styles.triggerContent}>
                    <Text style={styles.triggerName}>{selectedOption.name}</Text>
                    <Text style={styles.triggerDescription} numberOfLines={2}>
                        {selectedOption.description}
                    </Text>
                </View>
                <ChevronDown size={16} color={colors.textSecondary} />
            </Pressable>

            {!selectedPlaceId ? (
                <Input
                    value={address}
                    onChangeText={onAddressChange}
                    placeholder="Street, ward, district — or a room number"
                />
            ) : null}

            <PickerSheet
                visible={isOpen}
                title="Select a place"
                searchPlaceholder="Search place or address"
                items={options}
                keyExtractor={(option) => option.id ?? MANUAL_OPTION_KEY}
                matches={matches}
                onSelect={(option) => {
                    onSelect(option.id);
                    setIsOpen(false);
                }}
                onClose={() => setIsOpen(false)}
                emptyMessage="No places match that search."
                renderItem={(option) => (
                    <>
                        {option.id ? (
                            <MapPin size={16} color={colors.textSecondary} />
                        ) : (
                            <Home size={16} color={colors.textSecondary} />
                        )}
                        <View style={styles.rowContent}>
                            <Text style={styles.rowName}>{option.name}</Text>
                            <Text style={styles.rowDescription} numberOfLines={2}>
                                {option.description}
                            </Text>
                        </View>
                        {option.id === selectedPlaceId ? (
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
        gap: 10,
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.textSecondary,
        backgroundColor: colors.background,
    },
    triggerContent: {
        flex: 1,
        gap: 2,
    },
    triggerName: {
        color: colors.textPrimary,
        fontSize: 15,
        fontWeight: "600",
    },
    triggerDescription: {
        color: colors.textSecondary,
        fontSize: 13,
        lineHeight: 18,
    },
    rowContent: {
        flex: 1,
        gap: 2,
    },
    rowName: {
        color: colors.textPrimary,
        fontSize: 14,
        fontWeight: "600",
    },
    rowDescription: {
        color: colors.textSecondary,
        fontSize: 13,
        lineHeight: 18,
    },
});
