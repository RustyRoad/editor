import { Editor } from 'grapesjs';

/**
 * Testimonial Slider GrapesJS Component
 *
 * Goals:
 * - Show a realistic in-editor preview (so you can actually *see* the slider)
 * - Export server-rendered Tera include syntax on save/publish
 * - Keep behavior aligned with the Rust/Tera component implementation (including the 3★+ filter)
 */
export default (editor: Editor) => {
  const domc = editor.DomComponents;

  const SAMPLE_TESTIMONIALS = [
    {
      name: 'Sarah M.',
      location: 'Phoenix, AZ',
      quote: 'My bins have never been cleaner. The smell is completely gone!',
      rating: 5,
      avatar: '',
    },
    {
      name: 'A 2★ Reviewer',
      location: 'Somewhere',
      quote: 'Not great — should be filtered out in preview/runtime.',
      rating: 2,
      avatar: '',
    },
    {
      name: 'Mike R.',
      location: 'Scottsdale, AZ',
      quote: 'Professional service, fair price. Highly recommend!',
      rating: 4,
      avatar: '',
    },
  ];

  const normalizeBool = (v: unknown, fallback: boolean): boolean => {
    if (v === undefined || v === null) return fallback;
    if (typeof v === 'boolean') return v;
    if (typeof v === 'number') return v !== 0;
    if (typeof v === 'string') {
      const s = v.trim().toLowerCase();
      if (s === '' || s === '0' || s === 'false' || s === 'no' || s === 'off') return false;
      if (s === '1' || s === 'true' || s === 'yes' || s === 'on') return true;
      return fallback;
    }
    return fallback;
  };

  const normalizeInt = (v: unknown, fallback: number): number => {
    if (typeof v === 'number' && Number.isFinite(v)) return Math.trunc(v);
    if (typeof v === 'string') {
      const n = Number.parseInt(v, 10);
      if (Number.isFinite(n)) return n;
    }
    return fallback;
  };

  const initSliderInteractions = (rootEl: HTMLElement) => {
    const sliders = Array.from(rootEl.querySelectorAll<HTMLElement>('.testimonial-slider'));

    for (const slider of sliders) {
      const track = slider.querySelector<HTMLElement>('.slider-track');
      const slides = Array.from(slider.querySelectorAll<HTMLElement>('.slider-slide'));
      const dots = Array.from(slider.querySelectorAll<HTMLElement>('.slider-dot'));
      const prevBtn = slider.querySelector<HTMLElement>('.slider-prev');
      const nextBtn = slider.querySelector<HTMLElement>('.slider-next');

      let current = 0;
      const total = slides.length;
      const autoplay = slider.dataset.autoplay === 'true';
      const interval = Number.parseInt(slider.dataset.interval || '5000', 10) || 5000;
      let timer: any;

      if (!track || total === 0) continue;

      const goTo = (idx: number) => {
        current = ((idx % total) + total) % total;
        track.style.transform = `translateX(-${current * 100}%)`;
        slides.forEach((s, i) => s.classList.toggle('active', i === current));
        dots.forEach((d, i) => {
          d.classList.toggle('active', i === current);
          d.setAttribute('aria-selected', i === current ? 'true' : 'false');
        });
      };

      const resetTimer = () => {
        if (timer) clearInterval(timer);
        if (autoplay) timer = setInterval(() => goTo(current + 1), interval);
      };

      if (prevBtn) prevBtn.addEventListener('click', () => { goTo(current - 1); resetTimer(); });
      if (nextBtn) nextBtn.addEventListener('click', () => { goTo(current + 1); resetTimer(); });
      dots.forEach((dot, i) => dot.addEventListener('click', () => { goTo(i); resetTimer(); }));

      slider.addEventListener('mouseenter', () => { if (timer) clearInterval(timer); });
      slider.addEventListener('mouseleave', () => resetTimer());

      // Touch support
      let touchStartX = 0;
      let touchEndX = 0;
      slider.addEventListener('touchstart', (e: TouchEvent) => {
        touchStartX = e.changedTouches[0]?.screenX || 0;
      }, { passive: true });
      slider.addEventListener('touchend', (e: TouchEvent) => {
        touchEndX = e.changedTouches[0]?.screenX || 0;
        if (touchStartX - touchEndX > 50) {
          goTo(current + 1);
          resetTimer();
        } else if (touchEndX - touchStartX > 50) {
          goTo(current - 1);
          resetTimer();
        }
      }, { passive: true });

      resetTimer();
    }
  };

  domc.addType('testimonial-slider', {
    isComponent: (el) => el?.getAttribute?.('data-gjs-type') === 'testimonial-slider',
    model: {
      defaults: {
        name: 'Testimonial Slider',
        tagName: 'div',
        draggable: true,
        droppable: false,
        removable: true,
        attributes: {
          class: 'testimonial-slider-container',
          'data-component': 'testimonial_slider',
          'data-gjs-type': 'testimonial-slider',
          // Persistable editor-config (simple + valid attribute names)
          theme: 'dark',
          autoplay: 'true',
          interval: '5000',
          show_dots: 'true',
          show_arrows: 'true',
        },
        traits: [
          {
            type: 'select',
            name: 'theme',
            label: 'Theme',
            options: [
              { id: 'dark', name: 'Dark' },
              { id: 'light', name: 'Light' },
            ],
          },
          {
            type: 'checkbox',
            name: 'autoplay',
            label: 'Autoplay',
          },
          {
            type: 'number',
            name: 'interval',
            label: 'Interval (ms)',
            min: 1000,
            max: 30000,
          },
          {
            type: 'checkbox',
            name: 'show_dots',
            label: 'Show Dots',
          },
          {
            type: 'checkbox',
            name: 'show_arrows',
            label: 'Show Arrows',
          },
        ],
        components: `
          <div class="placeholder-content p-8 border-2 border-dashed border-cyan-500 rounded-lg text-center">
            <div class="text-cyan-500 text-xl mb-2">🎠 Testimonial Slider</div>
            <div class="text-gray-400 text-sm">Loading preview…</div>
            <div class="mt-2 text-xs text-gray-500">Preview shows 3★+ only</div>
          </div>
        `,
      },

      /**
       * Export server-side Tera syntax.
       *
       * The controller/context is responsible for providing `testimonials` at render time.
       */
      toHTML() {
        const attrs = (this as any).getAttributes?.() || {};
        const theme = typeof attrs.theme === 'string' ? attrs.theme : 'dark';
        const autoplay = normalizeBool(attrs.autoplay, true);
        const interval = normalizeInt(attrs.interval, 5000);
        const showDots = normalizeBool(attrs.show_dots, true);
        const showArrows = normalizeBool(attrs.show_arrows, true);

        return `{% set theme = "${theme}" %}\n` +
          `{% set autoplay = ${autoplay} %}\n` +
          `{% set interval = ${interval} %}\n` +
          `{% set show_dots = ${showDots} %}\n` +
          `{% set show_arrows = ${showArrows} %}\n` +
          `{% include "components/testimonial_slider.html.tera" %}`;
      },
    },

    view: {
      async onRender() {
        try {
          await (this as any)._renderPreview();
        } catch (e) {
          // Leave the placeholder if preview fails.
          // eslint-disable-next-line no-console
          console.warn('[testimonial-slider] preview render failed:', e);
        }
      },

      async _renderPreview() {
        const model = (this as any).model;
        const rootEl = (this as any).el as HTMLElement;
        if (!rootEl || !model) return;

        const attrs = model.getAttributes?.() || {};

        const theme = typeof attrs.theme === 'string' ? attrs.theme : 'dark';
        const autoplay = normalizeBool(attrs.autoplay, true);
        const interval = normalizeInt(attrs.interval, 5000);
        const showDots = normalizeBool(attrs.show_dots, true);
        const showArrows = normalizeBool(attrs.show_arrows, true);

        const config = {
          testimonials: SAMPLE_TESTIMONIALS,
          theme,
          autoplay,
          interval,
          show_dots: showDots,
          show_arrows: showArrows,
        };

        // Always attempt to render via the server registry (most accurate).
        // If it fails, fall back to a lightweight local preview.
        try {
          const resp = await fetch('/api/component-registry/render', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ component_type: 'testimonial_slider', config }),
          });

          if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

          const data = await resp.json();
          const html = typeof data?.html === 'string' ? data.html : '';
          if (!html) throw new Error('Empty render result');

          rootEl.innerHTML = html;

          // The server template includes <script> tags which browsers don't execute when inserted via innerHTML.
          // We remove them and run the slider init logic ourselves.
          rootEl.querySelectorAll('script').forEach((s) => s.remove());

          initSliderInteractions(rootEl);
          return;
        } catch (e) {
          // Fallback: render a simple, accurate-enough preview without backend.
          // Note: We still simulate the 3★+ rule by excluding the 2★ sample.
          const shown = SAMPLE_TESTIMONIALS.filter((t) => !t.rating || t.rating >= 3);
          const sliderHtml = `
            <div class="testimonial-slider ${theme}" data-autoplay="${autoplay}" data-interval="${interval}">
              <div class="slider-track">
                ${shown
                  .map((t, i) => `
                    <div class="slider-slide ${i === 0 ? 'active' : ''}">
                      <div class="testimonial-card">
                        <blockquote class="testimonial-quote">"${t.quote}"</blockquote>
                        <div class="testimonial-author">
                          <span class="testimonial-name">${t.name}</span>
                          <span class="testimonial-location">${t.location || ''}</span>
                        </div>
                        <div class="testimonial-stars" aria-label="${t.rating} out of 5 stars">${'★'.repeat(t.rating || 0)}${'☆'.repeat(5 - (t.rating || 0))}</div>
                      </div>
                    </div>
                  `)
                  .join('')}
              </div>
              ${showDots && shown.length > 1
                ? `<div class="slider-dots">${shown
                    .map((_, i) => `<button class="slider-dot ${i === 0 ? 'active' : ''}" data-index="${i}" aria-selected="${i === 0}"></button>`)
                    .join('')}</div>`
                : ''}
              ${showArrows && shown.length > 1
                ? '<button class="slider-arrow slider-prev" aria-label="Previous testimonial">‹</button><button class="slider-arrow slider-next" aria-label="Next testimonial">›</button>'
                : ''}
            </div>
          `;

          rootEl.innerHTML = sliderHtml;
          initSliderInteractions(rootEl);

          // eslint-disable-next-line no-console
          console.warn('[testimonial-slider] using fallback preview:', e);
        }
      },
    },
  });
};
