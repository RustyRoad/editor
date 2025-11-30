// @ts-nocheck
import type { Editor, Component } from 'grapesjs';

/**
 * Consolidated Funnel Components for GrapesJS Editor
 *
 * This file consolidates all funnel-related components including:
 * - Checkout forms and buttons
 * - Dynamic content blocks (headlines, CTAs)
 * - Offer cards (tripwire, upsell, downsell)
 * - Progress indicators
 * - Address and personalization blocks
 *
 * Seamless Checkout Integration (Important):
 * -------------------------------------------------
 * The two–step checkout HTML is rendered server‑side via Tera.
 * Source: `src/views/components/seamless_checkout/_seamless_checkout.html.tera`
 * There are TWO macros:
 *   1. Legacy: `seamless_checkout(checkout_id, service_name, service_price, ...)` (kept for existing templates)
 *   2. Preferred wrapper: `seamless_checkout_from_cfg(cfg)` where `cfg` is a map of snake_case keys.
 *
 * Recommended usage in a page template:
 *   {% import "components/seamless_checkout/_seamless_checkout.html.tera" as sc %}
 *   {% set cfg = {
 *      checkout_id: "main",
 *      service_name: "Bin Cleaning Service",
 *      service_price: "29.99",
 *      service_type: "tripwire",
 *      offer_badge: "LIMITED TIME"
 *   } %}
 *   {{ sc::seamless_checkout_from_cfg(cfg=cfg) }}
 *
 * The editor placeholder ONLY renders a lightweight box. At runtime, when the saved
 * HTML (body_html) contains `seamless-checkout-container`, the layout template
 * `grapes_dynamic.html.tera` auto-includes `seamless-checkout-script.html.tera`
 * which wires up Stripe + step transitions.
 *
 * Why the editor component only shows a placeholder:
 * - This TypeScript source is bundled client-side; it's not passed through Tera.
 * - Attempting to embed raw `{{ sc::seamless_checkout(...) }}` would persist literal braces
 *   in the DB and never expand.
 * - During editing, we fetch a rendered fragment from `/funnel/partials/seamless-checkout`
 *   (endpoint must return the macro-rendered HTML) to preview the real markup.
 * - On public page render, the page's Tera template must include/import and invoke
 *   the macro so the final HTML + scripts load correctly.
 *
 * Adding new cfg keys:
 * - Add the key to controller context (or the `cfg` map in the template).
 * - Update wrapper macro (if default needed) OR rely on default filter inside markup.
 * - Update preview endpoint ( `/funnel/partials/seamless-checkout` ) parameters if the
 *   editor needs to reflect it live.
 * - No changes required to GrapesJS component unless a trait / editor control is desired.
 */

// Global declarations for server-injected data. These values are populated
// by backend templates to hydrate the editor without additional fetch calls.
declare global {
  interface Window {
    __AVAILABLE_OFFERS__?: unknown; // Raw offers payload (normalized client-side)
    __FUNNEL_CONTEXT__?: { sessionToken?: string; [k: string]: unknown };
  }
}

/** Offer-related interfaces */
export interface NormalizedOffer {
  token: string;
  label: string;
  description?: string;
  priceCents?: number;
  currency?: string;
  offerType?: string;
  creditsPerCycle?: number;
  rolloverCap?: number | null;
}

type OfferListener = (data: NormalizedOffer[], meta: { loaded: boolean }) => void;

interface OfferStore {
  ensureFetch: () => Promise<NormalizedOffer[]>;
  getTraitOptions: () => Array<{ id: string; value: string; name: string }>;
  subscribe: (listener: OfferListener) => () => void;
  findByToken: (token?: string | null) => NormalizedOffer | undefined;
  isLoaded: () => boolean;
  getOffers: () => NormalizedOffer[];
  setOffers: (incoming: unknown) => NormalizedOffer[];
}

/** Component type constants to avoid magic strings */
export const COMPONENT_TYPES = {
  CHECKOUT_FORM: 'funnel-checkout-form',
  DYNAMIC_HEADLINE: 'dynamic-headline',
  DYNAMIC_CTA_BUTTON: 'dynamic-cta-button',
  PROGRESS: 'funnel-progress',
  TRIPWIRE_CARD: 'tripwire-offer-card',
  UPSELL_CARD: 'upsell-card',
  // Seamless checkout components
  SEAMLESS_CHECKOUT_CONTAINER: 'seamless-checkout-container',
  STEP_ONE_CONFIRMATION: 'step-one-confirmation', 
  STEP_TWO_PAYMENT: 'step-two-payment',
  CONTINUE_TO_PAYMENT_BUTTON: 'continue-payment-button',
  CHECKOUT_PROGRESS_INDICATOR: 'checkout-progress-indicator'
} as const;

/** Flow mode constants */
export const FLOW_MODES = {
  REDIRECT: 'redirect',
  VALIDATE_THEN_CHECKOUT: 'validate_then_checkout',
} as const;

