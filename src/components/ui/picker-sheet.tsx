import { Colors, useTheme } from "@/hooks/theme.hook";
import { FlashList } from "@shopify/flash-list";
import { Search, X } from "lucide-react-native";
import { ReactNode, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

type Props<T> = {
    visible: boolean;
    title: string;
    items: T[];
    keyExtractor: (item: T) => string;
    /** `search` arrives trimmed and lower-cased. */
    matches: (item: T, search: string) => boolean;
    /** Row contents — the sheet supplies the pressable row around them. */
    renderItem: (item: T) => ReactNode;
    onSelect: (item: T) => void;
    onClose: () => void;
    searchPlaceholder?: string;
    isLoading?: boolean;
    errorMessage?: string | null;
    onRetry?: () => void;
    emptyMessage?: string;
};

/** A searchable modal list — shared by the country and place pickers. */
export default function PickerSheet<T>({
    visible,
    title,
    items,
    keyExtractor,
    matches,
    renderItem,
    onSelect,
    onClose,
    searchPlaceholder = "Search",
    isLoading,
    errorMessage,
    onRetry,
    emptyMessage = "Nothing matches that search.",
}: Props<T>) {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const [query, setQuery] = useState("");

    // Every open starts from the full list rather than the last search.
    useEffect(() => {
        if (visible) setQuery("");
    }, [visible]);

    const results = useMemo(() => {
        const search = query.trim().toLowerCase();
        if (!search) return items;

        return items.filter((item) => matches(item, search));
    }, [items, query, matches]);

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.modalRoot}>
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

                <View style={styles.sheet}>
                    <View style={styles.sheetHeader}>
                        <Text style={styles.sheetTitle}>{title}</Text>
                        <Pressable onPress={onClose} hitSlop={8}>
                            <X size={18} color={colors.textSecondary} />
                        </Pressable>
                    </View>

                    <View style={styles.searchBox}>
                        <Search size={16} color={colors.textSecondary} />
                        <TextInput
                            value={query}
                            onChangeText={setQuery}
                            placeholder={searchPlaceholder}
                            placeholderTextColor={colors.textSecondary}
                            autoFocus
                            style={[styles.searchInput, { outlineStyle: "none" } as any]}
                        />
                    </View>

                    {isLoading ? (
                        <View style={styles.stateBox}>
                            <ActivityIndicator color={colors.accent} />
                        </View>
                    ) : errorMessage ? (
                        <View style={styles.stateBox}>
                            <Text style={styles.stateText}>{errorMessage}</Text>
                            {onRetry ? (
                                <Pressable style={styles.retryButton} onPress={onRetry}>
                                    <Text style={styles.retryText}>Try again</Text>
                                </Pressable>
                            ) : null}
                        </View>
                    ) : (
                        <View style={styles.listWrap}>
                            <FlashList
                                data={results}
                                keyExtractor={keyExtractor}
                                keyboardShouldPersistTaps="handled"
                                ListEmptyComponent={
                                    <View style={styles.stateBox}>
                                        <Text style={styles.stateText}>{emptyMessage}</Text>
                                    </View>
                                }
                                renderItem={({ item }) => (
                                    <Pressable style={styles.row} onPress={() => onSelect(item)}>
                                        {renderItem(item)}
                                    </Pressable>
                                )}
                            />
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const createStyles = (colors: Colors) => StyleSheet.create({
    modalRoot: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
    },
    sheet: {
        width: "100%",
        maxWidth: 420,
        maxHeight: 520,
        flexShrink: 1,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        overflow: "hidden",
    },
    sheetHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    sheetTitle: {
        color: colors.textPrimary,
        fontSize: 15,
        fontWeight: "700",
    },
    searchBox: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginHorizontal: 16,
        marginBottom: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.checkboxBorder,
        backgroundColor: colors.background,
    },
    searchInput: {
        flex: 1,
        color: colors.textPrimary,
        fontSize: 14,
    },
    listWrap: {
        flex: 1,
        minHeight: 200,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.border,
    },
    stateBox: {
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        paddingVertical: 32,
        paddingHorizontal: 16,
    },
    stateText: {
        color: colors.textSecondary,
        fontSize: 13,
        textAlign: "center",
    },
    retryButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: colors.accent,
    },
    retryText: {
        color: colors.textPrimary,
        fontSize: 13,
        fontWeight: "600",
    },
});
