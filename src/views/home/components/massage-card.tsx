// components/massage-card.tsx
import { StyleSheet} from "react-native";
import View from "@/components/ui/view";
import { MassageItemType } from "@/features/massage/massage.type";
import Text from "@/components/ui/text";
import Image from "@/components/ui/image";
import Button from "@/components/ui/button";

const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN").format(price) + "đ";

const formatDuration = (mins: number) =>
    mins >= 60
        ? mins % 60 === 0
            ? `${mins / 60}h`
            : `${Math.floor(mins / 60)}h${mins % 60}m`
        : `${mins} mins`;

export default function MassageCard({
    item,
    selectedDuration,
    onSelectDuration,
    onPress,
}: {
    item: MassageItemType;
    selectedDuration?: number;
    onSelectDuration?: (duration: number) => void;
    onPress?: () => void;
}) {
    return (
        <Button onPress={onPress} style={styles.card}>
            <View style={styles.header}>
                <Image source={item.image} style={styles.image} />
                <View style={styles.headerText}>
                    <Text style={styles.name}>
                        {item.name}
                    </Text>
                    <Text style={styles.description}>
                        {item.description}
                    </Text>
                </View>
            </View>

            <View style={styles.pricingRow}>
                {item.pricing.map((p) => {
                    const isSelected = selectedDuration === p.duration;
                    return (
                        <Button
                            key={p.duration}
                            onPress={() => onSelectDuration?.(p.duration)}
                            style={[
                                styles.chip,
                                isSelected && styles.chipSelected,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.chipDuration,
                                    isSelected && styles.chipTextSelected,
                                ]}
                            >
                                {formatDuration(p.duration)}
                            </Text>
                            <Text
                                style={[
                                    styles.chipPrice,
                                    isSelected && styles.chipTextSelected,
                                ]}
                            >
                                {formatPrice(p.price)}
                            </Text>
                        </Button>
                    );
                })}
            </View>
        </Button>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#1C1C1E",
        borderRadius: 16,
        padding: 14,
        marginHorizontal: 16,
        marginVertical: 8,
        gap: 12,
    },
    header: {
        flexDirection: "row",
        gap: 12,
    },
    image: {
        width: 64,
        height: 64,
        borderRadius: 12,
        backgroundColor: "#2C2C2E",
    },
    headerText: {
        flex: 1,
        justifyContent: "center",
        gap: 4,
    },
    name: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
    description: {
        color: "#9B9BA1",
        fontSize: 13,
        lineHeight: 18,
    },
    pricingRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    chip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
        backgroundColor: "#2C2C2E",
        borderWidth: 1,
        borderColor: "#3A3A3C",
    },
    chipSelected: {
        backgroundColor: "#7C3AED",
        borderColor: "#7C3AED",
    },
    chipDuration: {
        color: "#E5E5E5",
        fontSize: 13,
        fontWeight: "500",
    },
    chipPrice: {
        color: "#9B9BA1",
        fontSize: 13,
    },
    chipTextSelected: {
        color: "#FFFFFF",
    },
});