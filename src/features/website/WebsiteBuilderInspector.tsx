'use client';

import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import DesktopWindowsOutlinedIcon from '@mui/icons-material/DesktopWindowsOutlined';
import TabletMacOutlinedIcon from '@mui/icons-material/TabletMacOutlined';
import PhoneIphoneOutlinedIcon from '@mui/icons-material/PhoneIphoneOutlined';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Component, Editor } from 'grapesjs';
import type { InspectorKind, SelectionInfo } from './websiteBuilderInspector';
import { findOne, getDirectText, getHeroContent, setDirectText } from './websiteBuilderInspector';

export type InspectorTab = 'content' | 'design' | 'advanced';

type Props = {
  editor: Editor | null;
  selection: SelectionInfo | null;
  tab: InspectorTab;
  onTabChange: (t: InspectorTab) => void;
};

const SECTION_TYPES = ['Hero', 'About', 'Services', 'Pricing', 'Contact', 'Custom'] as const;

function sliceMax(s: string, max: number) {
  return s.length > max ? s.slice(0, max) : s;
}

function InspectorEmpty() {
  return (
    <div className="website-builder-page__inspector-empty">
      <p className="website-builder-page__inspector-empty-title">Nothing selected</p>
      <p className="website-builder-page__inspector-empty-text">
        Click a section, heading, button, or block on the canvas to edit its content, design, and advanced settings here.
      </p>
    </div>
  );
}

function WrapperHint() {
  return (
    <div className="website-builder-page__inspector-empty">
      <p className="website-builder-page__inspector-empty-title">Page</p>
      <p className="website-builder-page__inspector-empty-text">
        Select a specific element on the page to see section-specific controls. The page frame itself has no editable properties in this panel.
      </p>
    </div>
  );
}

type HeroBg = 'image' | 'video' | 'slider' | 'color';

export function WebsiteBuilderInspector({ editor, selection, tab, onTabChange }: Props) {
  const selected = useMemo(() => {
    if (!editor || !selection || selection.kind === 'wrapper') return null;
    return editor.getSelected() ?? null;
  }, [editor, selection]);

  const panelTitle = selection?.kind === 'wrapper' ? 'Inspector' : (selection?.title ?? 'Edit section');

  const closePanel = useCallback(() => {
    const ed = editor;
    if (!ed) return;
    const w = ed.getWrapper();
    if (w) ed.select(w);
  }, [editor]);

  const showStylesDock = tab === 'design' && selection && selection.kind !== 'hero';
  const showAdvancedDock = tab === 'advanced';

  return (
    <>
      <div className="website-builder-page__panel-head">
        <strong className="website-builder-page__panel-title">{panelTitle}</strong>
        <button type="button" className="website-builder-page__panel-close" aria-label="Close panel" onClick={closePanel}>
          ×
        </button>
      </div>
      <div className="website-builder-page__inspector-tabs website-builder-page__inspector-tabs--icons">
        <button
          type="button"
          className={`website-builder-page__inspector-tab${tab === 'content' ? ' is-active' : ''}`}
          onClick={() => onTabChange('content')}
        >
          <ArticleOutlinedIcon className="website-builder-page__inspector-tab-icon" fontSize="small" />
          <span>Content</span>
        </button>
        <button
          type="button"
          className={`website-builder-page__inspector-tab${tab === 'design' ? ' is-active' : ''}`}
          onClick={() => onTabChange('design')}
        >
          <PaletteOutlinedIcon className="website-builder-page__inspector-tab-icon" fontSize="small" />
          <span>Design</span>
        </button>
        <button
          type="button"
          className={`website-builder-page__inspector-tab${tab === 'advanced' ? ' is-active' : ''}`}
          onClick={() => onTabChange('advanced')}
        >
          <SettingsOutlinedIcon className="website-builder-page__inspector-tab-icon" fontSize="small" />
          <span>Advanced</span>
        </button>
      </div>

      <div className="website-builder-page__panel-body website-builder-page__panel-body--inspector">
        {!selection || selection.kind === 'wrapper' ?
          selection?.kind === 'wrapper' ?
            <WrapperHint />
          : <InspectorEmpty />
        : tab === 'content' ?
          <ContentPanel editor={editor} selection={selection} selected={selected ?? undefined} />
        : tab === 'design' ?
          <DesignPanel selection={selection} selected={selected ?? undefined} />
        : <AdvancedPanelForm selected={selected ?? undefined} />}

        {/* Grapes append targets — always mounted so the editor can bind; visibility follows tab + selection */}
        <div hidden={!showStylesDock} className="website-builder-page__gjs-dock">
          <p className="website-builder-page__field-hint website-builder-page__gjs-dock-title">Style manager</p>
          <div id="wb-styles" className="website-builder-page__gjs-styles-host" />
        </div>
        <div hidden={!showAdvancedDock} className="website-builder-page__gjs-dock">
          <p className="website-builder-page__field-hint">Motion presets (traits)</p>
          <div id="wb-traits" className="website-builder-page__traits-host" />
        </div>
        {tab === 'advanced' && selection && selection.kind !== 'wrapper' ?
          <button type="button" className="website-builder-page__save-section-btn website-builder-page__save-section-btn--after-dock">
            Save Section
          </button>
        : null}
      </div>
    </>
  );
}

function ContentPanel({
  editor,
  selection,
  selected,
}: {
  editor: Editor | null;
  selection: SelectionInfo;
  selected: ReturnType<Editor['getSelected']>;
}) {
  if (!editor || !selected) return <InspectorEmpty />;

  if (selection.kind === 'hero') {
    return <HeroContent key={selection.cid} root={selected} />;
  }
  if (selection.kind === 'heading') {
    return <HeadingContent comp={selected} />;
  }
  if (selection.kind === 'text') {
    return <TextContent comp={selected} />;
  }
  if (selection.kind === 'button') {
    return <ButtonContent comp={selected} />;
  }
  if (selection.kind === 'pushButton') {
    return <PushButtonContent comp={selected} />;
  }
  if (selection.kind === 'iframe') {
    return <IframeContent comp={selected} />;
  }
  if (selection.kind === 'div') {
    return <DivBlockContent />;
  }
  if (selection.kind === 'image') {
    return <ImageContent comp={selected} />;
  }
  if (selection.kind === 'nav') {
    return <NavContent />;
  }
  if (selection.kind === 'section') {
    return <SectionContent root={selected} />;
  }
  return <GenericContent comp={selected} kind={selection.kind} />;
}

