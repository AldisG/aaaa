// Powered by OnSpace.AI
import { NoteFile, StrokePath, createNewPage, getNote, saveNote } from '@/services/notesService';
import React, { ReactNode, createContext, useCallback, useContext, useState } from 'react';

interface NotesContextType {
  currentNote: NoteFile | null;
  currentPageIndex: number;
  setCurrentNote: (note: NoteFile | null) => void;
  setCurrentPageIndex: (idx: number) => void;
  addPage: () => void;
  updatePageStrokes: (pageId: string, strokes: StrokePath[]) => void;
  updateNoteTitle: (title: string) => void;
  saveCurrentNote: () => Promise<void>;
  loadNote: (id: string) => Promise<void>;
  updatePageBackground: (pageId: string, type: 'lined' | 'blank' | 'custom', imageUri?: string) => void;
  updatePageThumbnail: (pageId: string, uri: string) => void;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export function NotesProvider({ children }: { children: ReactNode }) {
  const [currentNote, setCurrentNote] = useState<NoteFile | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const loadNote = useCallback(async (id: string) => {
    const note = await getNote(id);
    if (note) {
      setCurrentNote(note);
      setCurrentPageIndex(0);
    }
  }, []);

  const saveCurrentNote = useCallback(async () => {
    if (currentNote) {
      await saveNote(currentNote);
    }
  }, [currentNote]);

  const addPage = useCallback(() => {
    if (!currentNote) return;
    const newPage = createNewPage();
    const updated = {
      ...currentNote,
      pages: [...currentNote.pages, newPage],
    };
    setCurrentNote(updated);
    setCurrentPageIndex(updated.pages.length - 1);
  }, [currentNote]);

  const updatePageStrokes = useCallback((pageId: string, strokes: StrokePath[]) => {
    if (!currentNote) return;
    setCurrentNote(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        pages: prev.pages.map(p => p.id === pageId ? { ...p, strokes } : p),
      };
    });
  }, [currentNote]);

  const updateNoteTitle = useCallback((title: string) => {
    setCurrentNote(prev => prev ? { ...prev, title } : prev);
  }, []);

  const updatePageBackground = useCallback((pageId: string, type: 'lined' | 'blank' | 'custom', imageUri?: string) => {
    setCurrentNote(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        pages: prev.pages.map(p =>
          p.id === pageId ? { ...p, backgroundType: type, backgroundImageUri: imageUri } : p
        ),
      };
    });
  }, []);

  const updatePageThumbnail = useCallback((pageId: string, uri: string) => {
    setCurrentNote(prev => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        pages: prev.pages.map(p => p.id === pageId ? { ...p, thumbnail: uri } : p),
        thumbnail: uri,
      };
      return updated;
    });
  }, []);

  return (
    <NotesContext.Provider value={{
      currentNote,
      currentPageIndex,
      setCurrentNote,
      setCurrentPageIndex,
      addPage,
      updatePageStrokes,
      updateNoteTitle,
      saveCurrentNote,
      loadNote,
      updatePageBackground,
      updatePageThumbnail,
    }}>
      {children}
    </NotesContext.Provider>
  );
}

export function useNotesContext() {
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error('useNotesContext must be used within NotesProvider');
  return ctx;
}
