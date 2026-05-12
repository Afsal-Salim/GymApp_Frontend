'use client';

import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import RestartAltOutlinedIcon from '@mui/icons-material/RestartAltOutlined';
import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import type { Component, Editor } from 'grapesjs';
import './WebsiteBuilderTextStylesPanel.css';
import {
  TEXT_STYLE_SECTIONS,
  type TextStylePreset,
} from '@/features/website/editor/left-column/WebsiteBuilderTextStylesPanel/textStylePresets';

type Props = {
  editor: Editor | null;
};

/**
 * Style keys cleared every time a preset is applied so the new design
 * doesn't compound with whatever the previous preset left behind
 * (e.g. switching from "Matrix" → "Sunset" must clear the monospace
 * font-family; switching from "Outline" → "Gradient" must clear the
 * text stroke; etc.).
 */
const RESET_KEYS = [
  'background',
  'background-image',
  'background-color',
  'background-size',
  'background-clip',
  '-webkit-background-clip',
  'color',
  '-webkit-text-fill-color',
  'text-shadow',
  '-webkit-text-stroke',
  '-webkit-text-stroke-width',
  '-webkit-text-stroke-color',
  'text-stroke',
  'filter',
  'mix-blend-mode',
  'letter-spacing',
  'font-family',
];

/**
 * Inline / phrasing tags whose visible text we can repaint with gradient,
 * outline, glow, etc. Containers (`section`, `div`, `article`, …) and
 * interactive widgets that own their own background (`a`, `button`,
 * `input`, …) are deliberately excluded — applying a background-clip
 * gradient on those breaks their existing chrome.
 */
const TEXT_STYLEABLE_TAGS = new Set([
  'p',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'span',
  'strong',
  'em',
  'b',
  'i',
  'u',
  'small',
  'mark',
  'cite',
  'code',
  'time',
  'abbr',
  'output',
  'q',
  'blockquote',
  'figcaption',
  'label',
  'li',
  'dt',
  'dd',
  'td',
  'th',
  'summary',
  'caption',
]);

export function isTextStyleableTagName(tag: string | undefined | null): boolean {
  if (!tag) return false;
  return TEXT_STYLEABLE_TAGS.has(tag.toLowerCase());
}

/**
 * `backgroundImage` → `background-image`; `WebkitBackgroundClip` → `-webkit-background-clip`.
 *
 * GrapesJS stores styles as a kebab-case `Record<string,string>` (see Style Manager / `getStyle()`),
 * so we cannot hand it React CSSProperties (camelCase) directly.
 */
function reactStyleToGrapesPatch(style: CSSProperties): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(style)) {
    if (v == null || v === '') continue;
    const kebab = k.replace(/([A-Z])/g, '-$1').toLowerCase();
    out[kebab] = typeof v === 'number' ? String(v) : v;
  }
  return out;
}

/**
 * Returns the currently-selected component IF it's an inline / phrasing
 * text element we can repaint. For anything else (or no selection),
 * returns `null` so the panel can show its empty state instead of
 * silently mutating the wrong node.
 */
function getStyleableTextSelection(editor: Editor | null): Component | null {
  if (!editor) return null;
  const sel = editor.getSelected();
  if (!sel) return null;
  const tag = String(sel.get('tagName') || '').toLowerCase();
  if (isTextStyleableTagName(tag)) return sel;
  return null;
}

function applyPresetToComponent(comp: Component, preset: TextStylePreset) {
  const prev = { ...(comp.getStyle?.() as Record<string, string> | undefined) } as Record<string, string>;
  for (const key of RESET_KEYS) delete prev[key];
  Object.assign(prev, reactStyleToGrapesPatch(preset.style));
  comp.setStyle(prev);
}

function clearTextDesign(comp: Component) {
  const prev = { ...(comp.getStyle?.() as Record<string, string> | undefined) } as Record<string, string>;
  for (const key of RESET_KEYS) delete prev[key];
  comp.setStyle(prev);
}

export function WebsiteBuilderTextStylesPanel({ editor }: Props) {
  /**
   * `selectionTick` re-evaluates `getStyleableTextSelection` whenever a Grapes
   * selection event fires; we don't need to store the component itself in state
   * (Grapes keeps the live reference; storing it could go stale on undo/redo).
   */
  const [selectionTick, setSelectionTick] = useState(0);

  useEffect(() => {
    if (!editor) return;
    const bump = () => setSelectionTick((t) => t + 1);
    editor.on('component:selected', bump);
    editor.on('component:deselected', bump);
    editor.on('component:update', bump);
    return () => {
      editor.off('component:selected', bump);
      editor.off('component:deselected', bump);
      editor.off('component:update', bump);
    };
  }, [editor]);

  const targetComp = useMemo(
    () => getStyleableTextSelection(editor),
    // selectionTick triggers re-evaluation when Grapes selection changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editor, selectionTick],
  );

  const { previewLabel, targetNoun } = useMemo(() => {
    if (!targetComp) return { previewLabel: 'Aa', targetNoun: 'text' };
    const tag = String(targetComp.get('tagName') || '').toLowerCase();
    if (/^h[1-6]$/.test(tag)) return { previewLabel: 'Heading', targetNoun: 'heading' };
    if (tag === 'p') return { previewLabel: 'Aa', targetNoun: 'paragraph' };
    return { previewLabel: 'Aa', targetNoun: 'text' };
  }, [targetComp]);

  if (!targetComp) {
    return (
      <div className="wb-text-styles">
        <div className="wb-text-styles__empty">
          <AutoAwesomeOutlinedIcon className="wb-text-styles__empty-ico" aria-hidden />
          <p className="wb-text-styles__empty-title">Select a text to style it</p>
          <p className="wb-text-styles__empty-sub">
            Click any text on the canvas — paragraph, heading, span or list item — then pick a designed look from this panel.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="wb-text-styles">
      <div className="wb-text-styles__intro">
        <p className="wb-text-styles__intro-text">
          Tap a style to apply it to the selected <strong>{targetNoun}</strong>.
        </p>
        <button
          type="button"
          className="wb-text-styles__reset"
          onClick={() => clearTextDesign(targetComp)}
          title="Clear gradient, outline, shadow and color from the selected text"
        >
          <RestartAltOutlinedIcon fontSize="small" aria-hidden />
          <span>Clear</span>
        </button>
      </div>

      {TEXT_STYLE_SECTIONS.map((section) => (
        <section
          key={section.id}
          className="wb-text-styles__section"
          aria-labelledby={`wb-text-styles-section-${section.id}`}
        >
          <h3
            id={`wb-text-styles-section-${section.id}`}
            className="wb-text-styles__section-label"
          >
            {section.label}
          </h3>
          <div className="wb-text-styles__grid" role="list">
            {section.presets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className="wb-text-styles__tile"
                role="listitem"
                title={preset.hint}
                onClick={() => applyPresetToComponent(targetComp, preset)}
              >
                <span className="wb-text-styles__tile-preview" style={preset.style} aria-hidden>
                  {previewLabel}
                </span>
                <span className="wb-text-styles__tile-label">{preset.label}</span>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