/** Input name constants */
export const INPUT_NAMES = {
  OFFER: 'offer',
  TOKEN: 'tok',
  ADDRESS_ID: 'address_id',
  SERVICE_ID: 'service_id',
  EMAIL: 'email',
} as const;

/** Centralized API endpoint paths */
export const API_ENDPOINTS = {
  INITIATE_CHECKOUT: '/api/checkout/initiate',
} as const;

export const formatCurrency = (cents: number, currency: string = 'USD'): string => {
  const amount = cents / 100;
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `$${amount.toFixed(2)}`;
  }
};

const formatOfferType = (value?: string | null): string | undefined => {
  if (!value) return undefined;
  return value
    .toString()
    .split(/[-_]/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const parseNumeric = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    const parsed = Number(trimmed);
    if (!Number.isNaN(parsed) && Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return undefined;
};

const parseNullableNumeric = (value: unknown): number | null | undefined => {
  if (value === null) return null;
  return parseNumeric(value);
};

export const OFFER_TYPE_BADGE_BASE =
  'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide';

export const OFFER_TYPE_BADGE_COLORS: Record<string, string> = {
  standard: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  'rollover-upsell': 'bg-purple-100 text-purple-700 border border-purple-200',
  'rollover_credits': 'bg-purple-100 text-purple-700 border border-purple-200',
  upsell: 'bg-indigo-100 text-indigo-700 border border-indigo-200',
};

const OFFER_TYPE_LABELS: Record<string, string> = {
  'rollover-upsell': 'Credit Upsell',
  'rollover_credits': 'Credit Upsell',
};

export const getOfferTypePresentation = (rawType?: string | null) => {
    const normalized = (rawType || 'standard').toLowerCase();
    const label = OFFER_TYPE_LABELS[normalized] || formatOfferType(normalized) || 'Standard';
    const color = OFFER_TYPE_BADGE_COLORS[normalized] || 'bg-slate-100 text-slate-700 border border-slate-200';
    return { normalized, label, className: `${OFFER_TYPE_BADGE_BASE} ${color}` };
};

const normalizeOfferList = (entries: unknown): NormalizedOffer[] => {
  const list = Array.isArray(entries)
    ? entries
    : Array.isArray((entries as Record<string, unknown>)?.offers)
    ? ((entries as Record<string, unknown>).offers as unknown[])
    : [];

  return list
    .map((item): NormalizedOffer | null => {
      if (!item || typeof item !== 'object') return null;

      const record = item as Record<string, any>;
      const token =
        record.link_token ||
        record.token ||
        record.value ||
        record.offer_token ||
        record.id ||
        '';

      const label =
        record.name ||
        record.offer_name ||
        record.product_name ||
        record.title ||
        record.label ||
        '';

      if (!token || !label) return null;

      const rolloverMeta =
        record.rollover && typeof record.rollover === 'object' && record.rollover !== null
          ? (record.rollover as Record<string, unknown>)
          : undefined;
      const rolloverDescription = rolloverMeta?.['description'];
      const rolloverCreditsPerCycle = rolloverMeta?.['credits_per_cycle'] ?? rolloverMeta?.['creditsPerCycle'];
      const rolloverCap = rolloverMeta?.['rollover_cap'] ?? rolloverMeta?.['rolloverCap'];
      const pricingMeta =
        record.pricing && typeof record.pricing === 'object' && record.pricing !== null
          ? (record.pricing as Record<string, unknown>)
          : undefined;

      const description: string | undefined =
        record.description ||
        record.offer_description ||
        record.product_description ||
        (typeof rolloverDescription === 'string' ? (rolloverDescription as string) : undefined);

      const resolvePriceCents = (): number | undefined => {
        const candidates = [
          record.price_cents,
          record.priceCents,
          record.unit_amount_cents,
          record.unitAmountCents,
          record.amount_cents,
          record.amountCents,
          pricingMeta?.['unit_amount_cents'],
          pricingMeta?.['unitAmountCents'],
          pricingMeta?.['amount_cents'],
          pricingMeta?.['amountCents'],
          rolloverMeta?.['unit_amount_cents'],
        ];

        for (const value of candidates) {
          if (typeof value === 'number' && Number.isFinite(value)) return Math.round(value);
        }

        if (typeof record.price === 'number' && Number.isFinite(record.price)) {
          return Math.round(record.price * 100);
        }

        if (typeof record.price === 'string') {
          const parsed = parseFloat(record.price.replace(/[^0-9.]/g, ''));
          if (!Number.isNaN(parsed)) {
            return Math.round(parsed * 100);
          }
        }

        return undefined;
      };

      const priceCents = resolvePriceCents();
      const currencySource =
        record.currency ||
        record.price_currency ||
        pricingMeta?.['currency'] ||
        rolloverMeta?.['currency'] ||
        'USD';
      const currency: string | undefined = currencySource
        ?.toString()
        .toUpperCase();
      const offerType: string | undefined = record.offer_type
        ? String(record.offer_type)
        : record.type
        ? String(record.type)
        : record.kind
        ? String(record.kind)
        : record.offerType
        ? String(record.offerType)
        : undefined;

      const resolveCreditsPerCycle = (): number | undefined => {
        const candidates = [
          record.credits_per_cycle,
          record.creditsPerCycle,
          record.rollover_credits_per_cycle,
          record.rolloverCreditsPerCycle,
          rolloverCreditsPerCycle,
        ];

        for (const candidate of candidates) {
          const numeric = parseNumeric(candidate);
          if (typeof numeric === 'number') {
            return Math.round(numeric);
          }
        }

        return undefined;
      };

      const resolveRolloverCap = (): number | null | undefined => {
        const candidates = [
          record.rollover_cap,
          record.rolloverCap,
          rolloverCap,
        ];

        for (const candidate of candidates) {
          const numeric = parseNullableNumeric(candidate);
          if (numeric === null) {
            return null;
          }
          if (typeof numeric === 'number') {
            return Math.round(numeric);
          }
        }

        return undefined;
      };

      return {
        token: String(token),
        label: String(label),
        description: description ? String(description) : undefined,
        priceCents,
        currency,
        offerType,
        creditsPerCycle: resolveCreditsPerCycle(),
        rolloverCap: resolveRolloverCap(),
      };
    })
    .filter((offer): offer is NormalizedOffer => Boolean(offer));
};

const createOfferStore = (): OfferStore => {
  let offers: NormalizedOffer[] = [];
  let loaded = false;
  let fetchPromise: Promise<NormalizedOffer[]> | null = null;
  const listeners = new Set<(data: NormalizedOffer[], meta: { loaded: boolean }) => void>();

  const notify = () => {
    const meta = { loaded };
    listeners.forEach((listener) => {
      try {
        listener(offers, meta);
      } catch (err) {
        console.warn('[Funnel Components] Offer listener failed', err);
      }
    });
  };

  const setOffers = (incoming: unknown): NormalizedOffer[] => {
    offers = normalizeOfferList(incoming);
    loaded = true;
    notify();
    return offers;
  };

  const ensureFetch = () => {
    if (fetchPromise) return fetchPromise;
    if (typeof fetch === 'undefined') {
      loaded = true;
      notify();
      return Promise.resolve(offers);
    }

    fetchPromise = fetch('/api/admin/offers/list-simple', {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const body = await response.json().catch(() => []);
        return setOffers(body);
      })
      .catch((error) => {
        console.warn('[Funnel Components] Failed to load offers', error);
        loaded = true;
        offers = [];
        notify();
        return offers;
      });

    return fetchPromise;
  };

  const getTraitOptions = () => {
    if (!loaded && offers.length === 0) {
      return [{ id: '', value: '', name: 'Loading offers…' }];
    }

    if (offers.length === 0) {
      return [{ id: '', value: '', name: 'No offers available' }];
    }

    return [
      { id: '', value: '', name: 'Select an offer' },
      ...offers.map((offer) => ({
        id: offer.token,
        value: offer.token,
        name:
          offer.offerType && offer.offerType.toLowerCase() !== 'standard'
            ? `${offer.label} (${OFFER_TYPE_LABELS[offer.offerType.toLowerCase()] || formatOfferType(offer.offerType)})`
            : offer.label,
      })),
    ];
  };

  const subscribe = (
    listener: OfferListener,
  ): (() => void) => {
    listeners.add(listener);
    listener(offers, { loaded });
    return () => listeners.delete(listener);
  };

  const findByToken = (token?: string | null) =>
    token ? offers.find((offer) => offer.token === token) : undefined;

  if (typeof window !== 'undefined') {
    window.addEventListener('offers:updated', (event: Event) => {
      try {
        const detail = (event as CustomEvent).detail;
        setOffers(detail);
      } catch (err) {
        console.warn('[Funnel Components] offers:updated handler failed', err);
      }
    });

    if (window.__AVAILABLE_OFFERS__) {
      setOffers(window.__AVAILABLE_OFFERS__);
    }
  }

  return {
    ensureFetch,
    getTraitOptions,
    subscribe,
    findByToken,
    isLoaded: () => loaded,
    getOffers: () => offers.slice(),
    setOffers,
  };
};

export const offerStore: OfferStore = createOfferStore();

export const TRIPWIRE_DEFAULTS = {
  title: 'One-Time Bin Cleaning',
  price: '$29',
  description: 'Professional cleaning of your trash bins. See the difference immediately!',
} as const;



/** Interface for trait definitions */
export interface Trait {
  type: string;
  label: string;
  name: string;
  options?: Array<{ id: string; name: string }>;
  changeProp?: boolean;
  min?: number;
  max?: number;
}

type SchemaThing = { '@type': 'Thing'; name: string };

export function gjsSeoFaq(editor: Editor, _opts: Record<string, any> = {}): void {
  const dc = editor.DomComponents; // untyped to avoid version-specific type deps
  const bm = editor.BlockManager;
 
  // ----------------- JSON-LD generator -----------------
  const generateJsonLd = (faqList: Component) => {
    // We rely on data-gjs-type to find components (robust across reloads)
    const items = faqList.find('[data-gjs-type="faq-item"]');
    const entities: any[] = [];

    items.forEach((item) => {
      const qCmp = item.find('[data-gjs-type="faq-question"]')[0];
      const aCmp = item.find('[data-gjs-type="faq-answer"]')[0];
      if (!qCmp || !aCmp) return;

      const qText = stripTags(String(qCmp.get('content') || ''));
      const aText = stripTags(String(aCmp.get('content') || ''));

      if (qText && aText) {
        entities.push({
          '@type': 'Question',
          name: qText,
          acceptedAnswer: { '@type': 'Answer', text: aText },
        });
      }
    });

    // Ensure/refresh the JSON-LD <script>
    let scriptCmp = faqList.find('script[type="application/ld+json"].faq-jsonld')[0];
    if (!entities.length) {
      if (scriptCmp) scriptCmp.remove();
      return;
    }

    const data = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: entities };
    const json = JSON.stringify(data, null, 2);

    if (!scriptCmp) {
      scriptCmp = faqList.append({
        type: 'faq-jsonld',
        components: [{ type: 'textnode', content: json }],
      }) as unknown as Component;
    } else {
      const kids = scriptCmp.components();
      if (kids.length) kids.at(0).set('content', json);
      else scriptCmp.append({ type: 'textnode', content: json });
    }
  };

  const debouncedGenerate = debounce(generateJsonLd, 60);

  // ----------------- Types -----------------
  dc.addType('faq-question', {
    isComponent: (el: HTMLElement) =>
      el.getAttribute?.('data-gjs-type') === 'faq-question' ? { type: 'faq-question' } : false,
    extend: 'text',
    model: {
      defaults: {
        name: 'FAQ Question',
        tagName: 'summary',
        editable: true,
        draggable: false,
        attributes: { class: 'faq-question', 'data-gjs-type': 'faq-question' },
      },
    },
  });

  dc.addType('faq-answer', {
    isComponent: (el: HTMLElement) =>
      el.getAttribute?.('data-gjs-type') === 'faq-answer' ? { type: 'faq-answer' } : false,
    extend: 'text',
    model: {
      defaults: {
        name: 'FAQ Answer',
        tagName: 'div',
        editable: true,
        draggable: false,
        attributes: { class: 'faq-answer', 'data-gjs-type': 'faq-answer' },
      },
    },
  });

  dc.addType('faq-item', {
    isComponent: (el: HTMLElement) =>
      el.getAttribute?.('data-gjs-type') === 'faq-item' ? { type: 'faq-item' } : false,
    model: {
      defaults: {
        name: 'FAQ Item',
        tagName: 'details',
        attributes: { class: 'faq-item', 'data-gjs-type': 'faq-item' },
        droppable: false,
        components: [
          { type: 'faq-question', content: 'What is your return policy?' },
          {
            type: 'faq-answer',
            content:
              '<p>We accept returns within 30 days of delivery with proof of purchase.</p>',
          },
        ],
        // Toolbar: add a button to remove and a button to toggle open
        toolbar: [
          { attributes: { class: 'fa fa-trash' }, command: 'tlb-delete' },
          {
            attributes: { class: 'fa fa-chevron-down', title: 'Toggle open' },
            command(ed: Editor) {
              const sel = ed.getSelected();
              if (!sel) return;
              const attrs = sel.getAttributes();
              if ((attrs as any).open) sel.removeAttributes('open');
              else sel.addAttributes({ open: true });
            },
          },
        ],
      },
    },
  });

  dc.addType('faq-jsonld', {
    isComponent: (el: HTMLElement) =>
      el.getAttribute?.('data-gjs-type') === 'faq-jsonld' ? { type: 'faq-jsonld' } : false,
    model: {
      defaults: {
        name: 'FAQ JSON-LD',
        tagName: 'script',
        attributes: {
          type: 'application/ld+json',
          class: 'faq-jsonld',
          'data-gjs-type': 'faq-jsonld',
        },
        editable: false,
        copyable: false,
        selectable: false,
        draggable: false,
        highlightable: false,
        layerable: false,
      },
    },
  });

  dc.addType('faq-list', {
    isComponent: (el: HTMLElement) =>
      el.getAttribute?.('data-gjs-type') === 'faq-list' ? { type: 'faq-list' } : false,
    model: {
      defaults: {
        name: 'FAQ (SEO)',
        tagName: 'section',
        attributes: {
          class: 'faq',
          'aria-label': 'Frequently Asked Questions',
          'data-gjs-type': 'faq-list',
        },
        droppable: '[data-gjs-type="faq-item"]',
        components: [
          {
            type: 'text',
            tagName: 'h2',
            attributes: { class: 'faq-title' },
            content: 'Frequently Asked Questions',
          },
          { type: 'faq-item' },
          {
            type: 'faq-item',
            components: [
              { type: 'faq-question', content: 'Do you ship internationally?' },
              { type: 'faq-answer', content: '<p>Yes, we ship internationally.</p>' },
            ],
          },
        ],
        traits: [
          { type: 'text', label: 'Title', name: 'faqTitle', changeProp: true },
        ],
        faqTitle: 'Frequently Asked Questions',
        // Toolbar: add item + rebuild JSON-LD
        toolbar: [
          {
            attributes: { class: 'fa fa-plus', title: 'Add FAQ Item' },
            command: 'faq-add-item',
          },
          {
            attributes: { class: 'fa fa-refresh', title: 'Rebuild JSON-LD' },
            command: 'faq-jsonld-rebuild',
          },
        ],
      },
      init(this: any) {
        // Sync JSON-LD on create
        // `this` is the model instance; cast to Component for the generator's type
        const self = this as any as Component;
        generateJsonLd(self);
        (self as any).on('change:faqTitle', () => {
          const h = (self as any).find('.faq-title')[0];
          if (h) h.set('content', (self as any).get('faqTitle') || 'Frequently Asked Questions');
        });
      },
    },
  });

  // ----------------- Styles -----------------
  editor.addStyle(`
    section.faq { max-width: 800px; margin: 20px auto; line-height: 1.6; }
    section.faq .faq-title { margin: 0 0 12px; }
    section.faq details.faq-item { border: 1px solid #ddd; border-radius: 6px; padding: .5rem 1rem; margin-bottom: .5rem; }
    section.faq summary.faq-question { font-weight: 600; cursor: pointer; outline: none; }
    section.faq details[open] .faq-answer { margin-top: .5rem; }
  `);

  // ----------------- Commands -----------------
  editor.Commands.add('faq-add-item', {
    run(ed) {
      const sel = ed.getSelected();
      const list =
        sel && (sel.get('type') === 'faq-list'
          ? sel
          : (sel.closest && sel.closest('[data-gjs-type="faq-list"]')));
      if (!list) return;
      const item = list.append({ type: 'faq-item' }) as unknown as Component;
      // Focus question for quick editing
      const q = item.find('[data-gjs-type="faq-question"]')[0];
      if (q) ed.select(q);
      generateJsonLd(list);
    },
  });

  editor.Commands.add('faq-jsonld-rebuild', {
    run(ed) {
      const sel = ed.getSelected();
      const node =
        sel && (sel.get('type') === 'faq-list'
          ? sel
          : (sel.closest && sel.closest('[data-gjs-type="faq-list"]')));
      if (node) generateJsonLd(node);
    },
  });

  // ----------------- Block -----------------
  bm.add('seo-faq', {
    label: 'SEO FAQ',
    category: 'SEO / Structured Data',
    media:
      '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M4 6h16v2H4V6zm0 5h16v-2zm0 5h10v2H4v-2z"/></svg>',
    content: { type: 'faq-list' },
  });

  // ----------------- Keep JSON-LD in sync -----------------
  const shouldSync = (cmp: Component) => {
    const t = (cmp as any).get('type');
    return t === 'faq-item' || t === 'faq-question' || t === 'faq-answer';
  };

  const syncFrom = (cmp: Component) => {
    if (!cmp || !(cmp as any).closest) return;
    const faqList = (cmp as any).closest('[data-gjs-type="faq-list"]');
    if (faqList) debouncedGenerate(faqList);
  };

  editor.on('component:add', (cmp: Component) => shouldSync(cmp) && syncFrom(cmp));
  editor.on('component:remove', (cmp: Component) => shouldSync(cmp) && syncFrom(cmp));
  editor.on('component:update', (cmp: Component) => shouldSync(cmp) && syncFrom(cmp));
}
 
const TYPES = {
  GROUP: 'aeo-answer-group',
  CARD: 'aeo-answer-card',
  JSONLD: 'aeo-jsonld',
  DATACARD: 'aeo-data',
} as const;

const stripTags = (html = '') =>
  html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

const nowISO = () => new Date().toISOString();

const debounce = <T extends (...args: any[]) => void>(fn: T, wait = 80) => {
  let t: any;
  return (...args: Parameters<T>) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
};

// Parse trait text areas into arrays
const lines = (v?: string) =>
  (v || '')
    .split(/\r?\n/)
    .map(s => s.trim())
    .filter(Boolean);

// Parse "Title | URL | Publisher | YYYY-MM-DD"
function parseSources(raw: string) {
  return lines(raw).map((ln) => {
    const parts = ln.split('|').map(p => p.trim());
    const [name, url, publisher, datePublished] = parts;
    const obj: any = {};
    if (name) obj.name = name;
    if (url) obj.url = url;
    if (publisher) obj.publisher = { '@type': 'Organization', name: publisher };
    if (datePublished) obj.datePublished = datePublished;
    obj['@type'] = 'CreativeWork';
    return obj;
  });
}

function gatherCardData(card: Component) {
  const q = card.find('[data-role="question"]')[0];
  const a = card.find('[data-role="tldr"]')[0];
  const factsCmp = card.find('[data-role="facts"]')[0];
  const authorName = card.get('authorName') || '';
  const authorUrl  = card.get('authorUrl')  || '';
  const authorTitle = card.get('authorTitle') || '';
  const keywords = (card.get('keywords') || '').toString();
  const entities = (card.get('entities') || '').toString();
  const dateModified = card.get('dateModified') || nowISO();
  const sourcesRaw = card.get('sourcesRaw') || '';
  const facts = factsCmp
    ? factsCmp.components().map((li: any) => stripTags(String(li.get('content') || ''))).filter(Boolean)
    : [];

  return {
    question: stripTags(String(q?.get('content') || '')),
    answer: stripTags(String(a?.get('content') || '')),
    facts,
    keywords,
    entities,
    dateModified,
    author: authorName
      ? {
          '@type': 'Person',
          name: authorName,
          ...(authorUrl ? { url: authorUrl } : {}),
          ...(authorTitle ? { jobTitle: authorTitle } : {}),
        }
      : undefined,
    citations: parseSources(String(sourcesRaw)),
  };
}

function buildFAQPage(cards: ReturnType<typeof gatherCardData>[]) {
  const mainEntity = cards
    .filter(c => c.question && c.answer)
    .map((c) => {
      const q: any = {
        '@type': 'Question',
        name: c.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: c.answer,
          ...(c.author ? { author: c.author } : {}),
          dateModified: c.dateModified,
          ...(c.citations?.length ? { citation: c.citations } : {}),
        },
      };
      if (c.keywords) q.keywords = c.keywords;
      if (c.entities) {
        const aboutEntries = c.entities
          .split(',')
          .map((raw: string): SchemaThing => ({ '@type': 'Thing', name: raw.trim() }))
          .filter((entry: SchemaThing): entry is SchemaThing => Boolean(entry.name));
        q.about = aboutEntries;
      }
      return q;
    });

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity,
  };
}