function HeroContent({ root }: { root: NonNullable<ReturnType<Editor['getSelected']>> }) {
  const [sectionType, setSectionType] = useState('Hero');
  const [heading, setHeading] = useState('');
  const [subheading, setSubheading] = useState('');
  const [btnText, setBtnText] = useState('');
  const [btnHref, setBtnHref] = useState('#');
  const [bgType, setBgType] = useState<HeroBg>('image');
  const [overlayOn, setOverlayOn] = useState(true);
  const [overlayPct, setOverlayPct] = useState(60);

  const reload = useCallback(() => {
    const { h1, sub, link } = getHeroContent(root);
    setHeading(h1 ? getDirectText(h1) : '');
    setSubheading(sub ? getDirectText(sub) : '');
    setBtnText(link ? getDirectText(link) : '');
    setBtnHref(String(link?.getAttributes?.().href ?? '#'));
    const attrs = root.getAttributes?.() ?? {};
    const st = (attrs['data-wb-section-type'] ?? 'Hero').trim();
    if (SECTION_TYPES.includes(st as (typeof SECTION_TYPES)[number])) setSectionType(st);
    else setSectionType('Custom');
    const ot = (attrs['data-wb-bg-type'] ?? 'image').trim();
    if (ot === 'video' || ot === 'slider' || ot === 'color') setBgType(ot);
    else setBgType('image');
    setOverlayOn(attrs['data-wb-overlay'] !== 'off');
    const op = Number(attrs['data-wb-overlay-opacity'] ?? 60);
    setOverlayPct(Number.isFinite(op) ? Math.min(100, Math.max(0, op)) : 60);
  }, [root]);

  useEffect(() => {
    reload();
  }, [reload]);

  const applyHeading = (v: string) => {
    const t = sliceMax(v, 80);
    setHeading(t);
    const h1 = findOne(root, 'h1');
    if (h1) setDirectText(h1, t);
  };

  const applySub = (v: string) => {
    const t = sliceMax(v, 160);
    setSubheading(t);
    const { sub } = getHeroContent(root);
    if (sub) setDirectText(sub, t);
  };

  const applyBtn = (v: string) => {
    const t = sliceMax(v, 30);
    setBtnText(t);
    const link = findOne(root, 'a.wb-link-btn') ?? findOne(root, 'a');
    if (link) setDirectText(link, t);
  };

  const applyHref = (v: string) => {
    setBtnHref(v);
    const link = findOne(root, 'a.wb-link-btn') ?? findOne(root, 'a');
    if (link) link.addAttributes({ href: v });
  };

  return (
    <>
      <div className="website-builder-page__form-block">
        <label className="website-builder-page__field-label" htmlFor="wb-ins-sec-type">
          Section Type
        </label>
        <select
          id="wb-ins-sec-type"
          className="website-builder-page__field-control"
          value={sectionType}
          onChange={(e) => {
            const v = e.target.value;
            setSectionType(v);
            root.addAttributes({ 'data-wb-section-type': v });
          }}
        >
          {SECTION_TYPES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="website-builder-page__panel-group-title">Content</div>
      <div className="website-builder-page__form-block">
        <div className="website-builder-page__label-row">
          <label className="website-builder-page__field-label mb-0" htmlFor="wb-ins-hero-h">
            Heading
          </label>
          <span className="website-builder-page__char-count">
            {heading.length}/80
          </span>
        </div>
        <input
          id="wb-ins-hero-h"
          className="website-builder-page__field-control"
          value={heading}
          maxLength={80}
          onChange={(e) => applyHeading(e.target.value)}
        />
      </div>
      <div className="website-builder-page__form-block">
        <div className="website-builder-page__label-row">
          <label className="website-builder-page__field-label mb-0" htmlFor="wb-ins-hero-sub">
            Subheading
          </label>
          <span className="website-builder-page__char-count">{subheading.length}/160</span>
        </div>
        <textarea
          id="wb-ins-hero-sub"
          className="website-builder-page__field-control website-builder-page__field-control--textarea"
          value={subheading}
          maxLength={160}
          rows={3}
          onChange={(e) => applySub(e.target.value)}
        />
      </div>

      <div className="website-builder-page__panel-group-title">Button</div>
      <div className="website-builder-page__form-block">
        <div className="website-builder-page__label-row">
          <label className="website-builder-page__field-label mb-0" htmlFor="wb-ins-hero-bt">
            Text
          </label>
          <span className="website-builder-page__char-count">{btnText.length}/30</span>
        </div>
        <input
          id="wb-ins-hero-bt"
          className="website-builder-page__field-control"
          value={btnText}
          maxLength={30}
          onChange={(e) => applyBtn(e.target.value)}
        />
      </div>
      <div className="website-builder-page__form-block">
        <label className="website-builder-page__field-label" htmlFor="wb-ins-hero-href">
          Link
        </label>
        <div className="website-builder-page__input-with-actions">
          <input
            id="wb-ins-hero-href"
            className="website-builder-page__field-control"
            value={btnHref}
            onChange={(e) => applyHref(e.target.value)}
            placeholder="#contact"
          />
          <button type="button" className="website-builder-page__input-action" aria-label="Open link" title="Open link">
            <OpenInNewOutlinedIcon fontSize="small" />
          </button>
          <button type="button" className="website-builder-page__input-action" aria-label="More link options" title="More">
            <AddOutlinedIcon fontSize="small" />
          </button>
        </div>
      </div>

      <div className="website-builder-page__panel-group-title">Background</div>
      <div className="website-builder-page__segmented" role="group" aria-label="Background type">
        {(
          [
            ['image', 'Image'],
            ['video', 'Video'],
            ['slider', 'Slider'],
            ['color', 'Color'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`website-builder-page__segmented-btn${bgType === id ? ' is-active' : ''}`}
            onClick={() => setBgType(id)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="website-builder-page__bg-thumb-wrap">
        <div className="website-builder-page__bg-thumb" />
        <button type="button" className="website-builder-page__bg-thumb-delete" aria-label="Remove background">
          <DeleteOutlineOutlinedIcon fontSize="small" />
        </button>
      </div>

      <div className="website-builder-page__toggle-block">
        <div>
          <div className="website-builder-page__field-label mb-0">Overlay</div>
          <p className="website-builder-page__field-hint">Add a dark overlay over the background.</p>
        </div>
        <button
          type="button"
          className={`website-builder-page__toggle${overlayOn ? ' is-on' : ''}`}
          aria-pressed={overlayOn}
          aria-label="Toggle overlay"
          onClick={() => {
            setOverlayOn((o) => {
              const next = !o;
              root.addAttributes({ 'data-wb-overlay': next ? 'on' : 'off' });
              return next;
            });
          }}
        >
          <span />
        </button>
      </div>
      <div className="website-builder-page__form-block">
        <label className="website-builder-page__field-label" htmlFor="wb-ins-overlay-op">
          Overlay Opacity
        </label>
        <div className="website-builder-page__range-row">
          <input
            id="wb-ins-overlay-op"
            type="range"
            min={0}
            max={100}
            value={overlayPct}
            className="website-builder-page__range"
            onChange={(e) => {
              const n = Number(e.target.value);
              setOverlayPct(n);
              root.addAttributes({ 'data-wb-overlay-opacity': String(n) });
            }}
          />
          <span className="website-builder-page__range-value">{overlayPct}%</span>
        </div>
      </div>

      <button type="button" className="website-builder-page__save-section-btn">
        Save Section
      </button>
    </>
  );
}

function HeadingContent({ comp }: { comp: NonNullable<ReturnType<Editor['getSelected']>> }) {
  const [text, setText] = useState('');
  useEffect(() => {
    setText(getDirectText(comp));
  }, [comp]);
  return (
    <>
      <div className="website-builder-page__panel-group-title">Content</div>
      <div className="website-builder-page__form-block">
        <div className="website-builder-page__label-row">
          <label className="website-builder-page__field-label mb-0" htmlFor="wb-ins-head">
            Text
          </label>
          <span className="website-builder-page__char-count">{text.length}/120</span>
        </div>
        <input
          id="wb-ins-head"
          className="website-builder-page__field-control"
          value={text}
          maxLength={120}
          onChange={(e) => {
            const v = e.target.value;
            setText(v);
            setDirectText(comp, v);
          }}
        />
      </div>
      <button type="button" className="website-builder-page__save-section-btn">
        Save Section
      </button>
    </>
  );
}

function TextContent({ comp }: { comp: NonNullable<ReturnType<Editor['getSelected']>> }) {
  const [text, setText] = useState('');
  useEffect(() => {
    setText(getDirectText(comp));
  }, [comp]);
  return (
    <>
      <div className="website-builder-page__panel-group-title">Content</div>
      <div className="website-builder-page__form-block">
        <div className="website-builder-page__label-row">
          <label className="website-builder-page__field-label mb-0" htmlFor="wb-ins-par">
            Paragraph
          </label>
          <span className="website-builder-page__char-count">{text.length}/2000</span>
        </div>
        <textarea
          id="wb-ins-par"
          className="website-builder-page__field-control website-builder-page__field-control--textarea"
          value={text}
          maxLength={2000}
          rows={5}
          onChange={(e) => {
            const v = e.target.value;
            setText(v);
            setDirectText(comp, v);
          }}
        />
      </div>
      <button type="button" className="website-builder-page__save-section-btn">
        Save Section
      </button>
    </>
  );
}

function PushButtonContent({ comp }: { comp: NonNullable<ReturnType<Editor['getSelected']>> }) {
  const [label, setLabel] = useState('');
  const [btnType, setBtnType] = useState('button');
  useEffect(() => {
    setLabel(getDirectText(comp));
    setBtnType(String(comp.getAttributes?.().type || 'button'));
  }, [comp]);
  return (
    <>
      <div className="website-builder-page__panel-group-title">Button</div>
      <div className="website-builder-page__form-block">
        <div className="website-builder-page__label-row">
          <label className="website-builder-page__field-label mb-0" htmlFor="wb-ins-pbt">
            Label
          </label>
          <span className="website-builder-page__char-count">{label.length}/80</span>
        </div>
        <input
          id="wb-ins-pbt"
          className="website-builder-page__field-control"
          value={label}
          maxLength={80}
          onChange={(e) => {
            const v = e.target.value;
            setLabel(v);
            setDirectText(comp, v);
          }}
        />
      </div>
      <div className="website-builder-page__form-block">
        <label className="website-builder-page__field-label" htmlFor="wb-ins-pbtype">
          Type
        </label>
        <select
          id="wb-ins-pbtype"
          className="website-builder-page__field-control"
          value={btnType}
          onChange={(e) => {
            const v = e.target.value;
            setBtnType(v);
            comp.addAttributes({ type: v });
          }}
        >
          <option value="button">button</option>
          <option value="submit">submit</option>
          <option value="reset">reset</option>
        </select>
      </div>
      <p className="website-builder-page__field-hint">Use Design for width, height, and opacity.</p>
      <button type="button" className="website-builder-page__save-section-btn">
        Save Section
      </button>
    </>
  );
}

function IframeContent({ comp }: { comp: NonNullable<ReturnType<Editor['getSelected']>> }) {
  const [src, setSrc] = useState('');
  const [title, setTitle] = useState('');
  useEffect(() => {
    const a = comp.getAttributes?.() ?? {};
    setSrc(String(a.src ?? ''));
    setTitle(String(a.title ?? ''));
  }, [comp]);
  return (
    <>
      <div className="website-builder-page__panel-group-title">Iframe</div>
      <div className="website-builder-page__form-block">
        <label className="website-builder-page__field-label" htmlFor="wb-ins-if-src">
          Source URL
        </label>
        <input
          id="wb-ins-if-src"
          className="website-builder-page__field-control"
          value={src}
          placeholder="https://…"
          onChange={(e) => {
            const v = e.target.value;
            setSrc(v);
            comp.addAttributes({ src: v });
          }}
        />
      </div>
      <div className="website-builder-page__form-block">
        <label className="website-builder-page__field-label" htmlFor="wb-ins-if-title">
          Title (accessibility)
        </label>
        <input
          id="wb-ins-if-title"
          className="website-builder-page__field-control"
          value={title}
          onChange={(e) => {
            const v = e.target.value;
            setTitle(v);
            comp.addAttributes({ title: v });
          }}
        />
      </div>
      <p className="website-builder-page__field-hint">Use Design for width, height, min-height, and opacity.</p>
      <button type="button" className="website-builder-page__save-section-btn">
        Save Section
      </button>
    </>
  );
}

function DivBlockContent() {
  return (
    <div className="website-builder-page__inspector-empty">
      <p className="website-builder-page__inspector-empty-text">
        This is a <strong>div</strong> container. Use the <strong>Design</strong> tab for width, height, max-width, and opacity. Add inner elements from the toolbar <strong>Add</strong> menu.
      </p>
    </div>
  );
}

function ButtonContent({ comp }: { comp: NonNullable<ReturnType<Editor['getSelected']>> }) {
  const [label, setLabel] = useState('');
  const [href, setHref] = useState('#');
  useEffect(() => {
    setLabel(getDirectText(comp));
    setHref(String(comp.getAttributes?.().href ?? '#'));
  }, [comp]);
  return (
    <>
      <div className="website-builder-page__panel-group-title">Link</div>
      <div className="website-builder-page__form-block">
        <div className="website-builder-page__label-row">
          <label className="website-builder-page__field-label mb-0" htmlFor="wb-ins-bt">
            Label
          </label>
          <span className="website-builder-page__char-count">{label.length}/80</span>
        </div>
        <input
          id="wb-ins-bt"
          className="website-builder-page__field-control"
          value={label}
          maxLength={80}
          onChange={(e) => {
            const v = e.target.value;
            setLabel(v);
            setDirectText(comp, v);
          }}
        />
      </div>
      <div className="website-builder-page__form-block">
        <label className="website-builder-page__field-label" htmlFor="wb-ins-bh">
          Link
        </label>
        <div className="website-builder-page__input-with-actions">
          <input
            id="wb-ins-bh"
            className="website-builder-page__field-control"
            value={href}
            onChange={(e) => {
              const v = e.target.value;
              setHref(v);
              comp.addAttributes({ href: v });
            }}
          />
          <button type="button" className="website-builder-page__input-action" aria-label="Open link">
            <OpenInNewOutlinedIcon fontSize="small" />
          </button>
          <button type="button" className="website-builder-page__input-action" aria-label="More">
            <AddOutlinedIcon fontSize="small" />
          </button>
        </div>
      </div>
      <button type="button" className="website-builder-page__save-section-btn">
        Save Section
      </button>
    </>
  );
}

function ImageContent({ comp }: { comp: NonNullable<ReturnType<Editor['getSelected']>> }) {
  const [src, setSrc] = useState('');
  const [alt, setAlt] = useState('');
  useEffect(() => {
    const a = comp.getAttributes?.() ?? {};
    setSrc(String(a.src ?? ''));
    setAlt(String(a.alt ?? ''));
  }, [comp]);
  return (
    <>
      <div className="website-builder-page__panel-group-title">Image</div>
      <div className="website-builder-page__form-block">
        <label className="website-builder-page__field-label" htmlFor="wb-ins-img-src">
          Source URL
        </label>
        <input
          id="wb-ins-img-src"
          className="website-builder-page__field-control"
          value={src}
          onChange={(e) => {
            const v = e.target.value;
            setSrc(v);
            comp.addAttributes({ src: v });
          }}
        />
      </div>
      <div className="website-builder-page__form-block">
        <label className="website-builder-page__field-label" htmlFor="wb-ins-img-alt">
          Alt text
        </label>
        <input
          id="wb-ins-img-alt"
          className="website-builder-page__field-control"
          value={alt}
          onChange={(e) => {
            const v = e.target.value;
            setAlt(v);
            comp.addAttributes({ alt: v });
          }}
        />
      </div>
      <button type="button" className="website-builder-page__save-section-btn">
        Save Section
      </button>
    </>
  );
}

function NavContent() {
  return (
    <div className="website-builder-page__inspector-empty">
      <p className="website-builder-page__inspector-empty-text">
        Edit navigation links by selecting each link on the canvas, or adjust layout and colors in the Design and Advanced tabs.
      </p>
    </div>
  );
}

function SectionContent({ root }: { root: NonNullable<ReturnType<Editor['getSelected']>> }) {
  const [sectionType, setSectionType] = useState('Custom');
  useEffect(() => {
    const attrs = root.getAttributes?.() ?? {};
    const st = (attrs['data-wb-section-type'] ?? 'Custom').trim();
    setSectionType(st);
  }, [root]);
  return (
    <>
      <div className="website-builder-page__form-block">
        <label className="website-builder-page__field-label" htmlFor="wb-ins-sec2">
          Section Type
        </label>
        <select
          id="wb-ins-sec2"
          className="website-builder-page__field-control"
          value={sectionType}
          onChange={(e) => {
            const v = e.target.value;
            setSectionType(v);
            root.addAttributes({ 'data-wb-section-type': v });
          }}
        >
          {SECTION_TYPES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <p className="website-builder-page__field-hint">
        Use Design for spacing and typography, and Advanced for HTML id/classes and animations.
      </p>
      <button type="button" className="website-builder-page__save-section-btn">
        Save Section
      </button>
    </>
  );
}

function GenericContent({ comp, kind }: { comp: NonNullable<ReturnType<Editor['getSelected']>>; kind: InspectorKind }) {
  const [text, setText] = useState('');
  useEffect(() => {
    setText(getDirectText(comp));
  }, [comp]);
  if (kind === 'image') return null;
  return (
    <>
      <div className="website-builder-page__panel-group-title">Content</div>
      <div className="website-builder-page__form-block">
        <label className="website-builder-page__field-label" htmlFor="wb-ins-gen">
          Text
        </label>
        <textarea
          id="wb-ins-gen"
          className="website-builder-page__field-control website-builder-page__field-control--textarea"
          value={text}
          rows={4}
          onChange={(e) => {
            const v = e.target.value;
            setText(v);
            setDirectText(comp, v);
          }}
        />
      </div>
      <button type="button" className="website-builder-page__save-section-btn">
        Save Section
      </button>
    </>
  );
}

function opacityToPercent(style: Record<string, string>): number {
  const o = style.opacity;
  if (!o) return 100;
  const n = parseFloat(o);
  if (Number.isNaN(n)) return 100;
  if (n <= 1) return Math.round(n * 100);
  return Math.min(100, Math.round(n));
}

function applyStylePatch(comp: Component, patch: Record<string, string | undefined>) {
  const prev = { ...(comp.getStyle?.() as Record<string, string> | undefined) } as Record<string, string>;
  for (const [k, v] of Object.entries(patch)) {
    if (v === '' || v === undefined) delete prev[k];
    else prev[k] = v;
  }
  comp.setStyle(prev);
}

/** Normalize to #rrggbb for `<input type="color">`. */
function colorStringToHexInput(s: string): string {
  const t = s.trim();
  if (t.startsWith('#')) {
    if (t.length >= 7) return t.slice(0, 7);
    if (t.length === 4) {
      const r = t[1];
      const g = t[2];
      const b = t[3];
      return `#${r}${r}${g}${g}${b}${b}`;
    }
  }
  const m = t.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (m) {
    const r = Number(m[1]);
    const g = Number(m[2]);
    const b = Number(m[3]);
    const h = (n: number) => n.toString(16).padStart(2, '0');
    return `#${h(r)}${h(g)}${h(b)}`;
  }
  return '#2563eb';
}

function parseLinearGradientFromBackground(bg: string): { angle: number; c1: string; c2: string } | null {
  if (!bg.includes('gradient')) return null;
  const degM = bg.match(/([\d.]+)\s*deg/i);
  const angle = degM ? Math.min(360, Math.max(0, Number(degM[1]))) : 135;
  const colors: string[] = [];
  const re = /(#[0-9a-fA-F]{3,8})|rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)|rgba\(\s*[^)]+\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(bg)) !== null) {
    colors.push(colorStringToHexInput(m[0]));
  }
  if (colors.length >= 2) return { angle, c1: colors[0], c2: colors[1] };
  return null;
}

function FillAndTextFields({ comp }: { comp: Component }) {
  const read = useCallback(() => {
    const st = (comp.getStyle?.() ?? {}) as Record<string, string>;
    const bg = st.background || '';
    const hasGrad = bg.includes('gradient');
    return {
      color: st.color || '',
      background: bg,
      backgroundColor: st['background-color'] || '',
      mode: hasGrad ? ('gradient' as const) : ('solid' as const),
    };
  }, [comp]);

  const [textColor, setTextColor] = useState('#0f172a');
  const [fillMode, setFillMode] = useState<'solid' | 'gradient'>('solid');
  const [solidBg, setSolidBg] = useState('#ffffff');
  const [g1, setG1] = useState('#2563eb');
  const [g2, setG2] = useState('#7c3aed');
  const [angle, setAngle] = useState(135);

  useEffect(() => {
    const st = read();
    setTextColor(st.color || '#0f172a');
    setFillMode(st.mode);
    if (st.mode === 'solid') {
      const bc = st.backgroundColor;
      setSolidBg(bc ? colorStringToHexInput(bc) : '#ffffff');
    } else {
      const parsed = parseLinearGradientFromBackground(st.background);
      if (parsed) {
        setAngle(parsed.angle);
        setG1(parsed.c1);
        setG2(parsed.c2);
      }
    }
  }, [read, comp]);

  const applyGradient = (a: number, c1: string, c2: string) => {
    applyStylePatch(comp, {
      background: `linear-gradient(${a}deg, ${c1}, ${c2})`,
      'background-color': undefined,
    });
  };

  return (
    <>
      <div className="website-builder-page__panel-group-title">Text &amp; fill</div>
      <div className="website-builder-page__form-block">
        <label className="website-builder-page__field-label" htmlFor="wb-fill-tc">
          Text color
        </label>
        <div className="website-builder-page__color-row">
          <input
            id="wb-fill-tc"
            type="color"
            className="website-builder-page__color-swatch"
            value={textColor.startsWith('#') && textColor.length >= 7 ? textColor.slice(0, 7) : '#0f172a'}
            onChange={(e) => {
              const v = e.target.value;
              setTextColor(v);
              applyStylePatch(comp, { color: v });
            }}
          />
          <input
            type="text"
            className="website-builder-page__field-control website-builder-page__field-control--color-hex"
            value={textColor}
            onChange={(e) => {
              const v = e.target.value;
              setTextColor(v);
              applyStylePatch(comp, { color: v || undefined });
            }}
          />
        </div>
      </div>
      <div className="website-builder-page__form-block">
        <span className="website-builder-page__field-label">Background</span>
        <div className="website-builder-page__segmented website-builder-page__segmented--fill">
          <button
            type="button"
            className={`website-builder-page__segmented-btn${fillMode === 'solid' ? ' is-active' : ''}`}
            onClick={() => {
              setFillMode('solid');
              applyStylePatch(comp, { background: undefined, 'background-color': solidBg });
            }}
          >
            Solid
          </button>
          <button
            type="button"
            className={`website-builder-page__segmented-btn${fillMode === 'gradient' ? ' is-active' : ''}`}
            onClick={() => {
              setFillMode('gradient');
              applyGradient(angle, g1, g2);
            }}
          >
            Gradient
          </button>
        </div>
      </div>
      {fillMode === 'solid' ?
        <div className="website-builder-page__form-block">
          <label className="website-builder-page__field-label" htmlFor="wb-fill-bg">
            Background color
          </label>
          <div className="website-builder-page__color-row">
            <input
              id="wb-fill-bg"
              type="color"
              className="website-builder-page__color-swatch"
              value={solidBg.startsWith('#') && solidBg.length >= 7 ? solidBg.slice(0, 7) : '#ffffff'}
              onChange={(e) => {
                const v = e.target.value;
                setSolidBg(v);
                applyStylePatch(comp, { 'background-color': v, background: undefined });
              }}
            />
            <input
              type="text"
              className="website-builder-page__field-control website-builder-page__field-control--color-hex"
              value={solidBg}
              onChange={(e) => {
                const v = e.target.value;
                setSolidBg(v);
                applyStylePatch(comp, { 'background-color': v || undefined });
              }}
            />
          </div>
        </div>
      : (
        <>
          <div className="website-builder-page__form-block">
            <label className="website-builder-page__field-label">Gradient angle</label>
            <div className="website-builder-page__range-row">
              <input
                type="range"
                min={0}
                max={360}
                value={angle}
                className="website-builder-page__range"
                onChange={(e) => {
                  const a = Number(e.target.value);
                  setAngle(a);
                  applyGradient(a, g1, g2);
                }}
              />
              <span className="website-builder-page__range-value">{angle}°</span>
            </div>
          </div>
          <div className="website-builder-page__form-block">
            <label className="website-builder-page__field-label">Color start</label>
            <div className="website-builder-page__color-row">
              <input
                type="color"
                className="website-builder-page__color-swatch"
                value={g1}
                onChange={(e) => {
                  const v = e.target.value;
                  setG1(v);
                  applyGradient(angle, v, g2);
                }}
              />
            </div>
          </div>
          <div className="website-builder-page__form-block">
            <label className="website-builder-page__field-label">Color end</label>
            <div className="website-builder-page__color-row">
              <input
                type="color"
                className="website-builder-page__color-swatch"
                value={g2}
                onChange={(e) => {
                  const v = e.target.value;
                  setG2(v);
                  applyGradient(angle, g1, v);
                }}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
}

function ElementLayoutFields({ comp }: { comp: Component }) {
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [maxWidth, setMaxWidth] = useState('');
  const [minHeight, setMinHeight] = useState('');
  const [opacityPct, setOpacityPct] = useState(100);

  const reload = useCallback(() => {
    const raw = (comp.getStyle?.() ?? {}) as Record<string, string>;
    const g = (k: string) => (raw[k] != null && raw[k] !== '' ? String(raw[k]) : '');
    setWidth(g('width'));
    setHeight(g('height'));
    setMaxWidth(g('max-width'));
    setMinHeight(g('min-height'));
    setOpacityPct(opacityToPercent(raw));
  }, [comp]);

  useEffect(() => {
    reload();
  }, [reload]);

  return (
    <>
      <div className="website-builder-page__panel-group-title">Size &amp; opacity</div>
      <p className="website-builder-page__field-hint">Applies to the selected element. Use px, %, rem, or auto.</p>
      <div className="website-builder-page__form-block">
        <label className="website-builder-page__field-label" htmlFor="wb-lay-w">
          Width
        </label>
        <input
          id="wb-lay-w"
          className="website-builder-page__field-control"
          value={width}
          placeholder="e.g. 100% or 320px"
          onChange={(e) => {
            const v = e.target.value;
            setWidth(v);
            applyStylePatch(comp, { width: v || undefined });
          }}
        />
      </div>
      <div className="website-builder-page__form-block">
        <label className="website-builder-page__field-label" htmlFor="wb-lay-h">
          Height
        </label>
        <input
          id="wb-lay-h"
          className="website-builder-page__field-control"
          value={height}
          placeholder="e.g. 200px or auto"
          onChange={(e) => {
            const v = e.target.value;
            setHeight(v);
            applyStylePatch(comp, { height: v || undefined });
          }}
        />
      </div>
      <div className="website-builder-page__form-block">
        <label className="website-builder-page__field-label" htmlFor="wb-lay-mw">
          Max width
        </label>
        <input
          id="wb-lay-mw"
          className="website-builder-page__field-control"
          value={maxWidth}
          placeholder="e.g. 1200px"
          onChange={(e) => {
            const v = e.target.value;
            setMaxWidth(v);
            applyStylePatch(comp, { 'max-width': v || undefined });
          }}
        />
      </div>
      <div className="website-builder-page__form-block">
        <label className="website-builder-page__field-label" htmlFor="wb-lay-mh">
          Min height
        </label>
        <input
          id="wb-lay-mh"
          className="website-builder-page__field-control"
          value={minHeight}
          placeholder="e.g. 80px"
          onChange={(e) => {
            const v = e.target.value;
            setMinHeight(v);
            applyStylePatch(comp, { 'min-height': v || undefined });
          }}
        />
      </div>
      <div className="website-builder-page__form-block">
        <div className="website-builder-page__label-row">
          <label className="website-builder-page__field-label mb-0" htmlFor="wb-lay-op">
            Opacity
          </label>
          <span className="website-builder-page__char-count">{opacityPct}%</span>
        </div>
        <div className="website-builder-page__range-row">
          <input
            id="wb-lay-op"
            type="range"
            min={0}
            max={100}
            value={opacityPct}
            className="website-builder-page__range"
            onChange={(e) => {
              const n = Number(e.target.value);
              setOpacityPct(n);
              const o = n >= 100 ? undefined : String(n / 100);
              applyStylePatch(comp, { opacity: o });
            }}
          />
        </div>
      </div>
    </>
  );
}

function DesignPanel({
  selection,
  selected,
}: {
  selection: SelectionInfo;
  selected: ReturnType<Editor['getSelected']>;
}) {
  if (!selected) return <InspectorEmpty />;

  if (selection.kind === 'hero') {
    return (
      <>
        <FillAndTextFields key={selection.cid} comp={selected} />
        <HeroDesign root={selected} />
      </>
    );
  }

  return (
    <>
      <FillAndTextFields key={selection.cid} comp={selected} />
      <ElementLayoutFields comp={selected} />
      <div className="website-builder-page__gjs-embed">
        <p className="website-builder-page__field-hint website-builder-page__gjs-embed-hint">
          {selection.kind === 'iframe' ?
            'Iframe: set dimensions above; embed source in Content. Style manager below adds borders and backgrounds.'
          : selection.kind === 'pushButton' || selection.kind === 'div' ?
            'Adjust layout above; use the style manager for colors, borders, and typography.'
          : 'Fine-tune typography, borders, and backgrounds in the style manager below.'}
        </p>
      </div>
    </>
  );
}

function HeroDesign({ root }: { root: NonNullable<ReturnType<Editor['getSelected']>> }) {
  const [layoutWidth, setLayoutWidth] = useState('Contained');
  const [vAlign, setVAlign] = useState<'start' | 'center' | 'end'>('center');
  const [contentPos, setContentPos] = useState('Left');
  const [minH, setMinH] = useState(80);
  const [minUnit, setMinUnit] = useState<'vh' | 'px'>('vh');
  const [gap, setGap] = useState('Default');
  const [hFont, setHFont] = useState('Poppins');
  const [hWeight, setHWeight] = useState('700');
  const [hSize, setHSize] = useState(64);
  const [hLh, setHLh] = useState(1.1);
  const [pFont, setPFont] = useState('Inter');
  const [pWeight, setPWeight] = useState('400');
  const [pSize, setPSize] = useState(18);
  const [pLh, setPLh] = useState(1.6);
  const [btnStyle, setBtnStyle] = useState('Outline');
  const [btnRadius, setBtnRadius] = useState(8);

  const applyRootStyle = useCallback(
    (patch: Record<string, string>) => {
      const prev = root.getStyle?.() ?? {};
      root.setStyle({ ...prev, ...patch });
    },
    [root],
  );

  const applyHeadingStyle = useCallback(
    (patch: Record<string, string>) => {
      const h1 = findOne(root, 'h1');
      if (!h1) return;
      const prev = h1.getStyle?.() ?? {};
      h1.setStyle({ ...prev, ...patch });
    },
    [root],
  );

  const applySubStyle = useCallback(
    (patch: Record<string, string>) => {
      const { sub } = getHeroContent(root);
      if (!sub) return;
      const prev = sub.getStyle?.() ?? {};
      sub.setStyle({ ...prev, ...patch });
    },
    [root],
  );

  const applyLinkStyle = useCallback(
    (patch: Record<string, string>) => {
      const link = findOne(root, 'a.wb-link-btn') ?? findOne(root, 'a');
      if (!link) return;
      const prev = link.getStyle?.() ?? {};
      link.setStyle({ ...prev, ...patch });
    },
    [root],
  );

  useEffect(() => {
    applyRootStyle({
      'min-height': `${minH}${minUnit}`,
      display: 'flex',
      'flex-direction': 'column',
      'justify-content': vAlign === 'start' ? 'flex-start' : vAlign === 'end' ? 'flex-end' : 'center',
      'align-items': contentPos === 'Right' ? 'flex-end' : contentPos === 'Center' ? 'center' : 'flex-start',
    });
  }, [applyRootStyle, minH, minUnit, vAlign, contentPos]);

  useEffect(() => {
    applyHeadingStyle({
      'font-family': `${hFont}, system-ui, sans-serif`,
      'font-weight': hWeight,
      'font-size': `${hSize}px`,
      'line-height': String(hLh),
    });
  }, [applyHeadingStyle, hFont, hWeight, hSize, hLh]);

  useEffect(() => {
    applySubStyle({
      'font-family': `${pFont}, system-ui, sans-serif`,
      'font-weight': pWeight,
      'font-size': `${pSize}px`,
      'line-height': String(pLh),
    });
  }, [applySubStyle, pFont, pWeight, pSize, pLh]);

  useEffect(() => {
    const border =
      btnStyle === 'Outline' ? '2px solid rgba(255,255,255,0.9)' : btnStyle === 'Solid' ? '2px solid transparent' : '0';
    const bg = btnStyle === 'Solid' ? 'rgba(255,255,255,0.15)' : 'transparent';
    applyLinkStyle({
      'border-radius': `${btnRadius}px`,
      border,
      background: bg,
    });
  }, [applyLinkStyle, btnStyle, btnRadius]);

  return (
    <>
      <details className="website-builder-page__disclosure" open>
        <summary className="website-builder-page__disclosure-summary">Layout</summary>
        <div className="website-builder-page__form-block">
          <label className="website-builder-page__field-label">Content Width</label>
          <select className="website-builder-page__field-control" value={layoutWidth} onChange={(e) => setLayoutWidth(e.target.value)}>
            <option>Contained</option>
            <option>Full width</option>
          </select>
        </div>
        <div className="website-builder-page__form-block">
          <span className="website-builder-page__field-label">Vertical Align</span>
          <div className="website-builder-page__icon-toggle-row">
            <button
              type="button"
              className={`website-builder-page__icon-toggle${vAlign === 'start' ? ' is-active' : ''}`}
              aria-label="Align top"
              onClick={() => setVAlign('start')}
            >
              <span className="website-builder-page__vbar website-builder-page__vbar--top" />
            </button>
            <button
              type="button"
              className={`website-builder-page__icon-toggle${vAlign === 'center' ? ' is-active' : ''}`}
              aria-label="Align middle"
              onClick={() => setVAlign('center')}
            >
              <span className="website-builder-page__vbar website-builder-page__vbar--mid" />
            </button>
            <button
              type="button"
              className={`website-builder-page__icon-toggle${vAlign === 'end' ? ' is-active' : ''}`}
              aria-label="Align bottom"
              onClick={() => setVAlign('end')}
            >
              <span className="website-builder-page__vbar website-builder-page__vbar--bot" />
            </button>
          </div>
        </div>
        <div className="website-builder-page__form-block">
          <label className="website-builder-page__field-label">Content Position</label>
          <select className="website-builder-page__field-control" value={contentPos} onChange={(e) => setContentPos(e.target.value)}>
            <option>Left</option>
            <option>Center</option>
            <option>Right</option>
          </select>
        </div>
        <div className="website-builder-page__form-block">
          <label className="website-builder-page__field-label">Min Height</label>
          <div className="website-builder-page__split-input">
            <input
              type="number"
              className="website-builder-page__field-control"
              value={minH}
              onChange={(e) => setMinH(Number(e.target.value))}
            />
            <select className="website-builder-page__field-control" value={minUnit} onChange={(e) => setMinUnit(e.target.value as 'vh' | 'px')}>
              <option value="vh">vh</option>
              <option value="px">px</option>
            </select>
          </div>
          <p className="website-builder-page__field-hint">Minimum height of the section.</p>
        </div>
        <div className="website-builder-page__form-block">
          <label className="website-builder-page__field-label">Columns Gap</label>
          <select className="website-builder-page__field-control" value={gap} onChange={(e) => setGap(e.target.value)}>
            <option>Default</option>
            <option>Tight</option>
            <option>Wide</option>
          </select>
        </div>
      </details>

      <details className="website-builder-page__disclosure" open>
        <summary className="website-builder-page__disclosure-summary">Typography</summary>
        <div className="website-builder-page__subhead">Heading</div>
        <div className="website-builder-page__form-block">
          <label className="website-builder-page__field-label">Font</label>
          <select className="website-builder-page__field-control" value={hFont} onChange={(e) => setHFont(e.target.value)}>
            <option>Poppins</option>
            <option>Inter</option>
            <option>system-ui</option>
          </select>
        </div>
        <div className="website-builder-page__form-block">
          <label className="website-builder-page__field-label">Weight</label>
          <select className="website-builder-page__field-control" value={hWeight} onChange={(e) => setHWeight(e.target.value)}>
            <option value="700">700 — Bold</option>
            <option value="600">600 — Semibold</option>
            <option value="400">400 — Regular</option>
          </select>
        </div>
        <div className="website-builder-page__form-block">
          <div className="website-builder-page__label-row">
            <span className="website-builder-page__field-label mb-0">Size</span>
            <DesktopWindowsOutlinedIcon fontSize="small" className="website-builder-page__inline-icon" />
          </div>
          <div className="website-builder-page__range-row">
            <input type="range" min={24} max={96} value={hSize} className="website-builder-page__range" onChange={(e) => setHSize(Number(e.target.value))} />
            <span className="website-builder-page__range-value">{hSize}px</span>
          </div>
        </div>
        <div className="website-builder-page__form-block">
          <label className="website-builder-page__field-label">Line Height</label>
          <input type="number" step={0.05} className="website-builder-page__field-control" value={hLh} onChange={(e) => setHLh(Number(e.target.value))} />
        </div>

        <div className="website-builder-page__subhead">Subheading</div>
        <div className="website-builder-page__form-block">
          <label className="website-builder-page__field-label">Font</label>
          <select className="website-builder-page__field-control" value={pFont} onChange={(e) => setPFont(e.target.value)}>
            <option>Inter</option>
            <option>Poppins</option>
          </select>
        </div>
        <div className="website-builder-page__form-block">
          <label className="website-builder-page__field-label">Weight</label>
          <select className="website-builder-page__field-control" value={pWeight} onChange={(e) => setPWeight(e.target.value)}>
            <option value="400">400 — Regular</option>
            <option value="500">500 — Medium</option>
          </select>
        </div>
        <div className="website-builder-page__form-block">
          <div className="website-builder-page__range-row">
            <input type="range" min={12} max={32} value={pSize} className="website-builder-page__range" onChange={(e) => setPSize(Number(e.target.value))} />
            <span className="website-builder-page__range-value">{pSize}px</span>
          </div>
        </div>
        <div className="website-builder-page__form-block">
          <label className="website-builder-page__field-label">Line Height</label>
          <input type="number" step={0.05} className="website-builder-page__field-control" value={pLh} onChange={(e) => setPLh(Number(e.target.value))} />
        </div>
      </details>

      <details className="website-builder-page__disclosure" open>
        <summary className="website-builder-page__disclosure-summary">Button</summary>
        <div className="website-builder-page__form-block">
          <label className="website-builder-page__field-label">Style</label>
          <select className="website-builder-page__field-control" value={btnStyle} onChange={(e) => setBtnStyle(e.target.value)}>
            <option>Outline</option>
            <option>Solid</option>
            <option>Ghost</option>
          </select>
        </div>
        <div className="website-builder-page__form-block">
          <label className="website-builder-page__field-label">Border Radius</label>
          <div className="website-builder-page__range-row">
            <input type="range" min={0} max={32} value={btnRadius} className="website-builder-page__range" onChange={(e) => setBtnRadius(Number(e.target.value))} />
            <span className="website-builder-page__range-value">{btnRadius}px</span>
          </div>
        </div>
      </details>

      <button type="button" className="website-builder-page__save-section-btn">
        Save Section
      </button>
    </>
  );
}

function AdvancedPanelForm({
  selected,
}: {
  selected: ReturnType<Editor['getSelected']>;
}) {
  const [htmlTag, setHtmlTag] = useState('section');
  const [cssId, setCssId] = useState('');
  const [cssClass, setCssClass] = useState('');
  const [padLock, setPadLock] = useState(true);
  const [pad, setPad] = useState({ t: 80, r: 80, b: 80, l: 80 });
  const [marginLock, setMarginLock] = useState(true);
  const [margin, setMargin] = useState({ t: 0, r: 0, b: 0, l: 0 });
  const [anim, setAnim] = useState('Fade In Up');
  const [animDur, setAnimDur] = useState(800);
  const [animDelay, setAnimDelay] = useState(100);
  const [customCss, setCustomCss] = useState(
    `.hero-section {\n  /* section */\n}\n.hero-section .heading {\n  /* heading */\n}`,
  );

  useEffect(() => {
    if (!selected) return;
    setHtmlTag(String(selected.get('tagName') ?? 'div'));
    setCssId(String(selected.getAttributes?.().id ?? ''));
    const cl = selected.getClasses?.();
    setCssClass(Array.isArray(cl) ? cl.join(' ') : String(cl ?? ''));
  }, [selected]);

  const applyTag = (tag: string) => {
    setHtmlTag(tag);
    if (!selected) return;
    selected.set('tagName', tag);
  };

  const applyId = (id: string) => {
    setCssId(id);
    if (!selected) return;
    selected.addAttributes({ id });
  };

  const applyClasses = (cls: string) => {
    setCssClass(cls);
    if (!selected) return;
    const parts = cls.split(/\s+/).filter(Boolean);
    if (parts.length) selected.setClass(parts);
    else selected.setClass([]);
  };

  const applyPadding = (patch: Partial<typeof pad>) => {
    const next = { ...pad, ...patch };
    setPad(next);
    if (!selected) return;
    const prev = selected.getStyle?.() ?? {};
    selected.setStyle({
      ...prev,
      padding: `${next.t}px ${next.r}px ${next.b}px ${next.l}px`,
    });
  };

  if (!selected) return <InspectorEmpty />;

  return (
    <>
      <div className="website-builder-page__panel-group-title">Advanced</div>
      <div className="website-builder-page__form-block">
        <label className="website-builder-page__field-label" htmlFor="wb-ins-tag">
          HTML Tag
        </label>
        <select id="wb-ins-tag" className="website-builder-page__field-control" value={htmlTag} onChange={(e) => applyTag(e.target.value)}>
          <option value="section">section</option>
          <option value="header">header</option>
          <option value="div">div</option>
          <option value="article">article</option>
          <option value="main">main</option>
          <option value="nav">nav</option>
          <option value="footer">footer</option>
          <option value="h1">h1</option>
          <option value="h2">h2</option>
          <option value="p">p</option>
          <option value="a">a</option>
          <option value="img">img</option>
        </select>
      </div>
      <div className="website-builder-page__form-block">
        <label className="website-builder-page__field-label" htmlFor="wb-ins-id">
          CSS ID
        </label>
        <input id="wb-ins-id" className="website-builder-page__field-control" value={cssId} onChange={(e) => applyId(e.target.value)} placeholder="hero" />
        <p className="website-builder-page__field-hint">Used for one page navigation or custom CSS.</p>
      </div>
      <div className="website-builder-page__form-block">
        <label className="website-builder-page__field-label" htmlFor="wb-ins-cls">
          CSS Classes
        </label>
        <input
          id="wb-ins-cls"
          className="website-builder-page__field-control"
          value={cssClass}
          onChange={(e) => applyClasses(e.target.value)}
          placeholder="hero-section"
        />
      </div>

      <div className="website-builder-page__panel-group-title">Responsive</div>
      <div className="website-builder-page__form-block">
        <span className="website-builder-page__field-label">Show / Hide</span>
        <div className="website-builder-page__device-row">
          <button type="button" className="website-builder-page__device-btn is-active" aria-label="Desktop">
            <DesktopWindowsOutlinedIcon fontSize="small" />
          </button>
          <button type="button" className="website-builder-page__device-btn" aria-label="Tablet">
            <TabletMacOutlinedIcon fontSize="small" />
          </button>
          <button type="button" className="website-builder-page__device-btn" aria-label="Mobile">
            <PhoneIphoneOutlinedIcon fontSize="small" />
          </button>
        </div>
      </div>
      <div className="website-builder-page__form-block">
        <div className="website-builder-page__label-row">
          <span className="website-builder-page__field-label mb-0">Padding</span>
          <button type="button" className="website-builder-page__link-icon-btn" aria-label="Link padding" onClick={() => setPadLock((v) => !v)}>
            <LinkOutlinedIcon fontSize="small" />
          </button>
        </div>
        <div className="website-builder-page__quad-inputs">
          {(['t', 'r', 'b', 'l'] as const).map((k) => (
            <label key={k} className="website-builder-page__quad-label">
              <span>{k.toUpperCase()}</span>
              <div className="website-builder-page__input-unit">
                <input
                  type="number"
                  className="website-builder-page__field-control"
                  value={pad[k]}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    if (padLock) applyPadding({ t: n, r: n, b: n, l: n });
                    else applyPadding({ [k]: n });
                  }}
                />
                <span>px</span>
              </div>
            </label>
          ))}
        </div>
      </div>
      <div className="website-builder-page__form-block">
        <div className="website-builder-page__label-row">
          <span className="website-builder-page__field-label mb-0">Margin</span>
          <button type="button" className="website-builder-page__link-icon-btn" aria-label="Link margin" onClick={() => setMarginLock((v) => !v)}>
            <LinkOutlinedIcon fontSize="small" />
          </button>
        </div>
        <div className="website-builder-page__quad-inputs">
          {(['t', 'r', 'b', 'l'] as const).map((k) => (
            <label key={k} className="website-builder-page__quad-label">
              <span>{k.toUpperCase()}</span>
              <div className="website-builder-page__input-unit">
                <input
                  type="number"
                  className="website-builder-page__field-control"
                  value={margin[k]}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    const next = marginLock ? { t: n, r: n, b: n, l: n } : { ...margin, [k]: n };
                    setMargin(next);
                    if (!selected) return;
                    const prev = selected.getStyle?.() ?? {};
                    selected.setStyle({
                      ...prev,
                      margin: `${next.t}px ${next.r}px ${next.b}px ${next.l}px`,
                    });
                  }}
                />
                <span>px</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="website-builder-page__panel-group-title">Animation</div>
      <div className="website-builder-page__form-block">
        <label className="website-builder-page__field-label">Entrance Animation</label>
        <select className="website-builder-page__field-control" value={anim} onChange={(e) => setAnim(e.target.value)}>
          <option>None</option>
          <option>Fade In Up</option>
          <option>Fade In</option>
          <option>Slide Left</option>
        </select>
      </div>
      <div className="website-builder-page__split-input">
        <div className="website-builder-page__form-block mb-0 website-builder-page__flex-fill">
          <label className="website-builder-page__field-label">Duration</label>
          <div className="website-builder-page__input-unit">
            <input type="number" className="website-builder-page__field-control" value={animDur} onChange={(e) => setAnimDur(Number(e.target.value))} />
            <span>ms</span>
          </div>
        </div>
        <div className="website-builder-page__form-block mb-0 website-builder-page__flex-fill">
          <label className="website-builder-page__field-label">Delay</label>
          <div className="website-builder-page__input-unit">
            <input type="number" className="website-builder-page__field-control" value={animDelay} onChange={(e) => setAnimDelay(Number(e.target.value))} />
            <span>ms</span>
          </div>
        </div>
      </div>

      <div className="website-builder-page__panel-group-title">Custom CSS</div>
      <p className="website-builder-page__field-hint">Add custom CSS for this section only.</p>
      <textarea
        className="website-builder-page__field-control website-builder-page__code-editor"
        rows={8}
        value={customCss}
        onChange={(e) => setCustomCss(e.target.value)}
        spellCheck={false}
      />
    </>
  );
}
