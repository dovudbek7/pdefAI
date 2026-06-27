export type PageFormatId = 'a4' | 'a5' | 'b5' | 'custom';

export interface PageFormat {
  id: PageFormatId;
  label: string;
  widthMm: number;
  heightMm: number;
}

export interface Margins {
  top: number; // mm
  bottom: number;
  inner: number; // gutter (toward spine)
  outer: number;
}

export type NumberPosition = 'bottom-center' | 'bottom-outer' | 'top-outer';
export type NumberStyle = 'arabic' | 'roman';

export interface NumberSettings {
  enabled: boolean;
  startAtPage: number; // physical page index (1-based) where numbering begins
  startFrom: number; // the number shown on that first numbered page
  position: NumberPosition;
  style: NumberStyle;
}

export interface BookMeta {
  title: string;
  author: string;
  year: number;
  cover?: string; // base64 data URL — rendered as CoverPage before page 1
}

// How a paragraph that doesn't fit the remaining space is handled:
//  'fill'      → split at a word boundary, rest flows to next page
//  'paragraph' → keep whole, move the entire paragraph to the next page
export type PageBreakMode = 'fill' | 'paragraph';

export interface Typography {
  bodyFont: string;
  bodySizePt: number;
  lineHeight: number;
  paragraphIndent: boolean;
  justify: boolean;
  pageBreak: PageBreakMode;
}

export type ViewMode = 'split' | 'editor' | 'preview';

// One laid-out page produced by the paginator
export interface RenderedPage {
  index: number; // 0-based physical
  html: string; // inner HTML of the page body
  runningHead: string; // header text (chapter/book title)
  pageLabel: string | null; // formatted page number, or null if hidden
}

// A table-of-contents entry derived from headings
export interface TocEntry {
  id: string;
  level: 1 | 2 | 3;
  text: string;
  pageLabel: string | null;
  pageIndex: number;
}
