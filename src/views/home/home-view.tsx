import BookingShell from "@/components/booking-shell";
import BRAND from "@/constants/brand";
import { Colors, useTheme } from "@/hooks/theme.hook";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBookingStore } from "../booking/booking.store";
import MassageCard, { formatPrice } from "./components/massage-card";
import useHomeView from "./home-view.hook";

export default function HomeView() {
    const {
        isLoading,
        massageList,
        selection,
        totalPrice,
        totalSelected,
        handleSelect,
        handleDecrement,
    } = useHomeView();
    const { colors } = useTheme();
    const setSelectedMassages = useBookingStore((state) => state.setSelectedMassages);
    const styles = createStyles(colors);

    const handleContinue = () => {
        const bookingMassages = selection.flatMap((selectedItem) => {
            const massage = massageList.find((item) => item.id === selectedItem.itemId);
            const pricing = massage?.pricing[selectedItem.pricingIndex];

            if (!massage || !pricing) return [];

            return Array.from({ length: selectedItem.quantity }, () => ({
                massageId: massage.id,
                duration: pricing.duration,
                price: pricing.price,
                name: massage.name,
            }));
        });

        setSelectedMassages(bookingMassages);
        router.push("/booking");
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.centered}>
                <ActivityIndicator color={colors.accent} size="large" />
            </SafeAreaView>
        );
    }

    return (
        <BookingShell
            subtitle="Choose an appointment type."
            aside={
                <View style={styles.aside}>
                    {BRAND.description.map((paragraph) => (
                        <Text key={paragraph} style={styles.asideText}>
                            {paragraph}
                        </Text>
                    ))}
                </View>
            }
        >
            <View style={styles.listFrame}>
                <FlashList
                    data={massageList}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                    renderItem={({ item }) => (
                        <MassageCard
                            item={item}
                            selection={selection}
                            onSelect={handleSelect}
                            onDecrement={handleDecrement}
                        />
                    )}
                />
            </View>

            <View style={styles.footer}>
                {totalSelected > 0 && (
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryText}>
                            {totalSelected} service{totalSelected > 1 ? "s" : ""} selected
                        </Text>
                        <Text style={styles.summaryTotal}>{formatPrice(totalPrice)}</Text>
                    </View>
                )}

                <Pressable
                    onPress={handleContinue}
                    disabled={totalSelected === 0}
                    style={({ pressed }) => [
                        styles.continueButton,
                        totalSelected === 0 && styles.continueButtonDisabled,
                        pressed && totalSelected > 0 && styles.continueButtonPressed,
                    ]}
                >
                    <Text
                        style={[
                            styles.continueText,
                            totalSelected === 0 && styles.continueTextDisabled,
                        ]}
                    >
                        Continue
                    </Text>
                </Pressable>
            </View>
        </BookingShell>
    );
}

const createStyles = (colors: Colors) => StyleSheet.create({
    centered: {
        flex: 1,
        backgroundColor: colors.background,
        alignItems: "center",
        justifyContent: "center",
    },
    aside: {
        gap: 16,
    },
    asideText: {
        color: colors.textSecondary,
        fontSize: 14,
        lineHeight: 21,
    },
    listFrame: {
        flex: 1,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.background,
        overflow: "hidden",
    },
    listContent: {
        padding: 12,
    },
    separator: {
        height: 12,
    },
    footer: {
        gap: 12,
    },
    summaryRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    summaryText: {
        color: colors.textSecondary,
        fontSize: 13,
    },
    summaryTotal: {
        color: colors.textPrimary,
        fontSize: 16,
        fontWeight: "700",
    },
    continueButton: {
        backgroundColor: colors.accent,
        borderRadius: 999,
        paddingVertical: 18,
        alignItems: "center",
        justifyContent: "center",
    },
    continueButtonDisabled: {
        backgroundColor: colors.accentDisabled,
    },
    continueButtonPressed: {
        opacity: 0.85,
    },
    continueText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
    continueTextDisabled: {
        color: colors.textSecondary,
    },
});
