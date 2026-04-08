import { Colors, Radius, Shadow, Spacing, Typography } from '@/constants/theme';
import { NoteFile } from "@/services/notesService";
import { MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

const CARD_WIDTH = 100

function formatDate(ts: number): string {
    const d = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) {
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
        return 'Yesterday';
    } else if (days < 7) {
        return d.toLocaleDateString([], { weekday: 'short' });
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}
    
    export const renderNote = (
        item: NoteFile, 
        openNote: Function, 
        handleDelete: Function,
    ) => (
        <Pressable
            style={({ pressed }) => [styles.card, pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] }]}
            onPress={() => openNote(item)}
            onLongPress={() => handleDelete(item)}
        >
            <View style={styles.cardThumb}>
                {item.thumbnail ? (
                    <Image source={{ uri: item.thumbnail }} style={styles.thumbImage} contentFit="cover" />
                ) : (
                    <View style={styles.thumbPlaceholder}>
                        <View style={styles.linedPreview}>
                            {[0, 1, 2, 3, 4].map(i => (
                                <View key={i} style={styles.line} />
                            ))}
                        </View>
                    </View>
                )}
                <View style={styles.pageCount}>
                    <MaterialIcons name="description" size={10} color={Colors.textMuted} />
                    <Text style={styles.pageCountText}>{item.pages.length}</Text>
                </View>
            </View>
            <View style={styles.cardInfo}>
                <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.cardDate}>{formatDate(item.updatedAt)}</Text>
            </View>
        </Pressable>
    );

    const styles = StyleSheet.create({

    cardThumb: {
        height: CARD_WIDTH * 1.3,
        backgroundColor: Colors.pageLinedBg,
        position: 'relative',
    },
    thumbImage: { width: '100%', height: '100%' },

    thumbPlaceholder: {
        flex: 1,
        backgroundColor: Colors.pageLinedBg,
        padding: 10,
        justifyContent: 'center',
    },
        cardInfo: { padding: Spacing.sm },
    cardTitle: { ...Typography.caption, color: Colors.textPrimary, fontWeight: '600', marginBottom: 3 },
    cardDate: { fontSize: 11, color: Colors.textMuted },
    card: {
        width: CARD_WIDTH,
        backgroundColor: Colors.surface,
        borderRadius: Radius.md,
        overflow: 'hidden',
        ...Shadow.card,
    },
        linedPreview: { gap: 10 },
    line: {
        height: 1,
        backgroundColor: Colors.pageLinedLine,
        marginHorizontal: 4,
    },
    pageCount: {
        position: 'absolute',
        bottom: 6,
        right: 6,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)',
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderRadius: 4,
        gap: 2,
    },
    pageCountText: { fontSize: 10, color: Colors.textSecondary },

})