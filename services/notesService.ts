// Powered by OnSpace.AI
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

export interface StrokePath {
  points: { x: number; y: number }[];
  color: string;
  width: number;
  opacity: number;
  tool: 'pen' | 'pencil' | 'marker';
}

export interface NotePage {
  id: string;
  strokes: StrokePath[];
  backgroundType: 'lined' | 'blank' | 'custom';
  backgroundImageUri?: string;
  thumbnail?: string;
}

export interface NoteFile {
  id: string;
  title: string;
  pages: NotePage[];
  createdAt: number;
  updatedAt: number;
  thumbnail?: string;
}

const NOTES_INDEX_KEY = '@inknotes_index';
const NOTE_PREFIX = '@inknotes_note_';

export async function getAllNotes(): Promise<NoteFile[]> {
  try {
    const indexJson = await AsyncStorage.getItem(NOTES_INDEX_KEY);
    if (!indexJson) return [];
    const ids: string[] = JSON.parse(indexJson);
    const notes: NoteFile[] = [];
    for (const id of ids) {
      const noteJson = await AsyncStorage.getItem(NOTE_PREFIX + id);
      if (noteJson) {
        notes.push(JSON.parse(noteJson));
      }
    }
    return notes.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}

export async function getNote(id: string): Promise<NoteFile | null> {
  try {
    const noteJson = await AsyncStorage.getItem(NOTE_PREFIX + id);
    if (!noteJson) return null;
    return JSON.parse(noteJson);
  } catch {
    return null;
  }
}

export async function saveNote(note: NoteFile): Promise<void> {
  try {
    note.updatedAt = Date.now();
    await AsyncStorage.setItem(NOTE_PREFIX + note.id, JSON.stringify(note));
    const indexJson = await AsyncStorage.getItem(NOTES_INDEX_KEY);
    const ids: string[] = indexJson ? JSON.parse(indexJson) : [];
    if (!ids.includes(note.id)) {
      ids.unshift(note.id);
      await AsyncStorage.setItem(NOTES_INDEX_KEY, JSON.stringify(ids));
    }
  } catch (e) {
    console.error('Failed to save note', e);
  }
}

export async function deleteNote(id: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(NOTE_PREFIX + id);
    const indexJson = await AsyncStorage.getItem(NOTES_INDEX_KEY);
    const ids: string[] = indexJson ? JSON.parse(indexJson) : [];
    const updated = ids.filter(i => i !== id);
    await AsyncStorage.setItem(NOTES_INDEX_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete note', e);
  }
}

export function createNewNote(title: string = 'Untitled Note'): NoteFile {
  const id = `note_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  return {
    id,
    title,
    pages: [createNewPage()],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function createNewPage(): NotePage {
  return {
    id: `page_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    strokes: [],
    backgroundType: 'lined',
  };
}

export async function savePageThumbnail(noteId: string, pageIndex: number, base64: string): Promise<string> {
  const dir = FileSystem.documentDirectory + 'thumbnails/';
  await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  const path = dir + `${noteId}_page${pageIndex}.jpg`;
  await FileSystem.writeAsStringAsync(path, base64, { encoding: FileSystem.EncodingType.Base64 });
  return path;
}

export async function saveExportedFile(noteId: string, format: string, base64: string): Promise<string> {
  const dir = FileSystem.documentDirectory + 'exports/';
  await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  const path = dir + `${noteId}_export_${Date.now()}.${format.toLowerCase()}`;
  await FileSystem.writeAsStringAsync(path, base64, { encoding: FileSystem.EncodingType.Base64 });
  return path;
}
