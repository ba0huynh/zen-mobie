import { Colors, useTheme } from "@/hooks/theme.hook";
import { ChevronDown, ChevronUp, Clock, Minus, Plus, Tag } from "lucide-react-native";
import { memo, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import type { Selection } from "../home-view.hook";
export type PricingOption = { price: number; duration: number };
export type MassageItem = {
    id: string;
    image: string;
    pricing: PricingOption[];
    name: string;
    description: string;
};

interface MassageCardProps {
    item: MassageItem;
    selection: Selection;
    onSelect: (itemId: string, pricingIndex: number) => void;
    onDecrement: (itemId: string, pricingIndex: number) => void;
}

function formatDuration(minutes: number) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const parts: string[] = [];
    if (hours > 0) parts.push(`${hours} hour${hours > 1 ? "s" : ""}`);
    if (mins > 0) parts.push(`${mins} minute${mins > 1 ? "s" : ""}`);
    return parts.join(" ") || "0 minutes";
}

export function formatPrice(amount: number) {
    return `₫${amount.toLocaleString("vi-VN")}`;
}

function MassageCard({ item, selection, onSelect, onDecrement }: MassageCardProps) {
    const [expanded, setExpanded] = useState(true);
    const ChevronIcon = expanded ? ChevronUp : ChevronDown;
    const { colors } = useTheme();
    
    const styles = createStyles(colors);
    
    return (
        <View style={styles.card}>
            <Pressable
                style={styles.header}
                onPress={() => setExpanded((prev) => !prev)}
                hitSlop={8}
            >
                <Text style={styles.headerTitle}>{item.name}</Text>
                <ChevronIcon size={18} color={colors.textSecondary} />
            </Pressable>

            {expanded &&
                item.pricing.map((option, index) => {
                    const isLast = index === item.pricing.length - 1;
                    const selectedQuantity = selection.find(
                        (s) => s.itemId === item.id && s.pricingIndex === index
                    )?.quantity ?? 0;

                    return (
                        <View
                            key={`${item.id}-${index}`}
                            style={[styles.row, !isLast && styles.rowDivider]}
                        >
                            <Pressable
                                onPress={() => onSelect(item.id, index)}
                                style={styles.rowMain}
                                hitSlop={8}
                            >
                                <Image source={{ uri: item.image }} style={styles.thumbnail} />

                                <View style={styles.rowContent}>
                                    <Text style={styles.optionTitle}>{option.duration} Mins</Text>

                                    {index === 0 && !!item.description && (
                                        <Text style={styles.description} numberOfLines={4}>
                                            {item.description}
                                        </Text>
                                    )}

                                    <View style={styles.metaRow}>
                                        <Clock size={12} color={colors.textSecondary} />
                                        <Text style={styles.metaText}>{formatDuration(option.duration)}</Text>
                                        <Text style={styles.metaDot}>•</Text>
                                        <Tag size={12} color={colors.textSecondary} />
                                        <Text style={styles.metaText}>{formatPrice(option.price)}</Text>
                                    </View>
                                </View>
                            </Pressable>

                            <View style={styles.quantityControls}>
                                {selectedQuantity > 0 && (
                                    <Pressable
                                        onPress={() => onDecrement(item.id, index)}
                                        style={styles.quantityButton}
                                        hitSlop={8}
                                    >
                                        <Minus size={14} color={colors.textPrimary} />
                                    </Pressable>
                                )}

                                {selectedQuantity > 0 && (
                                    <View style={styles.quantityBadge}>
                                        <Text style={styles.quantityText}>{selectedQuantity}</Text>
                                    </View>
                                )}

                                <Pressable
                                    onPress={() => onSelect(item.id, index)}
                                    style={[styles.quantityButton, styles.quantityButtonPrimary]}
                                    hitSlop={8}
                                >
                                    <Plus size={14} color="#fff" />
                                </Pressable>
                            </View>
                        </View>
                    );
                })}
        </View>
    );
}

export default memo(MassageCard);

const createStyles = (colors: Colors) => StyleSheet.create({
    card: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: "hidden",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    headerTitle: {
        color: colors.textPrimary,
        fontSize: 15,
        fontWeight: "600",
    },
    row: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    rowMain: {
        flex: 1,
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
    },
    rowDivider: {
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.border,
    },
    thumbnail: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.border,
    },
    rowContent: {
        flex: 1,
        gap: 6,
    },
    optionTitle: {
        color: colors.textPrimary,
        fontSize: 14,
        fontWeight: "600",
    },
    description: {
        color: colors.textSecondary,
        fontSize: 12.5,
        lineHeight: 18,
    },
    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    metaText: {
        color: colors.textSecondary,
        fontSize: 12.5,
    },
    metaDot: {
        color: colors.textSecondary,
        fontSize: 12.5,
    },
    quantityControls: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginTop: 2,
    },
    quantityButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.checkboxBorder,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.surface,
    },
    quantityButtonPrimary: {
        backgroundColor: colors.accent,
        borderColor: colors.accent,
    },
    quantityBadge: {
        minWidth: 24,
        paddingHorizontal: 6,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.accent,
        alignItems: "center",
        justifyContent: "center",
    },
    quantityText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "700",
    },
});
