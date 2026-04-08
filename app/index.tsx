// Powered by OnSpace.AI
import { renderNote } from '@/components/feature/NoteElement';
import { Colors, Radius, Shadow, Spacing, Typography } from '@/constants/theme';
import { useNotesContext } from '@/contexts/NotesContext';
import { useNotesList } from '@/hooks/useNotes';
import { NoteFile, createNewNote, saveNote } from '@/services/notesService';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    Dimensions,
    FlatList,
    Modal, Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - Spacing.md * 3) / 2;

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

export default function NotesListScreen() {
    const router = useRouter();
    const { notes, loading, load, removeNote } = useNotesList();
    const { setCurrentNote } = useNotesContext();
    const [showNewModal, setShowNewModal] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [searchText, setSearchText] = useState('');

    useFocusEffect(useCallback(() => { load(); }, [load]));

    const openNote = (note: NoteFile) => {
        setCurrentNote(note);
        router.push(`/note/${note.id}`);
    };

    const handleCreate = async () => {
        const title = newTitle.trim() || 'Untitled Note';
        const note = createNewNote(title);
        await saveNote(note);
        setShowNewModal(false);
        setNewTitle('');
        setCurrentNote(note);
        router.push(`/note/${note.id}`);
    };

    const handleDelete = (note: NoteFile) => {
        // TODO: need alert modal here
        removeNote(note.id)
    };

    const filtered = searchText
        ? notes.filter(n => n.title.toLowerCase().includes(searchText.toLowerCase()))
        : notes;

    const noteThumbnailItem = ({ item }: { item: NoteFile }) => {
        return renderNote(item, openNote, handleDelete )
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.appName}>InkNotes</Text>
                    <Text style={styles.subtitle}>{notes.length} note{notes.length !== 1 ? 's' : ''}</Text>
                </View>
                <Pressable
                    style={({ pressed }) => [styles.fab, pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] }]}
                    onPress={() => { setNewTitle(''); setShowNewModal(true); }}
                >
                    <MaterialIcons name="add" size={28} color={Colors.bg} />
                </Pressable>
            </View>

            {/* Search */}
            <View style={styles.searchRow}>
                <MaterialIcons name="search" size={18} color={Colors.textMuted} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search notes..."
                    placeholderTextColor={Colors.textMuted}
                    value={searchText}
                    onChangeText={setSearchText}
                />
                {searchText.length > 0 && (
                    <Pressable onPress={() => setSearchText('')}>
                        <MaterialIcons name="close" size={18} color={Colors.textMuted} />
                    </Pressable>
                )}
            </View>

            {/* Zero note items */}
            {filtered.length === 0 && !loading ? (
                <View style={styles.emptyState}>
                    <Image
                        source={require('@/assets/images/onboarding-hero.png')}
                        style={styles.emptyImage}
                        contentFit="contain"
                    />
                    <Text style={styles.emptyTitle}>No Notes Yet</Text>
                    <Text style={styles.emptyBody}>Tap the + button to create your first note and start writing with your stylus.</Text>
                    <Pressable
                        style={({ pressed }) => [styles.emptyBtn, pressed && { opacity: 0.8 }]}
                        onPress={() => { setNewTitle(''); setShowNewModal(true); }}
                    >
                        <MaterialIcons name="add" size={20} color={Colors.bg} />
                        <Text style={styles.emptyBtnText}>New Note</Text>
                    </Pressable>
                </View>
            ) : (
                // Actual Note Thumbnail items
                <FlatList
                    id="note-items"
                    data={filtered}
                    renderItem={noteThumbnailItem}
                    keyExtractor={item => item.id}
                    numColumns={4}
                    columnWrapperStyle={styles.row}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshing={loading}
                    onRefresh={load}
                />
            )}

            {/* New Note Modal */}
            <Modal visible={showNewModal} transparent animationType="fade" onRequestClose={() => setShowNewModal(false)}>
                <Pressable style={styles.modalOverlay} onPress={() => setShowNewModal(false)}>
                    <Pressable style={styles.modalBox} onPress={e => e.stopPropagation()}>
                        <Text style={styles.modalTitle}>New Note</Text>
                        <TextInput
                            id='new-note-name-id'
                            placeholder="Note title..."
                            placeholderTextColor={Colors.textMuted}
                            value={newTitle}
                            onChangeText={setNewTitle}
                            autoFocus
                            returnKeyType="done"
                            onSubmitEditing={handleCreate}
                        />
                        <View style={styles.modalActions}>
                            <Pressable
                                style={({ pressed }) => [styles.modalBtn, styles.modalBtnCancel, pressed && { opacity: 0.7 }]}
                                onPress={() => setShowNewModal(false)}
                            >
                                <Text style={styles.modalBtnCancelText}>Cancel</Text>
                            </Pressable>
                            <Pressable
                                style={({ pressed }) => [styles.modalBtn, styles.modalBtnCreate, pressed && { opacity: 0.8 }]}
                                onPress={handleCreate}
                            >
                                <Text style={styles.modalBtnCreateText}>Create</Text>
                            </Pressable>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.bg },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingTop: Spacing.sm,
        paddingBottom: Spacing.md,
    },
    appName: { ...Typography.h1, color: Colors.textPrimary },
    subtitle: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
    fab: {
        width: 52,
        height: 52,
        borderRadius: Radius.full,
        backgroundColor: Colors.accent,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadow.card,
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        marginHorizontal: Spacing.md,
        marginBottom: Spacing.md,
        borderRadius: Radius.md,
        paddingHorizontal: Spacing.sm,
        paddingVertical: Platform.OS === 'ios' ? 10 : 4,
    },
    searchIcon: { marginRight: Spacing.xs },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: Colors.textPrimary,
    },
    listContent: { paddingHorizontal: Spacing.md, paddingBottom: 40 },
    row: { gap: Spacing.md, marginBottom: Spacing.md },
    // card: {
    //     width: CARD_WIDTH,
    //     backgroundColor: Colors.surface,
    //     borderRadius: Radius.md,
    //     overflow: 'hidden',
    //     ...Shadow.card,
    // },
    // cardThumb: {
    //     height: CARD_WIDTH * 1.3,
    //     backgroundColor: Colors.pageLinedBg,
    //     position: 'relative',
    // },
    // thumbImage: { width: '100%', height: '100%' },
    // thumbPlaceholder: {
    //     flex: 1,
    //     backgroundColor: Colors.pageLinedBg,
    //     padding: 10,
    //     justifyContent: 'center',
    // },
    // linedPreview: { gap: 10 },
    // line: {
    //     height: 1,
    //     backgroundColor: Colors.pageLinedLine,
    //     marginHorizontal: 4,
    // },
    // pageCount: {
    //     position: 'absolute',
    //     bottom: 6,
    //     right: 6,
    //     flexDirection: 'row',
    //     alignItems: 'center',
    //     backgroundColor: 'rgba(0,0,0,0.4)',
    //     paddingHorizontal: 5,
    //     paddingVertical: 2,
    //     borderRadius: 4,
    //     gap: 2,
    // },
    // pageCountText: { fontSize: 10, color: Colors.textSecondary },
    // cardInfo: { padding: Spacing.sm },
    // cardTitle: { ...Typography.caption, color: Colors.textPrimary, fontWeight: '600', marginBottom: 3 },
    // cardDate: { fontSize: 11, color: Colors.textMuted },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Spacing.xl,
    },
    emptyImage: { width: 220, height: 300, marginBottom: Spacing.lg },
    emptyTitle: { ...Typography.h2, color: Colors.textPrimary, marginBottom: Spacing.sm, textAlign: 'center' },
    emptyBody: { ...Typography.body, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: Spacing.xl },
    emptyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.accent,
        paddingHorizontal: Spacing.lg,
        paddingVertical: 12,
        borderRadius: Radius.full,
        gap: Spacing.xs,
    },
    emptyBtnText: { color: Colors.bg, fontWeight: '600', fontSize: 16 },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBox: {
        backgroundColor: Colors.surface,
        borderRadius: Radius.lg,
        padding: Spacing.lg,
        width: '80%',
        ...Shadow.card,
    },
    modalTitle: { ...Typography.h3, color: Colors.textPrimary, marginBottom: Spacing.md },
    modalInput: {
        backgroundColor: Colors.surfaceElevated,
        borderRadius: Radius.sm,
        padding: Spacing.sm,
        color: Colors.textPrimary,
        fontSize: 16,
        marginBottom: Spacing.md,
    },
    modalActions: { flexDirection: 'row', gap: Spacing.sm, justifyContent: 'flex-end',marginTop: 16 },
    modalBtn: { paddingHorizontal: Spacing.md, paddingVertical: 10, borderRadius: Radius.sm },
    modalBtnCancel: { backgroundColor: Colors.surfaceElevated },
    modalBtnCreate: { backgroundColor: Colors.accent },
    modalBtnCancelText: { color: Colors.textSecondary, fontWeight: '600' },
    modalBtnCreateText: { color: Colors.bg, fontWeight: '600' },
});
