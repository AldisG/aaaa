// Powered by OnSpace.AI
import ColorPickerModal from '@/components/feature/ColorPickerModal';
import DrawingCanvas, { DrawingCanvasRef, ToolType } from '@/components/feature/DrawingCanvas';
import OptionsMenu from '@/components/feature/OptionsMenu';
import PageNavigator from '@/components/feature/PageNavigator';
import ToolBar from '@/components/feature/ToolBar';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useNotesContext } from '@/contexts/NotesContext';
import { exportNoteAsPDF, exportPageAsJPG, exportPageAsPNG } from '@/services/exportService';
import { StrokePath } from '@/services/notesService';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NoteEditorScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const {
    currentNote,
    currentPageIndex,
    setCurrentPageIndex,
    addPage,
    updatePageStrokes,
    updateNoteTitle,
    saveCurrentNote,
    loadNote,
    updatePageBackground,
  } = useNotesContext();

  const [currentTool, setCurrentTool] = useState<ToolType>('pen');
  const [currentColor, setCurrentColor] = useState('#1A1A1A');
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [customSwatches, setCustomSwatches] = useState<string[]>([]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);

  const canvasRef = useRef<DrawingCanvasRef>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pageSnapshotsRef = useRef<{ [pageId: string]: string }>({});

  useEffect(() => {
    if (id && (!currentNote || currentNote.id !== id)) {
      loadNote(id as string);
    }
  }, [id]);

  const currentPage = currentNote?.pages[currentPageIndex];

  const handleStrokesChange = useCallback((strokes: StrokePath[]) => {
    if (!currentPage) return;
    updatePageStrokes(currentPage.id, strokes);
    // Auto-save debounced
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      saveCurrentNote();
    }, 2000);
  }, [currentPage, updatePageStrokes, saveCurrentNote]);

  const handleManualSave = useCallback(async () => {
    setIsSaving(true);
    await saveCurrentNote();
    setTimeout(() => setIsSaving(false), 1000);
  }, [saveCurrentNote]);

  const captureCurrentPage = useCallback(async () => {
    const b64 = await canvasRef.current?.captureSnapshot();
    if (b64 && currentPage) {
      pageSnapshotsRef.current[currentPage.id] = b64;
    }
    return b64;
  }, [currentPage]);

  const handleSetBackground = useCallback(async () => {
    if (!currentPage) return;
  //   showAlert('Page Background', 'Choose background style', [
  //     { text: 'Lined', onPress: () => updatePageBackground(currentPage.id, 'lined') },
  //     { text: 'Blank', onPress: () => updatePageBackground(currentPage.id, 'blank') },
  //     {
  //       text: 'Custom Image', onPress: async () => {
  //         const result = await ImagePicker.launchImageLibraryAsync({
  //           mediaTypes: ImagePicker.MediaTypeOptions.Images,
  //           quality: 0.8,
  //         });
  //         if (!result.canceled && result.assets[0]) {
  //           updatePageBackground(currentPage.id, 'custom', result.assets[0].uri);
  //         }
  //       },
  //     },
  //     { text: 'Cancel', style: 'cancel' },
  //   ]);
  //   setShowOptions(false);
  // }, [currentPage, showAlert, updatePageBackground]);
  }, [])

  const handleExportPNG = useCallback(async () => {
    if (!currentNote || !currentPage) return;
    setIsExporting(true);
    setShowOptions(false);
    try {
      const b64 = await captureCurrentPage();
      if (b64) {
        await exportPageAsPNG(b64, currentNote.title, currentPageIndex + 1);
      }
    } catch (e) {
      // showAlert('Export Failed', String(e));
    } finally {
      setIsExporting(false);
    }
  }, [currentNote, currentPage, currentPageIndex, captureCurrentPage]);

  const handleExportJPG = useCallback(async () => {
    if (!currentNote || !currentPage) return;
    setIsExporting(true);
    setShowOptions(false);
    try {
      const b64 = await captureCurrentPage();
      if (b64) {
        await exportPageAsJPG(b64, currentNote.title, currentPageIndex + 1);
      }
    } catch (e) {
      // showAlert('Export Failed', String(e));
    } finally {
      setIsExporting(false);
    }
  }, [currentNote, currentPage, currentPageIndex, captureCurrentPage]);

  const handleExportPDF = useCallback(async () => {
    if (!currentNote) return;
    setIsExporting(true);
    setShowOptions(false);
    try {
      const b64 = await captureCurrentPage();
      if (b64 && currentPage) {
        pageSnapshotsRef.current[currentPage.id] = b64;
      }
      await exportNoteAsPDF(currentNote, pageSnapshotsRef.current);
    } catch (e) {
      // showAlert('Export Failed', String(e));
    } finally {
      setIsExporting(false);
    }
  }, [currentNote, currentPage, captureCurrentPage]);

  const handleClearPage = useCallback(() => {
    // showAlert('Clear Page', 'Erase all strokes on this page?', [
    //   { text: 'Cancel', style: 'cancel' },
    //   { text: 'Clear', style: 'destructive', onPress: () => canvasRef.current?.clear() },
    // ]);
    setShowOptions(false);
  }, []);

  const menuOptions = [
    { icon: 'save', label: 'Save Now', sublabel: 'Manually save your note', action: () => { handleManualSave(); setShowOptions(false); } },
    { icon: 'image', label: 'Page Background', sublabel: 'Lined, blank, or custom image', action: handleSetBackground },
    { icon: 'photo', label: 'Export Current Page as PNG', action: handleExportPNG },
    { icon: 'photo-camera', label: 'Export Current Page as JPG', action: handleExportJPG },
    { icon: 'picture-as-pdf', label: 'Export Full Note as PDF', sublabel: 'All pages combined', action: handleExportPDF },
    { icon: 'delete-sweep', label: 'Clear Page', sublabel: 'Erase all strokes', action: handleClearPage, danger: true },
  ];

  if (!currentNote || !currentPage) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.loading}>
          <Text style={{ color: Colors.textSecondary }}>Loading note...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.headerBtn, pressed && { opacity: 0.7 }]}
          onPress={() => {
            handleManualSave();
            router.back();
          }}
        >
          <MaterialIcons name="arrow-back" size={24} color={Colors.textPrimary} />
        </Pressable>

        <View style={styles.titleArea}>
          {editingTitle ? (
            <TextInput
              style={styles.titleInput}
              value={currentNote.title}
              onChangeText={updateNoteTitle}
              onBlur={() => setEditingTitle(false)}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={() => setEditingTitle(false)}
            />
          ) : (
            <Pressable onPress={() => setEditingTitle(true)}>
              <Text style={styles.titleText} numberOfLines={1}>{currentNote.title}</Text>
            </Pressable>
          )}
          <Text style={styles.pageIndicator}>
            Page {currentPageIndex + 1} / {currentNote.pages.length}
          </Text>
        </View>

        <View style={styles.headerRight}>
          {isSaving ? (
            <MaterialIcons name="cloud-done" size={20} color={Colors.success} />
          ) : (
            <Pressable
              style={({ pressed }) => [styles.headerBtn, pressed && { opacity: 0.7 }]}
              onPress={handleManualSave}
            >
              <MaterialIcons name="save" size={22} color={Colors.textSecondary} />
            </Pressable>
          )}
          <Pressable
            style={({ pressed }) => [styles.headerBtn, pressed && { opacity: 0.7 }]}
            onPress={() => setShowOptions(true)}
          >
            <MaterialIcons name="more-vert" size={22} color={Colors.textPrimary} />
          </Pressable>
        </View>
      </View>

      {/* Canvas */}
      <View style={styles.canvasArea}>
        <DrawingCanvas
          ref={canvasRef}
          strokes={currentPage.strokes}
          currentColor={currentColor}
          currentTool={currentTool}
          strokeWidth={strokeWidth}
          onStrokesChange={handleStrokesChange}
          backgroundType={currentPage.backgroundType}
          backgroundImageUri={currentPage.backgroundImageUri}
          onUndoRedoChange={(u, r) => { setCanUndo(u); setCanRedo(r); }}
        />
      </View>

      {/* Toolbar */}
      <ToolBar
        currentTool={currentTool}
        currentColor={currentColor}
        strokeWidth={strokeWidth}
        canUndo={canUndo}
        canRedo={canRedo}
        customSwatches={customSwatches}
        onToolChange={setCurrentTool}
        onColorChange={setCurrentColor}
        onStrokeWidthChange={setStrokeWidth}
        onOpenColorPicker={() => setShowColorPicker(true)}
        onUndo={() => canvasRef.current?.undo()}
        onRedo={() => canvasRef.current?.redo()}
      />

      {/* Page Navigator */}
      <PageNavigator
        pages={currentNote.pages}
        currentIndex={currentPageIndex}
        onPageChange={(idx) => {
          handleManualSave();
          setCurrentPageIndex(idx);
        }}
        onAddPage={() => {
          handleManualSave();
          addPage();
        }}
      />

      {/* Color Picker */}
      <ColorPickerModal
        visible={showColorPicker}
        onClose={() => setShowColorPicker(false)}
        currentColor={currentColor}
        customSwatches={customSwatches}
        onColorChange={setCurrentColor}
        onSaveSwatch={(c) => {
          if (!customSwatches.includes(c)) {
            setCustomSwatches(prev => [c, ...prev.slice(0, 7)]);
          }
        }}
      />

      {/* Options Menu */}
      <OptionsMenu
        visible={showOptions}
        onClose={() => setShowOptions(false)}
        options={menuOptions}
        loading={isExporting}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleArea: { flex: 1 },
  titleText: { ...Typography.h3, color: Colors.textPrimary, fontSize: 17 },
  titleInput: {
    ...Typography.h3,
    color: Colors.textPrimary,
    fontSize: 17,
    borderBottomWidth: 1,
    borderBottomColor: Colors.accent,
    paddingVertical: 2,
  },
  pageIndicator: { ...Typography.caption, color: Colors.textMuted, marginTop: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  canvasArea: { flex: 1 },
});
