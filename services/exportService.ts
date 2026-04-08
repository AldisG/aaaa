// Powered by OnSpace.AI
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { NoteFile } from './notesService';

export async function exportPageAsPNG(base64: string, noteName: string, pageNum: number): Promise<void> {
  try {
    const dir = FileSystem.documentDirectory + 'exports/';
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    const path = dir + `${noteName.replace(/\s+/g, '_')}_page${pageNum}_${Date.now()}.png`;
    await FileSystem.writeAsStringAsync(path, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(path, {
        mimeType: 'image/png',
        dialogTitle: `Share ${noteName} - Page ${pageNum}`,
      });
    }
  } catch (e) {
    throw new Error('Failed to export PNG: ' + String(e));
  }
}

export async function exportPageAsJPG(base64: string, noteName: string, pageNum: number): Promise<void> {
  try {
    const dir = FileSystem.documentDirectory + 'exports/';
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    const path = dir + `${noteName.replace(/\s+/g, '_')}_page${pageNum}_${Date.now()}.jpg`;
    await FileSystem.writeAsStringAsync(path, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(path, {
        mimeType: 'image/jpeg',
        dialogTitle: `Share ${noteName} - Page ${pageNum}`,
      });
    }
  } catch (e) {
    throw new Error('Failed to export JPG: ' + String(e));
  }
}

export async function exportNoteAsPDF(
  note: NoteFile,
  pageSnapshots: { [pageId: string]: string },
): Promise<void> {
  try {
    const pageHtml = note.pages.map((page, i) => {
      const snap = pageSnapshots[page.id];
      const imgTag = snap
        ? `<img src="data:image/png;base64,${snap}" style="width:100%;height:100%;object-fit:contain;" />`
        : `<div style="background:#FFF8F0;width:100%;height:100%;"></div>`;
      return `
        <div style="page-break-after: ${i < note.pages.length - 1 ? 'always' : 'avoid'};
          width:210mm;height:297mm;position:relative;background:#FFF8F0;">
          ${imgTag}
          <p style="position:absolute;bottom:10px;right:20px;color:#999;font-size:10px;">
            ${note.title} — Page ${i + 1}
          </p>
        </div>
      `;
    }).join('');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { margin: 0; padding: 0; font-family: sans-serif; }
            @page { size: A4; margin: 0; }
          </style>
        </head>
        <body>${pageHtml}</body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html, base64: false });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: `Share ${note.title}`,
      });
    }
  } catch (e) {
    throw new Error('Failed to export PDF: ' + String(e));
  }
}
