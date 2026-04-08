// Powered by OnSpace.AI
import { renderNote } from '@/components/feature/NoteElement';
import { Colors, Radius, Shadow, Spacing, Typography } from '@/constants/theme';
import { useNotesContext } from '@/contexts/NotesContext';
import { NoNoteThumbnail } from '@/fractions/noNoteThumbnail';
import { useNotesList } from '@/hooks/useNotes';
import { NoteFile, createNewNote, saveNote } from '@/services/notesService';
import { MaterialIcons } from '@expo/vector-icons';
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
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotesListScreen() {
    const router = useRouter();
    const { notes, loading, load, removeNote } = useNotesList();
    const { setCurrentNote } = useNotesContext();
    const [showNewModal, setShowNewModal] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [searchText, setSearchText] = useState('');

    const { width } = Dimensions.get('window');
    const CARD_WIDTH = (width - Spacing.md * 3);

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
        return renderNote(item, CARD_WIDTH, openNote, handleDelete )
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
                NoNoteThumbnail(setNewTitle,setShowNewModal)
            ) : (
                // Actual Note Thumbnail items - need to rework this trash
                <FlatList
                    data={filtered}
                    renderItem={noteThumbnailItem}
                    keyExtractor={item => item.id}
                    numColumns={2}
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
                            style={styles.inputStyles}
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
    inputStyles: {
        color: Colors.textPrimary,
        padding: 8,
        backgroundColor: Colors.bg,
        borderRadius: 8
    }
});