export function gjsAeo(editor: Editor, _opts: Record<string, any> = {}): void {
  const dc = editor.DomComponents;
  const bm = editor.BlockManager;

  // ============ AEO Answer Card ============
  dc.addType(TYPES.CARD, {
    isComponent: (el) =>
      el.getAttribute?.('data-gjs-type') === TYPES.CARD ? { type: TYPES.CARD } : false,
    model: {
      defaults: {
        name: 'AEO Answer Card',
        tagName: 'section',
        attributes: {
          class:
            'aeo-card max-w-2xl mx-auto my-4 p-4 sm:p-6 rounded-lg border border-gray-200 bg-white',
          'data-gjs-type': TYPES.CARD,
        },
        components: [
          {
            type: 'text',
            tagName: 'h3',
            attributes: {
              class: 'text-xl sm:text-2xl font-bold mb-2',
              'data-role': 'question',
            },
            content: 'What is AEO (Answer Engine Optimization)?',
          },
          {
            type: 'text',
            tagName: 'p',
            attributes: {
              class: 'text-gray-900 text-base sm:text-lg mb-3',
              'data-role': 'tldr',
            },
            // ~50–80 words works well for “direct answer” extractions in AI UIs.
            content:
              'AEO is the practice of structuring content so AI systems can extract a concise, source-backed answer. It emphasizes a short TL;DR, clearly labeled facts, citations with canonical URLs, author expertise, and a recent “updated” timestamp — all mirrored in JSON-LD.',
          },
          {
            tagName: 'ul',
            attributes: {
              class: 'list-disc pl-5 text-gray-700 text-sm sm:text-base mb-4',
              'data-role': 'facts',
            },
            components: [
              { type: 'text', tagName: 'li', content: 'Concise, unambiguous definition.' },
              { type: 'text', tagName: 'li', content: '3–5 bullet “key facts”.' },
              { type: 'text', tagName: 'li', content: 'Citations from authoritative sources.' },
            ],
          },
          {
            tagName: 'div',
            attributes: { class: 'text-xs text-gray-600 mb-4', 'data-role': 'byline' },
            components: [
              {
                type: 'text',
                tagName: 'div',
                attributes: { 'data-role': 'author' },
                content: 'By <strong data-role="author-name">Your Name</strong> — <span data-role="author-title">Your Title</span>',
              },
              {
                type: 'text',
                tagName: 'div',
                attributes: { 'data-role': 'updated' },
                content:
                  'Updated <time data-role="updated-time" datetime="{{ ctx.updated_at | default(value="" , boolean=true) }}">{{ ctx.updated_at | default(value="2025-01-01", boolean=true) }}</time>',
              },
            ],
          },
          {
            tagName: 'div',
            attributes: { 'data-role': 'sources-block' },
            components: [
              {
                type: 'text',
                tagName: 'h4',
                attributes: { class: 'font-semibold mb-1' },
                content: 'Sources',
              },
              {
                tagName: 'ol',
                attributes: {
                  class: 'list-decimal pl-5 text-sm sm:text-base',
                  'data-role': 'sources',
                },
                components: [
                  {
                    type: 'text',
                    tagName: 'li',
                    content:
                      '<a href="https://developers.google.com/search/docs/fundamentals/creating-helpful-content" rel="canonical nofollow">Google: Helpful, reliable, people-first content</a>',
                  },
                ],
              },
            ],
          },
        ],

        traits: [
          { type: 'text',    name: 'question',     label: 'Question',      changeProp: true },
          { type: 'textarea',name: 'tldr',         label: 'TL;DR (concise answer)', changeProp: true },
          { type: 'textarea',name: 'factsRaw',     label: 'Facts (1 per line)',     changeProp: true },
          { type: 'text',    name: 'keywords',     label: 'Keywords (comma‑sep)',    changeProp: true },
          { type: 'text',    name: 'entities',     label: 'Entities (comma‑sep)',    changeProp: true },
          { type: 'text',    name: 'authorName',   label: 'Author Name',    changeProp: true },
          { type: 'text',    name: 'authorTitle',  label: 'Author Title',   changeProp: true },
          { type: 'text',    name: 'authorUrl',    label: 'Author URL',     changeProp: true },
          { type: 'text',    name: 'dateModified', label: 'Updated ISO',    changeProp: true },
          {
            type: 'textarea',
            name: 'sourcesRaw',
            label: 'Sources (Title | URL | Publisher | YYYY-MM-DD)',
            changeProp: true,
          },
        ],

        // Pre-populate trait values from default content
        question: 'What is AEO (Answer Engine Optimization)?',
        tldr:
          'AEO is the practice of structuring content so AI systems can extract a concise, source-backed answer. It emphasizes a short TL;DR, clearly labeled facts, citations with canonical URLs, author expertise, and a recent “updated” timestamp — all mirrored in JSON-LD.',
        factsRaw: 'Concise, unambiguous definition.\n3–5 bullet “key facts”.\nCitations from authoritative sources.',
        keywords: 'AEO, Answer Engine Optimization, AI Overviews',
        entities: 'Answer Engine Optimization, Google AI Overviews, LLMs',
        authorName: 'Your Name',
        authorTitle: 'Editor',
        authorUrl: '',
        dateModified: '{{ ctx.updated_at | default(value="2025-01-01T00:00:00Z", boolean=true) }}',
        sourcesRaw:
          'Google helpful content | https://developers.google.com/search/docs/fundamentals/creating-helpful-content | Google | 2024-12-01',
      },

      init() {
        // Keep visible HTML synced with trait edits
        this.on(
          'change:question change:tldr change:factsRaw change:authorName change:authorTitle change:authorUrl change:dateModified change:sourcesRaw',
          this.syncFromTraits,
        );
        setTimeout(() => this.syncFromTraits(), 0);
      },

      syncFromTraits() {
        const q = (this.get('question') || '').toString();
        const a = (this.get('tldr') || '').toString();
        const facts = lines(this.get('factsRaw'));
        const authorName = (this.get('authorName') || '').toString();
        const authorTitle = (this.get('authorTitle') || '').toString();
        const authorUrl = (this.get('authorUrl') || '').toString();
        const dateModified = (this.get('dateModified') || '').toString();
        const sources = parseSources(String(this.get('sourcesRaw') || ''));

        const qCmp = this.find('[data-role="question"]')[0];
        qCmp && qCmp.set('content', q || 'Question');

        const aCmp = this.find('[data-role="tldr"]')[0];
        aCmp && aCmp.set('content', a || 'Short, direct answer.');

        const factsCmp = this.find('[data-role="facts"]')[0];
        if (factsCmp) {
          factsCmp.components().reset(facts.map(f => ({ type: 'text', tagName: 'li', content: f })));
        }

        const authorNameNode = this.find('[data-role="author-name"]')[0];
        authorNameNode && authorNameNode.set('content', authorName || 'Your Name');
        const authorTitleNode = this.find('[data-role="author-title"]')[0];
        authorTitleNode && authorTitleNode.set('content', authorTitle || 'Editor');
        const authorLinkTarget = this.find('[data-role="author"]')[0];
        if (authorLinkTarget) {
          const html = authorUrl
            ? `By <a href="${authorUrl}" rel="me nofollow"><strong data-role="author-name">${authorName || 'Your Name'}</strong></a> — <span data-role="author-title">${authorTitle || 'Editor'}</span>`
            : `By <strong data-role="author-name">${authorName || 'Your Name'}</strong> — <span data-role="author-title">${authorTitle || 'Editor'}</span>`;
          authorLinkTarget.set('content', html);
        }

        const time = this.find('[data-role="updated-time"]')[0];
        if (time) {
          time.addAttributes({ datetime: dateModified });
          time.set('content', dateModified);
        }

        const srcList = this.find('[data-role="sources"]')[0];
        if (srcList) {
          const items = sources.map((s: any) => {
            const title = s.name || s.url || 'Source';
            const pub = s.publisher?.name ? ` <span class="text-gray-500">(${s.publisher.name})</span>` : '';
            return {
              type: 'text',
              tagName: 'li',
              content: s.url
                ? `<a href="${s.url}" rel="canonical nofollow">${title}</a>${pub}`
                : `${title}${pub}`,
            };
          });
          srcList.components().reset(items);
        }

        // Let the group rebuild aggregated JSON-LD
        this.emit('aeo:changed');
      },
    },
  });

  // ============ AEO Answer Group (aggregator) ============
  dc.addType(TYPES.GROUP, {
    isComponent: (el) =>
      el.getAttribute?.('data-gjs-type') === TYPES.GROUP ? { type: TYPES.GROUP } : false,
    model: {
      defaults: {
        name: 'AEO Answer Group',
        tagName: 'section',
        attributes: {
          class: 'aeo-group mx-auto my-6',
          'data-gjs-type': TYPES.GROUP,
          'aria-label': 'Answers',
        },
        droppable: `[data-gjs-type="${TYPES.CARD}"]`,
        components: [
          {
            type: 'text',
            tagName: 'h2',
            attributes: { class: 'text-2xl sm:text-3xl font-extrabold mb-3 aeo-title' },
            content:
              '{{ ctx.title | default(value="Answers & Key Facts", boolean=true) }}',
          },
          // Script containers auto-managed
        ],
        traits: [
          { type: 'text', name: 'title', label: 'Group Title', changeProp: true },
          { type: 'text', name: 'pageKeywords', label: 'Page Keywords', changeProp: true },
          { type: 'text', name: 'pageEntities', label: 'Page Entities', changeProp: true },
        ],
        title: 'Answers & Key Facts',
        pageKeywords: '',
        pageEntities: '',
      },

      init() {
        const rebuild = debounce(() => (this as any).rebuildJsonLd(), 80);
        (this as any).rebuildJsonLd = () => {
          const cards = this.find(`[data-gjs-type="${TYPES.CARD}"]`);
          const data = cards.map(gatherCardData).filter(c => c.question && c.answer);
          // FAQPage JSON-LD
          const faq = buildFAQPage(data);
          // Extra machine-readable “data card”
          const dataCard = {
            '@type': 'Dataset',
            name: this.get('title') || 'Answers',
            version: '1',
            items: data.map(d => ({
              question: d.question,
              answer: d.answer,
              facts: d.facts,
              keywords: d.keywords,
              entities: d.entities,
              dateModified: d.dateModified,
              citations: d.citations,
            })),
            ...(this.get('pageKeywords') ? { keywords: this.get('pageKeywords') } : {}),
            ...(this.get('pageEntities')
              ? { about: this.get('pageEntities').split(',').map((x: string) => x.trim()).filter(Boolean) }
              : {}),
          };

          // Ensure/refresh script nodes
          let json = this.find(`script.${TYPES.JSONLD}`)[0];
          if (!json) {
            json = this.append({
              type: 'script',
              tagName: 'script',
              attributes: { type: 'application/ld+json', class: TYPES.JSONLD },
              components: [{ type: 'textnode', content: JSON.stringify(faq, null, 2) }],
            }) as unknown as Component;
          } else {
            const kids = json.components();
            if (kids.length) kids.at(0).set('content', JSON.stringify(faq, null, 2));
          }

          let dataScript = this.find(`script.${TYPES.DATACARD}`)[0];
          if (!dataScript) {
            dataScript = this.append({
              type: 'script',
              tagName: 'script',
              attributes: { type: 'application/json', class: TYPES.DATACARD },
              components: [{ type: 'textnode', content: JSON.stringify(dataCard, null, 2) }],
            }) as unknown as Component;
          } else {
            const kids = dataScript.components();
            if (kids.length) kids.at(0).set('content', JSON.stringify(dataCard, null, 2));
          }
        };

        // Initial build and listeners
        this.on('change:title change:pageKeywords change:pageEntities', rebuild);
        this.listenTo(this.components(), 'add remove', rebuild);

        // Rebuild when any child card signals change
        this.on('component:add', (cmp: Component) => {
          if (cmp.get('type') === TYPES.CARD) {
            cmp.on('aeo:changed', rebuild);
          }
        });
        this.on('component:update', (cmp: Component) => {
          if (cmp.get('type') === TYPES.CARD) (this as any).rebuildJsonLd();
        });

        setTimeout(() => (this as any).rebuildJsonLd(), 0);
      },

      updated(property: string) {
        if (property === 'components') {
          (this as any).rebuildJsonLd();
        }
      },
    },
  });

  // ============ Block Manager ============
  bm.add(TYPES.GROUP, {
    label: 'AEO Answer Group',
    category: 'AEO',
    attributes: { class: 'fa fa-comments' },
    content: { type: TYPES.GROUP, components: [{ type: TYPES.CARD }] },
  });

  bm.add(TYPES.CARD, {
    label: 'AEO Answer Card',
    category: 'AEO',
    attributes: { class: 'fa fa-commenting-o' },
    content: { type: TYPES.CARD },
  });

  // Small style helpers
  editor.addStyle(`
    .aeo-card a { text-decoration: underline; }
    .aeo-card .list-disc li { margin-bottom: .25rem; }
  `);
}

// Optional UMD auto-register (keep only if you use <script> tags)
// if (typeof window !== 'undefined' && (window as any).grapesjs) {
//   (window as any).grapesjs.plugins.add('gjs-aeo', gjsAeo);
// }
