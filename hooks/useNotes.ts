// Powered by OnSpace.AI
import { NoteFile, createNewNote, deleteNote, getAllNotes, saveNote } from '@/services/notesService';
import { useCallback, useEffect, useState } from 'react';

export function useNotesList() {
  const [notes, setNotes] = useState<NoteFile[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const all = await getAllNotes();
    setNotes(all);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createNote = useCallback(async (title?: string) => {
    const note = createNewNote(title);
    await saveNote(note);
    setNotes(prev => [note, ...prev]);
    return note;
  }, []);

  const removeNote = useCallback(async (id: string) => {
    await deleteNote(id);
    setNotes(prev => prev.filter(n => n.id !== id));
  }, []);

  const updateNote = useCallback(async (note: NoteFile) => {
    await saveNote(note);
    setNotes(prev => prev.map(n => n.id === note.id ? note : n));
  }, []);

  return { notes, loading, load, createNote, removeNote, updateNote };
}
