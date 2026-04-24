import type { Editor } from 'grapesjs';
import {
  blockPaletteDragMimePresent,
  insertBlockById,
  insertBlockByIdAtFrameClientPoint,
  readBlockIdFromPaletteDrag,
} from './websiteBuilderComponentCatalog';

type FrameLike = {
  view?: {
    getDoc?: () => Document | null | undefined;
  };
};

function collectFrameDocuments(editor: Editor): Document[] {
  const byRef = new Map<Document, Document>();
  const add = (doc: Document | null | undefined) => {
    if (doc) byRef.set(doc, doc);
  };

  add(editor.Canvas.getDocument());

  try {
    const frames = (editor.Canvas as unknown as { getFrames?: () => FrameLike[] }).getFrames?.();
    if (Array.isArray(frames)) {
      for (const fr of frames) {
        add(fr?.view?.getDoc?.() ?? undefined);
      }
    }
  } catch {
    /* ignore */
  }

  return [...byRef.keys()];
}

const dragOpts: AddEventListenerOptions = { capture: true };

/**
 * Accept HTML5 drags from the components palette / library (`setBlockDragTransferData`) and insert the block.
 */
export function attachCanvasBlockPaletteDrop(editor: Editor): () => void {
  let detachFns: Array<() => void> = [];

  const detachFrameListeners = () => {
    for (const off of detachFns) off();
    detachFns = [];
  };

  const onDragOver = (e: DragEvent) => {
    const dt = e.dataTransfer;
    if (!dt || !blockPaletteDragMimePresent(dt)) return;
    e.preventDefault();
    dt.dropEffect = 'copy';
  };

  const onDrop = (e: DragEvent) => {
    const dt = e.dataTransfer;
    if (!dt || !blockPaletteDragMimePresent(dt)) return;
    e.preventDefault();
    e.stopPropagation();
    const id = readBlockIdFromPaletteDrag(dt);
    if (!id) return;
    const frameDoc = e.currentTarget as Document;
    let inserted =
      frameDoc?.nodeType === 9 ?
        insertBlockByIdAtFrameClientPoint(editor, id, frameDoc, e.clientX, e.clientY)
      : undefined;
    if (!inserted) inserted = insertBlockById(editor, id);
    if (!inserted) return;
    queueMicrotask(() => {
      try {
        editor.select(inserted);
      } catch {
        /* ignore */
      }
    });
  };

  const attachToFrame = () => {
    detachFrameListeners();
    for (const doc of collectFrameDocuments(editor)) {
      doc.addEventListener('dragover', onDragOver, dragOpts);
      doc.addEventListener('drop', onDrop, dragOpts);
      detachFns.push(() => doc.removeEventListener('dragover', onDragOver, dragOpts));
      detachFns.push(() => doc.removeEventListener('drop', onDrop, dragOpts));
    }
  };

  editor.on('canvas:frame:load', attachToFrame);
  editor.on('canvas:frame:load:body', attachToFrame);
  editor.on('load', attachToFrame);
  queueMicrotask(attachToFrame);
  const t = window.setTimeout(attachToFrame, 400);

  const onUnload = () => {
    detachFrameListeners();
  };
  editor.on('canvas:frame:unload', onUnload);

  return () => {
    window.clearTimeout(t);
    editor.off('canvas:frame:load', attachToFrame);
    editor.off('canvas:frame:load:body', attachToFrame);
    editor.off('load', attachToFrame);
    editor.off('canvas:frame:unload', onUnload);
    detachFrameListeners();
  };
}
