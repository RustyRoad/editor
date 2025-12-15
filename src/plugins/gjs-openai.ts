import initFunnelComponents from '../components';
import { registerBlocks } from '../blocks';
import axios from 'axios';

const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;

export default (editor: any, opts: any = {}) => {
  const { apiKey, uploadUrl = '/api/upload-image-from-url', proxyUrl = '/api' } = opts;
  const DEFAULT_API_KEY = 'lm-studio';
  // Deployment differences: some environments expose AI at root, others under /api.
  const apiRoot = '';
  const apiScoped = '/api';
  const proxyBase = (proxyUrl || '/api').replace(/\/+$/, '');

  // Helper: POST with root→/api fallback on 404
  async function postWithFallback(pathRoot: string, pathApi: string, body: any, headers: any) {
    try {
      return await axios.post(`${apiRoot}${pathRoot}`, body, { headers });
    } catch (e: any) {
      if (e?.response?.status === 404) {
        return await axios.post(`${apiScoped}${pathApi}`, body, { headers });
      }
      throw e;
    }
  }

  function makeHeaders(isJson = true) {
    const headers: any = {};
    const key = apiKey || DEFAULT_API_KEY;
    headers['Authorization'] = `Bearer ${key}`;
    if (isJson) headers['Content-Type'] = 'application/json';
    return headers;
  }

  /**
   * Back-compat helper: older prompts may return JSON like {"html_content":"<div>..."}.
   * Newer prompts should return raw HTML.
   */
  function tryExtractHtmlFromJsonString(maybeJson: string): string | null {
    const trimmed = (maybeJson || '').trim();
    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return null;
    try {
      const parsed = JSON.parse(trimmed);
      if (typeof parsed?.html_content === 'string') return parsed.html_content;
      if (typeof parsed?.data?.html_content === 'string') return parsed.data.html_content;
    } catch {
      // ignore
    }
    return null;
  }

  // --- Initial Check ---
  // With local proxy, we don't require a client-side API key; backend reads it from session
  if (!apiKey) {
    editor.log('No apiKey provided; using default LM Studio token ("lm-studio").', {
      level: 'info', ns: 'gjs-openai'
    });
  }

  const modal = editor.Modal;

  // --- Inject CSS for Loading States ---
  const css = editor.CssComposer;
  css.addRules(`
    .ai-image-loading::after {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background-color: rgba(0,0,0,0.5);
      z-index: 1;
      border-radius: inherit;
    }
    .ai-image-loading::before {
      content: '';
      position: absolute;
      top: 50%; left: 50%;
      width: 30px; height: 30px;
      margin-top: -15px; margin-left: -15px;
      border-radius: 50%;
      border: 3px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      animation: ai-spinner 0.8s linear infinite;
      z-index: 2;
    }
    @keyframes ai-spinner {
      to { transform: rotate(360deg); }
    }
  `);

  // --- Trait Definitions ---
  editor.TraitManager.addType('ai-button', {
    createInput({ trait }: any) {
      const el = document.createElement('div');
      const commandId = trait.get('command');
      const label = trait.get('label') || 'Run Command';
      el.innerHTML = `<button type="button" class="gjs-trt-button" style="width: 100%; margin-top: 10px;">${label}</button>`;
      const button = el.querySelector('button') as HTMLButtonElement;
      button.addEventListener('mousedown', (e) => {
        e.stopPropagation(); // Prevent GrapesJS from interfering
        editor.runCommand(commandId, {
          component: trait.target,
        });
      });
      return el;
    },
    onUpdate() {},
    onEvent() {},
  });

  // --- Helper Functions for Prompt Construction ---
  function constructHtmlPromptBasedOnUserInput() {
    const modalContainer = document.getElementById('html-prompt-creation-modal');
    const currentMode = modalContainer ? modalContainer.getAttribute('data-input-mode') : 'plain';
    if (currentMode === 'plain') {
      const description = (document.getElementById('html-plain-description') as HTMLTextAreaElement)?.value.trim() || 'A simple hero section.';
      return [
        'Generate a single self-contained HTML fragment for a marketing page section.',
        'Requirements:',
        '- Use ONLY Tailwind CSS utility classes (mobile-first).',
        '- Default can be LIGHT mode, but MUST support dark mode via `dark:` variants (dark-mode friendly).',
        '- No external CSS, no <style> tags, no <script> tags, no inline onclick handlers.',
        '- Output ONLY HTML (no markdown fences, no commentary, no JSON).',
        '- Output a fragment only (no <html>, <head>, <body>).',
        '- Use semantic markup and accessible buttons/links (e.g., <button type="button">).',
        '',
        'Style guide (match our modern landing page aesthetic):',
        '- Clean, premium, modern layout; generous spacing; crisp typography.',
        '- Use rounded-2xl cards, subtle borders/rings, and optional ambient gradient glows with blur.',
        '- Use neutral slates for surfaces and an emerald/teal accent for CTAs and highlights.',
        '- Ensure readable contrast in both light and dark modes (use `dark:` classes for bg/text/borders).',
        '',
        'Section description:',
        description,
      ].join('\n');
    }

    const goal = (document.getElementById('html-page-goal') as HTMLInputElement)?.value || 'Not specified';
    const targetAudience = (document.getElementById('html-target-audience') as HTMLInputElement)?.value || 'Not specified';
    const keyMessage = (document.getElementById('html-key-message') as HTMLTextAreaElement)?.value || 'Not specified';
    const desiredElements = (document.getElementById('html-desired-elements') as HTMLTextAreaElement)?.value || 'Not specified';
    const primaryCTA = (document.getElementById('html-cta') as HTMLInputElement)?.value || '';

    return [
      'Generate a single self-contained HTML fragment for a marketing page section.',
      'Requirements:',
      '- Use ONLY Tailwind CSS utility classes (mobile-first).',
      '- Default can be LIGHT mode, but MUST support dark mode via `dark:` variants (dark-mode friendly).',
      '- No external CSS, no <style> tags, no <script> tags, no inline onclick handlers.',
      '- Output ONLY HTML (no markdown fences, no commentary, no JSON).',
      '- Output a fragment only (no <html>, <head>, <body>).',
      '- Use semantic markup and accessible buttons/links (e.g., <button type="button">).',
      '',
      'Style guide (match our modern landing page aesthetic):',
      '- Clean, premium, modern layout; generous spacing; crisp typography.',
      '- Use rounded-2xl cards, subtle borders/rings, and optional ambient gradient glows with blur.',
      '- Use neutral slates for surfaces and an emerald/teal accent for CTAs and highlights.',
      '- Ensure readable contrast in both light and dark modes (use `dark:` classes for bg/text/borders).',
      '',
      'Structured inputs:',
      `- Goal: ${goal}`,
      `- Target audience: ${targetAudience}`,
      `- Key message: ${keyMessage}`,
      `- Desired elements: ${desiredElements}`,
      primaryCTA ? `- Primary CTA text: ${primaryCTA}` : '- Primary CTA text: (not specified)',
    ].join('\n');
  }

  function constructDetailedPromptBasedOnUserInput() {
    const instructions = (document.getElementById('text-instructions') as HTMLTextAreaElement)?.value.trim();
    if (!instructions) return "Generate a short paragraph of placeholder text.";

    let toneStyle = (document.getElementById('text-tone-style') as HTMLInputElement)?.value.trim();
    let prompt = `You are a copywriting assistant. Fulfill the following request:\n\n${instructions}`;
    if (toneStyle) {
      prompt += `\n\nPlease write this in a ${toneStyle} tone.`;
    }
    return prompt;
  }

  function constructAudioPromptBasedOnUserInput() {
    return (document.getElementById('audio-instructions') as HTMLTextAreaElement)?.value.trim() || "Hello, this is a test audio message.";
  }

  function constructSalesLetterPromptBasedOnUserInput() {
    const productService = (document.getElementById('sales-product-service') as HTMLInputElement)?.value.trim() || '';
    const targetAudience = (document.getElementById('sales-target-audience') as HTMLInputElement)?.value.trim() || '';
    const keyBenefits = (document.getElementById('sales-key-benefits') as HTMLTextAreaElement)?.value.trim() || '';
    const painPoints = (document.getElementById('sales-pain-points') as HTMLTextAreaElement)?.value.trim() || '';
    const cta = (document.getElementById('sales-cta') as HTMLInputElement)?.value.trim() || '';
    const tone = (document.getElementById('sales-tone') as HTMLSelectElement)?.value || 'professional';
    const letterType = (document.getElementById('sales-letter-type') as HTMLSelectElement)?.value || 'direct';

    let prompt = `You are a professional copywriter for Spotless Bin Co., specializing in sales letters. Generate a compelling ${letterType} sales letter with the following specifications:\n\n`;
    
    if (productService) {
      prompt += `Product/Service: ${productService}\n`;
    }
    
    if (targetAudience) {
      prompt += `Target Audience: ${targetAudience}\n`;
    }
    
    if (keyBenefits) {
      prompt += `Key Benefits:\n${keyBenefits}\n`;
    }
    
    if (painPoints) {
      prompt += `Pain Points to Address:\n${painPoints}\n`;
    }
    
    if (cta) {
      prompt += `Call to Action: ${cta}\n`;
    }
    
    prompt += `\nTone: ${tone}\n`;
    prompt += `\nWrite a complete, persuasive sales letter using proven copywriting techniques. Include:
    - An attention-grabbing headline
    - A compelling opening that addresses the reader's pain points
    - Clear benefits and value propositions
    - Social proof or credibility indicators where appropriate
    - A strong call to action
    - Proper formatting with paragraphs and spacing
    
    Return ONLY the sales letter content, properly formatted for HTML (use <p> tags for paragraphs, <h2> for headlines, <ul>/<li> for lists if needed). Do not include explanations or metadata.`;
    
    return prompt;
  }

  // --- Models API helpers ---
  async function fetchModels(): Promise<string[]> {
    // Try root first, then /api
    // Handle both { models } (Rust) and { data: { models } } (TypeScript API) formats
    try {
      const r = await fetch('/ai/models', { credentials: 'include' });
      if (r.ok) { 
        const j = await r.json(); 
        const models = j.models || j.data?.models;
        return Array.isArray(models) ? models : []; 
      }
    } catch {}
    try {
      const r = await fetch('/api/ai/models', { credentials: 'include' });
      if (r.ok) { 
        const j = await r.json(); 
        const models = j.models || j.data?.models;
        return Array.isArray(models) ? models : []; 
      }
    } catch {}
    return [];
  }

  /**
   * Groups models by provider for better UX in the dropdown
   */
  function groupModelsByProvider(models: string[]): { provider: string; models: string[] }[] {
    const groups: { [key: string]: string[] } = {
      'Gemini': [],
      'OpenAI': [],
      'Local': [],
    };

    for (const model of models) {
      if (model.startsWith('gemini-')) {
        groups['Gemini'].push(model);
      } else if (model.startsWith('gpt-')) {
        groups['OpenAI'].push(model);
      } else {
        groups['Local'].push(model);
      }
    }

    return Object.entries(groups)
      .filter(([, models]) => models.length > 0)
      .map(([provider, models]) => ({ provider, models }));
  }

  async function hydrateModelSelect(select: HTMLSelectElement | null) {
    if (!select) return;
    try {
        const models = await fetchModels();
        const isAudio = (select.id || '').includes('audio');
        // Previously used fallbackTextModels and fallbackAudioModels; now use only fetched models.
        let toUse: string[] = [];
        if (isAudio) {
            // Keep only models that look like TTS or audio models.
            toUse = (models || []).filter(m => /tts|audio/i.test(m));
        } else {
            toUse = models || [];
        }
        // Clear and populate with grouped options
        select.innerHTML = '';
        
        const grouped = groupModelsByProvider(toUse);
        
        for (const group of grouped) {
            const optgroup = document.createElement('optgroup');
            optgroup.label = `${group.provider} Models`;
            
            for (const modelId of group.models) {
                const opt = document.createElement('option');
                opt.value = modelId;
                // Make the display name more readable
                let displayName = modelId;
                if (modelId.startsWith('gemini-')) {
                    displayName = modelId.replace('gemini-', 'Gemini ');
                } else if (modelId.startsWith('gpt-')) {
                    displayName = modelId.toUpperCase().replace('-', ' ');
                }
                opt.textContent = displayName;
                optgroup.appendChild(opt);
            }
            
            select.appendChild(optgroup);
        }
        
        // Set a good default - prefer Gemini Flash for speed
        const preferredDefaults = ['gpt-5.2-2025-12-11', 'gpt-5.2', 'gemini-2.5-flash', 'gemini-flash-latest', 'gpt-4o-mini'];
        const defaultModel = preferredDefaults.find(m => toUse.includes(m));
        if (defaultModel) {
            select.value = defaultModel;
        } else if (select.options.length) {
            select.selectedIndex = 0;
        }
    } catch {}
  }

  // --- Core AI Generation Functions ---
  async function generateText() {
    const detailedPrompt = constructDetailedPromptBasedOnUserInput();
    const spinner = document.getElementById('text-spinner');
    const generateBtn = document.getElementById('generate-text-btn') as HTMLButtonElement | null;
    let selected = editor.getSelected();

    // Choose a target component to write text into. If selection is not a text node,
    // create a new text block and select it so UX still proceeds.
    let target = selected && selected.is && selected.is('text') ? selected : null;
    if (!target) {
      try {
        const wrapper = editor.DomComponents.getWrapper();
        const created = wrapper.append({ type: 'text', content: '' });
        target = Array.isArray(created) ? created[0] : created; // normalize return value
        editor.select(target);
      } catch {
        editor.log('Could not create a text component', { level: 'error', ns: 'gjs-openai' });
        alert('Please select a text element and try again.');
        return;
      }
    }

    try {
      if (spinner) (spinner as HTMLElement).style.display = 'inline-block';
      if (generateBtn) generateBtn.disabled = true;

      const selectedModel = (document.getElementById('text-model-select') as HTMLSelectElement)?.value;
      // Call local backend proxy. It will forward to the configured provider.
      const response = await postWithFallback('/ai/generate', '/ai/generate', {
        prompt: `${detailedPrompt}\n\nModel: ${selectedModel}`,
        field: 'text',
        page_title: '',
        model: selectedModel,
      }, makeHeaders());

      const openaiText = response?.data?.content || '';
      if (!openaiText) throw new Error('Empty response from AI service');
      // For text component, set content directly
      try { target.set && target.set('content', openaiText); } catch { target.components && target.components(openaiText); }
      modal.close();
    } catch (error: any) {
      editor.log('Error getting text from OpenAI:', { level: 'error', ns: 'gjs-openai', error });
      alert(`Text generation failed: ${error?.message || error}`);
    } finally {
      if (spinner) (spinner as HTMLElement).style.display = 'none';
      if (generateBtn) generateBtn.disabled = false;
    }
  }

  async function generateHTML() {
    const detailedPrompt = constructHtmlPromptBasedOnUserInput();
    const spinner = document.getElementById('html-spinner');
    const generateBtn = document.getElementById('generate-html-btn');

    const pageId = (window as any).__PAGE_ID__;
    const selectedModel = (document.getElementById('html-model-select') as HTMLSelectElement)?.value;
    const component = editor.getSelected();

    const wrapper = editor?.DomComponents?.getWrapper?.();
    const isWrapperSelection = Boolean(component && wrapper && component === wrapper);

    const safeReplaceComponentWithHtml = (cmp: any, html: string): boolean => {
      try {
        if (!cmp) {
          editor.addComponents(html);
          return true;
        }

        // If the user selected the wrapper / whole page, DO NOT remove it.
        // Replace its children instead so editor-level traits/components remain intact.
        if (isWrapperSelection || !cmp.parent || !cmp.parent()) {
          cmp.components(html);
          return true;
        }

        const parent = cmp.parent();
        const index = cmp.index();
        parent.components().add(html, { at: index });
        cmp.remove();
        return true;
      } catch (e: any) {
        editor.log('Failed to replace selected component safely', { level: 'error', ns: 'gjs-openai', error: e });
        alert(`Could not apply enhancement safely: ${e?.message || e}`);
        return false;
      }
    };

    const getSelectedComponentHtml = (cmp: any): string => {
      try {
        if (!cmp) return '';
        if (typeof cmp.toHTML === 'function') return cmp.toHTML();
        const el = cmp?.view?.el as HTMLElement | undefined;
        if (el && typeof el.outerHTML === 'string') return el.outerHTML;
        // Fallback: some components expose attributes + content; better than nothing.
        const content = cmp?.get && cmp.get('content');
        return typeof content === 'string' ? content : '';
      } catch {
        return '';
      }
    };

    const shouldEnhanceSelection = (prompt: string): boolean => {
      const p = (prompt || '').toLowerCase();
      return (
        p.includes('enhance this') ||
        p.includes('enhance the selected') ||
        p.includes('enhance selected') ||
        p.includes('improve this') ||
        p.includes('polish this') ||
        p.includes('make this better') ||
        p.includes('refine this') ||
        p.includes('upgrade this') ||
        p.includes('redesign this')
      );
    };

    type ProtectedDynamicTokens = {
      protectedHtml: string;
      tokenMap: Array<{ placeholder: string; original: string }>;
      missingPlaceholders: (generatedHtml: string) => string[];
      restore: (generatedHtml: string) => string;
    };

    const protectDynamicTokens = (html: string): ProtectedDynamicTokens => {
      const seed = uid().replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
      const tokenMap: Array<{ placeholder: string; original: string }> = [];
      const existing = new Map<string, string>();
      const patterns: RegExp[] = [
        /\{\{[\s\S]*?\}\}/g, // Tera variable tags
        /\{%[\s\S]*?%\}/g,   // Tera statements
        /\{#[\s\S]*?#\}/g,   // Tera comments
        /__[^_\s][A-Z0-9_]*__/g, // placeholder tokens like __SERVICE_NAME__
      ];

      let protectedHtml = html;
      let idx = 0;

      const makePlaceholder = () => `[[SBC_DYN_${seed}_${idx++}]]`;

      for (const re of patterns) {
        protectedHtml = protectedHtml.replace(re, (match) => {
          const prev = existing.get(match);
          if (prev) return prev;
          const placeholder = makePlaceholder();
          existing.set(match, placeholder);
          tokenMap.push({ placeholder, original: match });
          return placeholder;
        });
      }

      const missingPlaceholders = (generatedHtml: string): string[] => {
        const g = generatedHtml || '';
        return tokenMap
          .map(t => t.placeholder)
          .filter(ph => !g.includes(ph));
      };

      const restore = (generatedHtml: string): string => {
        let restored = generatedHtml || '';
        for (const t of tokenMap) {
          // Replace all occurrences (split/join works without regex escaping issues)
          restored = restored.split(t.placeholder).join(t.original);
        }
        return restored;
      };

      return { protectedHtml, tokenMap, missingPlaceholders, restore };
    };

    const protectCriticalGjsAttributeValues = (html: string): ProtectedDynamicTokens => {
      const seed = uid().replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
      const tokenMap: Array<{ placeholder: string; original: string }> = [];
      let idx = 0;

      const makePlaceholder = () => `[[SBC_GJS_${seed}_${idx++}]]`;

      // Preserve attribute VALUES for GrapesJS/component plumbing.
      // We do NOT replace the attribute names, only their values.
      const protectAttrValue = (input: string, attrNameRegex: RegExp) => {
        return input.replace(attrNameRegex, (full, prefix, quote, value) => {
          const placeholder = makePlaceholder();
          tokenMap.push({ placeholder, original: value });
          return `${prefix}${quote}${placeholder}${quote}`;
        });
      };

      let protectedHtml = html;

      // data-gjs-* captures custom component types and stored component state.
      protectedHtml = protectAttrValue(
        protectedHtml,
        /((?:data-gjs-[a-z0-9_-]+)\s*=\s*)(["'])([^"']*)(\2)/gi,
      );

      // A few other common dynamic component attributes used in this repo.
      protectedHtml = protectAttrValue(
        protectedHtml,
        /((?:data-component|data-checkout-id|data-service-name|data-service-price|data-service-type)\s*=\s*)(["'])([^"']*)(\2)/gi,
      );

      const missingPlaceholders = (generatedHtml: string): string[] => {
        const g = generatedHtml || '';
        return tokenMap
          .map(t => t.placeholder)
          .filter(ph => !g.includes(ph));
      };

      const restore = (generatedHtml: string): string => {
        let restored = generatedHtml || '';
        // Replace placeholders back to original attribute values.
        for (const t of tokenMap) {
          restored = restored.split(t.placeholder).join(t.original);
        }
        return restored;
      };

      return { protectedHtml, tokenMap, missingPlaceholders, restore };
    };

    const combineProtected = (...parts: Array<ProtectedDynamicTokens | null>): ProtectedDynamicTokens => {
      const nonNull = parts.filter(Boolean) as ProtectedDynamicTokens[];
      const protectedHtml = nonNull.reduce((acc, p) => p.protectedHtml, nonNull[0]?.protectedHtml || '');
      const tokenMap = nonNull.flatMap(p => p.tokenMap);
      const missingPlaceholders = (generatedHtml: string): string[] => {
        return nonNull.flatMap(p => p.missingPlaceholders(generatedHtml));
      };
      const restore = (generatedHtml: string): string => {
        return nonNull.reduce((acc, p) => p.restore(acc), generatedHtml);
      };
      return { protectedHtml, tokenMap, missingPlaceholders, restore };
    };

    const wantsEnhance = shouldEnhanceSelection(detailedPrompt);
    const selectedHtmlRaw = wantsEnhance ? getSelectedComponentHtml(component) : '';
    const selectedHtml = selectedHtmlRaw ? selectedHtmlRaw.trim() : '';

    // Keep the prompt payload bounded; large selections can blow up model context.
    const MAX_SELECTED_HTML_CHARS = 10_000;
    const selectedHtmlClipped = selectedHtml.length > MAX_SELECTED_HTML_CHARS
      ? `${selectedHtml.slice(0, MAX_SELECTED_HTML_CHARS)}\n\n<!-- NOTE: selection HTML truncated -->`
      : selectedHtml;

    const protectedTokens = wantsEnhance && selectedHtmlClipped
      ? (() => {
          // Protect template tokens first, then protect critical GrapesJS attribute values.
          const dyn = protectDynamicTokens(selectedHtmlClipped);
          const gjs = protectCriticalGjsAttributeValues(dyn.protectedHtml);
          return combineProtected({ ...dyn, protectedHtml: gjs.protectedHtml }, gjs);
        })()
      : null;

    if (wantsEnhance && !selectedHtmlClipped) {
      alert('To “enhance this”, please select the element you want to enhance first.');
      return;
    }

    // System instructions reused across sync + streaming modes
    const system = [
      'You are a web development assistant for Spotless Bin Co.',
      'Generate a SINGLE HTML fragment based on the user\'s inputs. Do NOT provide multiple variations.',
      'Hard rules:',
      '- Output ONLY HTML (no markdown, no commentary, no JSON).',
      '- Use ONLY Tailwind CSS utility classes (mobile-first).',
      '- Default can be LIGHT mode, but MUST support dark mode using `dark:` variants.',
      '- No external CSS, no <style> tags, no <script> tags, no inline onclick handlers.',
      '- Output a fragment only (no <html>, <head>, <body>).',
      'Design rules (match our modern landing page aesthetic):',
      '- Neutral slate surfaces, emerald/teal accents for CTAs and highlights.',
      '- Rounded cards, subtle borders/rings, optional ambient gradient glows with blur.',
      '- Clean, premium typography and spacing; accessible contrast in light and dark.',
      wantsEnhance
        ? 'IMPORTANT: The user asked to enhance an existing selected element. You MUST return the improved replacement HTML for that element (single root element).'
        : '',
      wantsEnhance
        ? [
            'IMPORTANT (dynamic values):',
            '- The selected element may contain server-side template tokens / dynamic placeholders.',
            '- You MUST preserve ALL placeholders exactly as provided (do not remove or modify them).',
            '- Placeholders look like [[SBC_DYN_*]] and [[SBC_GJS_*]] and represent required dynamic values / component wiring.',
            '- DO NOT remove or rename ANY `data-gjs-*` attributes. They power components and traits in the editor.',
            '- Preserve existing `data-*` attributes and `id` values unless the user explicitly asks to remove them.',
            isWrapperSelection
              ? '- The user selected the whole page. You MUST preserve all existing `data-gjs-*` components and dynamic placeholders within the page.'
              : '',
          ].join('\n')
        : '',
    ].join('\n');

    const promptWithSelection = [
      detailedPrompt,
      wantsEnhance && selectedHtmlClipped
        ? [
            'Selected element to enhance (current HTML):',
            protectedTokens?.protectedHtml || selectedHtmlClipped,
            '',
            'Task: Enhance THIS element. Keep intent/meaning, improve layout/typography/spacing, and ensure dark mode support with `dark:` Tailwind classes.',
            'Return ONLY the replacement HTML for this element (single root element).',
          ].join('\n')
        : '',
    ].filter(Boolean).join('\n\n');

    const btnEl = generateBtn as HTMLButtonElement | null;
    const originalBtnText = btnEl?.textContent || 'Generate HTML';

    const setBusy = (busy: boolean) => {
      if (spinner) (spinner as HTMLElement).style.display = busy ? 'inline-flex' : 'none';
      if (btnEl) {
        btnEl.disabled = busy;
        btnEl.textContent = busy ? 'Generating…' : originalBtnText;
        btnEl.classList.toggle('is-loading', busy);
        btnEl.setAttribute('aria-busy', busy ? 'true' : 'false');
      }
    };

    const ensureOverlay = () => {
      // Reuse the same id as the streaming loader so we never double-render.
      if (document.getElementById('ai-streaming-loader')) return;
      editor.addComponents(`
        <div id="ai-streaming-loader" style="
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(0,0,0,0.82);
          color: white;
          padding: 18px 20px;
          border-radius: 12px;
          z-index: 9999;
          text-align: center;
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
          min-width: 320px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.35);
        ">
          <div style="font-size: 16px; font-weight: 700; margin-bottom: 6px;">Generating HTML…</div>
          <div style="font-size: 13px; opacity: 0.85;" id="ai-loading-text">Working…</div>
          <div style="margin-top: 12px;">
            <div style="width: 260px; height: 6px; background: rgba(255,255,255,0.15); border-radius: 999px; overflow: hidden;">
              <div id="ai-progress-bar" style="width: 12%; height: 100%; background: #10B981; transition: width 0.35s ease;"></div>
            </div>
          </div>
        </div>
      `);
    };

    const updateOverlay = (content: string) => {
      const loadingText = document.getElementById('ai-loading-text');
      const progressBar = document.getElementById('ai-progress-bar') as HTMLElement | null;
      if (loadingText) {
        const wordCount = content ? content.split(/\s+/).filter(Boolean).length : 0;
        loadingText.textContent = wordCount ? `Generated ${wordCount} words…` : 'Working…';
      }
      if (progressBar) {
        const progress = content ? Math.min(12 + (content.length / 800) * 18, 85) : 12;
        progressBar.style.width = `${progress}%`;
      }
    };

    const removeOverlay = () => {
      const loader = document.getElementById('ai-streaming-loader');
      if (loader) loader.remove();
    };

    const showSuccessToast = () => {
      const existing = document.getElementById('ai-success-message');
      if (existing) existing.remove();
      editor.addComponents(`
        <div id="ai-success-message" style="
          position: fixed;
          top: 20px;
          right: 20px;
          background: #10B981;
          color: white;
          padding: 12px 14px;
          border-radius: 10px;
          z-index: 9999;
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
          box-shadow: 0 10px 25px rgba(0,0,0,0.22);
        ">
          ✓ HTML generated
        </div>
      `);
      setTimeout(() => {
        const el = document.getElementById('ai-success-message');
        if (el) el.remove();
      }, 2200);
    };

    try {
      setBusy(true);

      // If we have a page id, prefer streaming endpoint for progressive UX.
      // BUT:
      // - Gemini models are not compatible with the chat-completions streaming route.
      // - Some models (e.g. GPT-5.2 Pro) are Responses API only.
      // In those cases, fall back to the synchronous /ai/generate endpoint.
      const isResponsesOnlyModel = typeof selectedModel === 'string' && /-pro(\b|[-_])/.test(selectedModel);
      const isGeminiModel = typeof selectedModel === 'string' && selectedModel.startsWith('gemini-');
      const canStream = Boolean(pageId) && !isResponsesOnlyModel && !isGeminiModel;

      if (canStream) {
        // Use the /api alias so this works when the editor is served from the UI dev server (port 3000)
        // and requests are proxied to the Rust backend.
        const streamUrl = `/api/pages/${pageId}/ai/generate/stream`;
        const body = { prompt: promptWithSelection, model: selectedModel, system };

        // Minimal SSE over fetch for PUT (browser EventSource only supports GET)
        const createSSE = async (url: string, opts: {
          method: string;
          body?: any;
          headers?: any;
          onEvent: (evt: { event: string; data: string }) => void;
          onError: (err: any) => void | Promise<void>;
          onDone: () => void | Promise<void>;
        }) => {
          try {
            const resp = await fetch(url, {
              method: opts.method,
              credentials: 'same-origin',
              headers: { ...(opts.headers || {}), 'Content-Type': 'application/json' },
              body: opts.body,
            });
            if (!resp.ok || !resp.body) throw new Error(`SSE request failed: ${resp.status}`);
            const reader = resp.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              buffer += decoder.decode(value, { stream: true });
              let idx;
              while ((idx = buffer.indexOf('\n\n')) >= 0) {
                const rawEvent = buffer.slice(0, idx).trim();
                buffer = buffer.slice(idx + 2);
                if (!rawEvent) continue;
                let event = 'message';
                let dataLines: string[] = [];
                for (const line of rawEvent.split('\n')) {
                  if (line.startsWith('event:')) event = line.slice(6).trim();
                  else if (line.startsWith('data:')) dataLines.push(line.slice(5).trim());
                }
                opts.onEvent({ event, data: dataLines.join('\n') });
              }
            }
            await opts.onDone();
          } catch (e) {
            await opts.onError(e);
          }
        };

        let htmlContent = '';
        let target = component;

        // If we are enhancing the selected element, don't progressively inject full HTML into the canvas;
        // instead, stream progress in the overlay and replace the element once generation is complete.
        const deferCanvasUpdatesUntilDone = Boolean(wantsEnhance && component);

        // Use the shared overlay for streaming as well.
        ensureOverlay();
        updateOverlay('');

        if (!target) target = editor.addComponents('<div class="ai-html-streaming">Generating…</div>')?.[0];
        
        const replaceContent = (html: string) => {
          updateOverlay(html);
          if (deferCanvasUpdatesUntilDone) return;
          if (target) target.components(html);
          else editor.addComponents(html);
        };

        const syncFallback = async () => {
          // Ensure we still show a visible loading micro-interaction in fallback mode.
          ensureOverlay();
          updateOverlay(htmlContent);
          try {
            const response = await postWithFallback(
              '/ai/generate',
              '/ai/generate',
              {
                prompt: `${system}\n\n${promptWithSelection}`,
                field: 'html',
                page_title: '',
                model: selectedModel,
              },
              makeHeaders(),
            );
            const content = response?.data?.content || '';
            if (!content) throw new Error('Empty response from AI service');

            const extracted = tryExtractHtmlFromJsonString(content);
            const rawFinalHtml = extracted || content;

            // Restore protected dynamic tokens (and verify we didn't lose any).
            const missing = protectedTokens ? protectedTokens.missingPlaceholders(rawFinalHtml) : [];
            if (protectedTokens && missing.length) {
              alert(
                `Enhancement aborted: the AI output removed ${missing.length} required dynamic placeholder(s). Please try again.`,
              );
              return;
            }

            const finalHtml = protectedTokens ? protectedTokens.restore(rawFinalHtml) : rawFinalHtml;
            updateOverlay(finalHtml);

            if (wantsEnhance) {
              const ok = safeReplaceComponentWithHtml(component, finalHtml);
              if (!ok) return;
            } else {
              replaceContent(finalHtml);
            }
            showSuccessToast();
            modal.close();
          } catch (e: any) {
            editor.log('HTML generation fallback failed', { level: 'error', ns: 'gjs-openai', error: e });
            alert(`HTML generation failed: ${e?.message || e}`);
          } finally {
            removeOverlay();
            setBusy(false);
          }
        };

        const runSSE = (url: string) => createSSE(url, {
          method: 'PUT',
          body: JSON.stringify(body),
          headers: makeHeaders(),
          onEvent: ({ event, data }) => {
            if (event === 'start') {
              const loadingText = document.getElementById('ai-loading-text');
              if (loadingText) loadingText.textContent = 'Streaming…';
              return;
            }

            if (event === 'keepalive') {
              return;
            }

            if (event === 'error') {
              removeOverlay();
              let msg = 'AI streaming error';
              try {
                const parsed = JSON.parse(data);
                msg = parsed?.message || msg;
              } catch {}
              editor.log('Streaming error event for HTML generation', { level: 'error', ns: 'gjs-openai', msg });
              alert(msg);
              setBusy(false);
              return;
            }

            if (event === 'delta') {
              try {
                const parsed = JSON.parse(data);
                if (typeof parsed?.delta === 'string' && parsed.delta.length) {
                  htmlContent += parsed.delta;
                  replaceContent(htmlContent);
                }
              } catch (e) {
                // If something goes off-format, append raw data and continue.
                htmlContent += data;
                replaceContent(htmlContent);
              }
              return;
            }

            if (event === 'done') {
              // Restore protected dynamic tokens (and verify we didn't lose any).
              const missing = protectedTokens ? protectedTokens.missingPlaceholders(htmlContent) : [];
              if (protectedTokens && missing.length) {
                removeOverlay();
                alert(
                  `Enhancement aborted: the AI output removed ${missing.length} required dynamic placeholder(s). Please try again.`,
                );
                return;
              }

              const finalHtml = protectedTokens ? protectedTokens.restore(htmlContent) : htmlContent;
              updateOverlay(finalHtml);
              removeOverlay();

              if (wantsEnhance) {
                const ok = safeReplaceComponentWithHtml(component, finalHtml);
                if (!ok) return;
              }
              showSuccessToast();
              modal.close();
            }
          },
          onError: async (err) => {
            editor.log('Streaming error for HTML generation', { level: 'error', ns: 'gjs-openai', err });
            // Fall back to non-streaming generation when SSE is unavailable
            await syncFallback();
          },
          onDone: () => { /* finalization already handled via done event */ }
        });
        await runSSE(streamUrl);
        return;
      } else {
        // Immediate feedback for non-streaming flows (Gemini/pro/etc.)
        ensureOverlay();
        updateOverlay('');

        // Fallback: synchronous generation via generic endpoint
        const response = await postWithFallback(
          '/ai/generate',
          '/ai/generate',
          {
            prompt: `${system}\n\n${promptWithSelection}`,
            field: 'html',
            page_title: '',
            model: selectedModel,
          },
          makeHeaders(),
        );
        const content = response?.data?.content || '';
        if (!content) throw new Error('Empty response from AI service');
        const rawHtml = tryExtractHtmlFromJsonString(content) || content;

        // Restore protected dynamic tokens (and verify we didn't lose any).
        const missing = protectedTokens ? protectedTokens.missingPlaceholders(rawHtml) : [];
        if (protectedTokens && missing.length) {
          removeOverlay();
          alert(
            `Enhancement aborted: the AI output removed ${missing.length} required dynamic placeholder(s). Please try again.`,
          );
          return;
        }

        const html = protectedTokens ? protectedTokens.restore(rawHtml) : rawHtml;
        updateOverlay(html);
        const ok = wantsEnhance ? safeReplaceComponentWithHtml(component, html) : safeReplaceComponentWithHtml(component, html);
        if (!ok) return;
        removeOverlay();
        showSuccessToast();
        modal.close();
      }
    } catch (error: any) {
      editor.log(`Failed to generate HTML: ${error?.message || error}`, { level: 'error', ns: 'gjs-openai' });
      alert(`Failed to generate HTML: ${error?.message || error}`);
    } finally {
      removeOverlay();
      setBusy(false);
    }
  }

  async function generateAiImageForComponent(editorInst: any, component: any, currentApiKey: string, currentUploadUrl: string) {
    if (!component || component.get('type') !== 'ai-image') {
      editor.log("Please select an 'ai-image' component.", { level: 'warning' });
      return;
    }

    const prompt = component.getAttributes()['ai-prompt'] || '';
    const size = component.getAttributes()['ai-size'] || '1024x1024';

    if (!prompt) {
      editor.log('Please enter an image prompt in the component settings.', { level: 'warning' });
      return;
    }

    editor.log('Generating AI image...', { level: 'info', ns: 'ai-image-generator' });
    component.addClass('ai-image-loading');

    try {
      const dallEResponse = await axios.post(`${proxyBase}/openai/v1/images/generations`, {
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: size,
        style: "natural",
        quality: "hd",
        response_format: 'url'
      }, { headers: makeHeaders() });

      const imageUrl = dallEResponse?.data?.data?.[0]?.url;
      if (!imageUrl) throw new Error('No image URL found in OpenAI response.');

      editor.log('Sending image to backend for processing variants...', { ns: 'ai-image-generator' });
      const uploadResp = await fetch(currentUploadUrl, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: imageUrl })
      });

      if (!uploadResp.ok) {
        const errorText = await uploadResp.text();
        throw new Error(`Backend processing failed (Status: ${uploadResp.status}): ${errorText}`);
      }

      const uploadData = await uploadResp.json();
      const originalUrl = uploadData.original_url;
      const variants = uploadData.variants;

      if (originalUrl && Array.isArray(variants) && variants.length > 0) {
        const srcset = variants.map((v: any) => `${v.url} ${v.width}w`).join(', ');
        component.addAttributes({ src: originalUrl, srcset: srcset, sizes: '(max-width: 480px) 100vw, (max-width: 1024px) 50vw, 800px' });
        editor.log('AI image generated with srcset successfully!', { level: 'info' });
      } else {
        const fallbackUrl = uploadData.public_url || uploadData.url || uploadData.data?.url;
        if (fallbackUrl) {
          component.addAttributes({ src: fallbackUrl });
          editor.log('AI image generated (no variants).', { level: 'info' });
        } else {
          throw new Error('Invalid response from backend: Missing "original_url" and "variants".');
        }
      }

    } catch (error: any) {
      const userMessage = `Failed to generate or upload AI image. Details: ${error?.message || error}`;
      editor.log(userMessage, { level: 'error', ns: 'ai-image-generator' });
    } finally {
      component.removeClass('ai-image-loading');
    }
  }

  async function generateAudio() {
    const textContent = constructAudioPromptBasedOnUserInput();
    const voice = (document.getElementById('audio-voice') as HTMLSelectElement)?.value;
    const format = (document.getElementById('audio-format') as HTMLSelectElement)?.value;
    const selectedModel = (document.getElementById('audio-model-select') as HTMLSelectElement)?.value;
    const spinner = document.getElementById('audio-spinner');
    const generateBtn = document.getElementById('generate-audio-btn');

    let component = editor.getSelected();
    if (!component || component.get('type') !== 'audio-response-component') {
      editor.log('No audio response component selected.', { level: 'error' });
      return;
    }

    try {
      if (spinner) (spinner as HTMLElement).style.display = 'inline-block';
      if (generateBtn) (generateBtn as HTMLButtonElement).disabled = true;

      const response = await axios.post(`${proxyBase}/openai/v1/audio/speech`, {
        model: selectedModel, input: textContent, voice: voice, response_format: format
      }, { headers: makeHeaders(), responseType: 'arraybuffer' as any });

      const audioBlob = new Blob([response.data], { type: `audio/${format}` });
      const audioUrl = URL.createObjectURL(audioBlob);

      const audioElement = component.view.el.querySelector('.generated-audio');
      const placeholder = component.view.el.querySelector('.audio-placeholder');

      if (audioElement) {
        (audioElement as HTMLAudioElement).src = audioUrl;
        (audioElement as HTMLElement).style.display = 'block';
        if (placeholder) (placeholder as HTMLElement).style.display = 'none';
      }

      modal.close();
    } catch (error) {
      editor.log('Error generating audio from OpenAI.', { level: 'error', ns: 'gjs-openai', error });
    } finally {
      if (spinner) (spinner as HTMLElement).style.display = 'none';
      if (generateBtn) (generateBtn as HTMLButtonElement).disabled = false;
    }
  }

  async function generateSalesLetter() {
    const detailedPrompt = constructSalesLetterPromptBasedOnUserInput();
    const spinner = document.getElementById('sales-letter-spinner');
    const generateBtn = document.getElementById('generate-sales-letter-btn') as HTMLButtonElement | null;
    let selected = editor.getSelected();

    // Similar to text generation: find or create a target component
    let target = selected && selected.is && selected.is('text') ? selected : null;
    if (!target) {
      try {
        const wrapper = editor.DomComponents.getWrapper();
        const created = wrapper.append({ type: 'text', content: '' });
        target = Array.isArray(created) ? created[0] : created;
        editor.select(target);
      } catch {
        editor.log('Could not create a text component', { level: 'error', ns: 'gjs-openai' });
        alert('Please select a text element and try again.');
        return;
      }
    }

    try {
      if (spinner) (spinner as HTMLElement).style.display = 'inline-block';
      if (generateBtn) generateBtn.disabled = true;

      const selectedModel = (document.getElementById('sales-letter-model-select') as HTMLSelectElement)?.value;
      
      const response = await postWithFallback('/ai/generate', '/ai/generate', {
        prompt: detailedPrompt,
        field: 'sales_letter',
        page_title: 'Sales Letter',
        model: selectedModel,
      }, makeHeaders());

      const salesLetterContent = response?.data?.content || '';
      if (!salesLetterContent) throw new Error('Empty response from AI service');
      
      // Set content on the target component
      try { 
        target.set && target.set('content', salesLetterContent); 
      } catch { 
        target.components && target.components(salesLetterContent); 
      }
      
      modal.close();
      editor.log('Sales letter generated successfully!', { level: 'info', ns: 'gjs-openai' });
    } catch (error: any) {
      editor.log('Error generating sales letter:', { level: 'error', ns: 'gjs-openai', error });
      alert(`Sales letter generation failed: ${error?.message || error}`);
    } finally {
      if (spinner) (spinner as HTMLElement).style.display = 'none';
      if (generateBtn) generateBtn.disabled = false;
    }
  }

  // --- Modal Content Definitions ---
  // Dark‑mode friendly minimal UIs that match handlers above
  const textModalContent = `
    <div class="gjs-openai-modal" style="padding:16px; color:#0b1220;">
      <style>
        .gjs-openai-modal label{display:block;margin:6px 0 4px;font-weight:600}
        .gjs-openai-modal input,.gjs-openai-modal textarea,.gjs-openai-modal select{width:100%;padding:8px;border:1px solid #d1d5db;border-radius:6px}
        .dark .gjs-openai-modal{color:#e5e7eb}
        .dark .gjs-openai-modal input,.dark .gjs-openai-modal textarea,.dark .gjs-openai-modal select{background:#111827;border-color:#374151;color:#e5e7eb}
        .gjs-openai-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:12px}
        .gjs-btn-primary{background:#2563EB;color:#fff;border:none;padding:8px 12px;border-radius:6px;cursor:pointer}
      </style>
      <h3 style="margin:0 0 8px;font-size:16px;">AI Text Generator</h3>
      <label for="text-instructions">Instructions</label>
      <textarea id="text-instructions" rows="6" placeholder="Describe the copy you want... e.g., a persuasive hero paragraph for bin cleaning."></textarea>
      <div style="display:flex; gap:8px; margin-top:8px;">
        <div style="flex:1">
          <label for="text-tone-style">Tone/Style</label>
          <input id="text-tone-style" placeholder="e.g., friendly, professional, playful" />
        </div>
        <div style="width:210px">
          <label for="text-model-select">Model</label>
          <select id="text-model-select">
            <option value="" disabled selected>Loading models…</option>
          </select>
        </div>
      </div>
      <div class="gjs-openai-actions">
        <span id="text-spinner" style="display:none">Generating…</span>
        <button id="generate-text-btn" class="gjs-btn-primary">Generate</button>
      </div>
    </div>
  `;

  const htmlModalContent = `
    <div class="gjs-openai-modal" style="padding:16px; color:#0b1220;">
      <style>
        .gjs-openai-modal label{display:block;margin:6px 0 4px;font-weight:600}
        .gjs-openai-modal input,.gjs-openai-modal textarea,.gjs-openai-modal select{width:100%;padding:8px;border:1px solid #d1d5db;border-radius:6px}
        .dark .gjs-openai-modal{color:#e5e7eb}
        .dark .gjs-openai-modal input,.dark .gjs-openai-modal textarea,.dark .gjs-openai-modal select{background:#111827;border-color:#374151;color:#e5e7eb}
        .gjs-openai-actions{display:flex;gap:8px;justify-content:space-between;margin-top:12px;align-items:center}
        .gjs-btn-primary{background:#10B981;color:#0b1220;border:none;padding:8px 12px;border-radius:6px;cursor:pointer;font-weight:600}
        .gjs-btn-secondary{background:#1F2937;color:#e5e7eb;border:none;padding:8px 12px;border-radius:6px;cursor:pointer}
        .gjs-inline-note{font-size:12px;opacity:.75}
        .gjs-btn-primary:disabled,.gjs-btn-secondary:disabled{opacity:.6;cursor:not-allowed}
        .gjs-btn-primary.is-loading{animation:gjs-btn-pulse 1.1s ease-in-out infinite;}
        @keyframes gjs-btn-pulse{0%,100%{filter:saturate(1);transform:translateY(0)}50%{filter:saturate(1.15);transform:translateY(-1px)}}
        .gjs-inline-spinner{display:inline-flex;align-items:center;gap:8px;font-size:12px;opacity:.85}
        .gjs-inline-spinner .gjs-spinner-dot{width:12px;height:12px;border-radius:999px;border:2px solid rgba(255,255,255,.35);border-top-color:#fff;animation:gjs-spin .75s linear infinite}
        @keyframes gjs-spin{to{transform:rotate(360deg)}}
      </style>
      <h3 style="margin:0 0 8px;font-size:16px;">AI HTML Generator</h3>
      <div style="display:flex; gap:8px; margin-bottom:8px;">
        <div style="flex:1"></div>
        <div style="width:210px">
          <label for="html-model-select">Model</label>
          <select id="html-model-select">
            <option value="" disabled selected>Loading models…</option>
          </select>
        </div>
      </div>
      <div id="html-prompt-creation-modal" data-input-mode="plain">
        <div id="plain-language-section">
          <label for="html-plain-description">Describe the section</label>
          <textarea id="html-plain-description" rows="6" placeholder="e.g., A hero with bold headline, subtext about eco‑friendly bin cleaning, and a prominent CTA button."></textarea>
          <div class="gjs-inline-note">Tip: The generated block uses Tailwind and supports dark mode.</div>
        </div>
        <div id="structured-fields-section" style="display:none; margin-top:8px;">
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
            <div>
              <label for="html-page-goal">Goal</label>
              <input id="html-page-goal" placeholder="e.g., Capture leads" />
            </div>
            <div>
              <label for="html-target-audience">Target Audience</label>
              <input id="html-target-audience" placeholder="e.g., Homeowners in Collin County" />
            </div>
          </div>
          <label for="html-key-message">Key Message</label>
          <textarea id="html-key-message" rows="2" placeholder="Your bins sanitized in minutes" ></textarea>
          <label for="html-desired-elements">Desired Elements</label>
          <textarea id="html-desired-elements" rows="2" placeholder="Headline, supporting copy, CTA" ></textarea>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
            <div>
              <label for="html-cta">Primary CTA Text</label>
              <input id="html-cta" placeholder="Book Now" />
            </div>
          </div>
        </div>
      </div>
      <div class="gjs-openai-actions">
        <button id="toggle-input-mode" class="gjs-btn-secondary">Switch to Structured Input</button>
        <div style="display:flex; gap:8px; align-items:center;">
          <span id="html-spinner" class="gjs-inline-spinner" style="display:none"><span class="gjs-spinner-dot"></span><span>Generating…</span></span>
          <button id="generate-html-btn" class="gjs-btn-primary">Generate HTML</button>
        </div>
      </div>
    </div>
  `;

  const audioModalContent = `
    <div class="gjs-openai-modal" style="padding:16px; color:#0b1220;">
      <style>
        .gjs-openai-modal label{display:block;margin:6px 0 4px;font-weight:600}
        .gjs-openai-modal input,.gjs-openai-modal textarea,.gjs-openai-modal select{width:100%;padding:8px;border:1px solid #d1d5db;border-radius:6px}
        .dark .gjs-openai-modal{color:#e5e7eb}
        .dark .gjs-openai-modal input,.dark .gjs-openai-modal textarea,.dark .gjs-openai-modal select{background:#111827;border-color:#374151;color:#e5e7eb}
        .gjs-openai-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:12px}
        .gjs-btn-primary{background:#6366F1;color:#fff;border:none;padding:8px 12px;border-radius:6px;cursor:pointer}
      </style>
      <h3 style="margin:0 0 8px;font-size:16px;">AI Audio</h3>
      <label for="audio-instructions">Text</label>
      <textarea id="audio-instructions" rows="4" placeholder="What should the audio say?"></textarea>
      <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; margin-top:8px;">
        <div>
          <label for="audio-voice">Voice</label>
          <select id="audio-voice">
            <option value="alloy">Alloy</option>
            <option value="verse">Verse</option>
            <option value="aria">Aria</option>
          </select>
        </div>
        <div>
          <label for="audio-format">Format</label>
          <select id="audio-format">
            <option value="mp3">mp3</option>
            <option value="wav">wav</option>
            <option value="ogg">ogg</option>
          </select>
        </div>
        <div>
          <label for="audio-model-select">Model</label>
          <select id="audio-model-select">
            <option value="" disabled selected>Loading models…</option>
          </select>
        </div>
      </div>
      <div class="gjs-openai-actions">
        <span id="audio-spinner" style="display:none">Generating…</span>
        <button id="generate-audio-btn" class="gjs-btn-primary">Generate Audio</button>
      </div>
    </div>
  `;

  const salesLetterModalContent = `
    <div class="gjs-openai-modal" style="padding:16px; color:#0b1220; max-height:80vh; overflow-y:auto;">
      <style>
        .gjs-openai-modal label{display:block;margin:6px 0 4px;font-weight:600;font-size:13px}
        .gjs-openai-modal input,.gjs-openai-modal textarea,.gjs-openai-modal select{width:100%;padding:8px;border:1px solid #d1d5db;border-radius:6px;font-size:13px}
        .dark .gjs-openai-modal{color:#e5e7eb}
        .dark .gjs-openai-modal input,.dark .gjs-openai-modal textarea,.dark .gjs-openai-modal select{background:#111827;border-color:#374151;color:#e5e7eb}
        .gjs-openai-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:12px}
        .gjs-btn-primary{background:#F59E0B;color:#fff;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;font-weight:600}
        .sales-letter-section{margin-bottom:16px;padding:12px;background:#f9fafb;border-radius:6px}
        .dark .sales-letter-section{background:#1f2937}
        .sales-letter-helper{font-size:11px;color:#6b7280;margin-top:2px}
      </style>
      <h3 style="margin:0 0 12px;font-size:18px;font-weight:700;">🎯 AI Sales Letter Generator</h3>
      
      <div class="sales-letter-section">
        <label for="sales-product-service">Product/Service *</label>
        <input id="sales-product-service" placeholder="e.g., Residential bin cleaning service" required />
        <div class="sales-letter-helper">What are you selling?</div>
      </div>

      <div class="sales-letter-section">
        <label for="sales-target-audience">Target Audience *</label>
        <input id="sales-target-audience" placeholder="e.g., Homeowners in Collin County" required />
        <div class="sales-letter-helper">Who is this letter for?</div>
      </div>

      <div class="sales-letter-section">
        <label for="sales-key-benefits">Key Benefits *</label>
        <textarea id="sales-key-benefits" rows="3" placeholder="e.g., Eliminates odors&#10;Prevents pest infestations&#10;Saves time and hassle" required></textarea>
        <div class="sales-letter-helper">List the main benefits (one per line)</div>
      </div>

      <div class="sales-letter-section">
        <label for="sales-pain-points">Pain Points to Address</label>
        <textarea id="sales-pain-points" rows="3" placeholder="e.g., Smelly bins attracting flies&#10;Embarrassment in front of neighbors&#10;Health concerns"></textarea>
        <div class="sales-letter-helper">What problems does your product solve?</div>
      </div>

      <div class="sales-letter-section">
        <label for="sales-cta">Call to Action *</label>
        <input id="sales-cta" placeholder="e.g., Book your first cleaning today" required />
        <div class="sales-letter-helper">What action do you want them to take?</div>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; margin-top:12px;">
        <div>
          <label for="sales-letter-type">Letter Type</label>
          <select id="sales-letter-type">
            <option value="direct">Direct Response</option>
            <option value="nurture">Nurture/Educational</option>
            <option value="follow-up">Follow-Up</option>
            <option value="urgency">Urgency/Scarcity</option>
          </select>
        </div>
        <div>
          <label for="sales-tone">Tone</label>
          <select id="sales-tone">
            <option value="professional">Professional</option>
            <option value="friendly">Friendly</option>
            <option value="conversational">Conversational</option>
            <option value="authoritative">Authoritative</option>
            <option value="empathetic">Empathetic</option>
          </select>
        </div>
        <div>
          <label for="sales-letter-model-select">Model</label>
          <select id="sales-letter-model-select">
            <option value="" disabled selected>Loading models…</option>
          </select>
        </div>
      </div>

      <div class="gjs-openai-actions">
        <span id="sales-letter-spinner" style="display:none">Generating sales letter…</span>
        <button id="generate-sales-letter-btn" class="gjs-btn-primary">✨ Generate Sales Letter</button>
      </div>
    </div>
  `;

  function attachModalListeners(modalEl: any, handlers: any) {
    for (const selector in handlers) {
      const el = modalEl.querySelector(selector);
      if (el) {
        const newEl = el.cloneNode(true);
        el.parentNode.replaceChild(newEl, el);
        newEl.addEventListener('click', handlers[selector]);
      }
    }
  }

  function openTextModal() { modal.setContent(textModalContent).open(); const modalContentEl = modal.getContentEl(); hydrateModelSelect(modalContentEl.querySelector('#text-model-select') as HTMLSelectElement); attachModalListeners(modalContentEl, { '#generate-text-btn': generateText }); }
  function openHtmlModal() { modal.setContent(htmlModalContent).open(); const modalContentEl = modal.getContentEl(); hydrateModelSelect(modalContentEl.querySelector('#html-model-select') as HTMLSelectElement); attachModalListeners(modalContentEl, { '#generate-html-btn': generateHTML, '#toggle-input-mode': () => {
    const container = modalContentEl.querySelector('#html-prompt-creation-modal');
    const plainSection = modalContentEl.querySelector('#plain-language-section');
    const structuredSection = modalContentEl.querySelector('#structured-fields-section');
    const toggleBtn = modalContentEl.querySelector('#toggle-input-mode');
    const isPlain = container.getAttribute('data-input-mode') === 'plain';
    plainSection.style.display = isPlain ? 'none' : 'block';
    structuredSection.style.display = isPlain ? 'block' : 'none';
    toggleBtn.textContent = isPlain ? 'Switch to Plain Language' : 'Switch to Structured Input';
    container.setAttribute('data-input-mode', isPlain ? 'structured' : 'plain'); } }); }
  function openAudioModal() { modal.setContent(audioModalContent).open(); const modalContentEl = modal.getContentEl(); hydrateModelSelect(modalContentEl.querySelector('#audio-model-select') as HTMLSelectElement); attachModalListeners(modalContentEl, { '#generate-audio-btn': generateAudio }); }
  function openSalesLetterModal() { modal.setContent(salesLetterModalContent).open(); const modalContentEl = modal.getContentEl(); hydrateModelSelect(modalContentEl.querySelector('#sales-letter-model-select') as HTMLSelectElement); attachModalListeners(modalContentEl, { '#generate-sales-letter-btn': generateSalesLetter }); }

  // --- GrapesJS Component & Block Definitions ---
  editor.Components.addType('ai-image', {
    extend: 'image',
    model: {
      defaults: {
        attributes: { 'ai-prompt': '', 'ai-size': '1024x1024' },
        traits: [{ name: 'ai-prompt', label: 'AI Prompt', type: 'text', changeProp: true }, { name: 'ai-size', label: 'AI Image Size', type: 'select', options: [{ value: '1024x1024', name: 'Square (1024x1024)' }, { value: '1024x1792', name: 'Portrait (1024x1792)' }, { value: '1792x1024', name: 'Landscape (1792x1024)' }], changeProp: true }, { type: 'button', name: 'generate-ai-image-button', label: 'Generate Image', command: 'trigger-ai-image-generation', full: true }, ...(editor.Components.getType('image')?.model.prototype.defaults.traits || []).filter((t: any) => t.name !== 'src') ]
      }
    }
  });

  editor.Blocks.add('ai-image-block', { label: 'AI Image', category: 'AI Tools', content: { type: 'ai-image' }, media: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z" /></svg>` });

  // --- GrapesJS Command Definitions ---
  editor.Commands.add('get-openai-text', { run: (ed: any, sender: any) => { sender && sender.set('active', false); openTextModal(); } });
  editor.Commands.add('get-openai-html', { run: (ed: any, sender: any) => { sender && sender.set('active', false); openHtmlModal(); } });
  editor.Commands.add('get-openai-audio', { run: (ed: any, sender: any) => { sender && sender.set('active', false); openAudioModal(); } });
  editor.Commands.add('get-openai-sales-letter', { run: (ed: any, sender: any) => { sender && sender.set('active', false); openSalesLetterModal(); } });
  editor.Commands.add('trigger-ai-image-generation', { run: (ed: any, sender: any, options: any = {}) => { const component = options.component || editor.getSelected(); generateAiImageForComponent(editor, component, apiKey, uploadUrl); } });

  // --- GrapesJS Panel Button Definitions ---
  // --- Add AI Panel Buttons with Rich Usage Tooltips ---
  const textUsage = `AI Text Generator\n\nHow to use:\n1. Select a text block (or add one).\n2. Click this button.\n3. Describe the copy you want (tone, goal, etc.).\n4. Click Generate. The selected text will be replaced.`;
  const htmlUsage = `AI HTML Generator\n\nHow to use:\n1. (Optional) Select an existing component to replace; leave nothing selected to insert at the end.\n2. Click this button.\n3. Use Plain or Structured mode to describe the section (hero, pricing, CTA, etc.).\n4. Click Generate. Streaming HTML (if enabled) or a single block will appear and replace/insert.\n5. Edit further as needed in the canvas.`;
  const salesLetterUsage = `AI Sales Letter Generator\n\nHow to use:\n1. Select a text block (or add one).\n2. Click this button.\n3. Fill in the product/service, target audience, benefits, and pain points.\n4. Choose letter type and tone.\n5. Click Generate. A complete sales letter will be created using proven copywriting techniques.`;

  editor.Panels.addButton('options', {
    id: 'openai-text-button',
    className: 'fa fa-robot',
    command: 'get-openai-text',
    attributes: { title: textUsage }
  });
  editor.Panels.addButton('options', {
    id: 'openai-html-button',
    className: 'fa fa-code',
    command: 'get-openai-html',
    attributes: { title: htmlUsage }
  });
  editor.Panels.addButton('options', {
    id: 'openai-sales-letter-button',
    className: 'fa fa-envelope',
    command: 'get-openai-sales-letter',
    attributes: { title: salesLetterUsage }
  });

  // Custom enhanced tooltip (for better multi-line formatting) – attaches once on editor load
  function attachEnhancedTooltip(buttonDataId: string) {
    const btn = document.querySelector(`.gjs-pn-btn[data-id="${buttonDataId}"]`) as HTMLElement | null;
    if (!btn) return;
    // Avoid duplicating
    if (btn.dataset.aiTooltipBound === '1') return;
    btn.dataset.aiTooltipBound = '1';
    const raw = btn.getAttribute('title') || '';
    // Remove native tooltip to prevent overlap
    btn.removeAttribute('title');
    const tip = document.createElement('div');
    tip.className = 'ai-help-tooltip';
    tip.style.position = 'absolute';
    tip.style.maxWidth = '280px';
    tip.style.fontSize = '12px';
    tip.style.lineHeight = '1.35';
    tip.style.background = 'rgba(17,24,39,0.95)';
    tip.style.color = '#fff';
    tip.style.padding = '8px 10px';
    tip.style.borderRadius = '6px';
    tip.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
    tip.style.pointerEvents = 'none';
    tip.style.zIndex = '9999';
    tip.style.whiteSpace = 'pre-wrap';
    tip.style.display = 'none';
    tip.textContent = raw;
    document.body.appendChild(tip);
    const show = () => {
      tip.style.display = 'block';
      const rect = btn.getBoundingClientRect();
      const top = rect.top + window.scrollY - tip.offsetHeight - 8;
      const left = Math.min(window.scrollX + rect.left, window.scrollX + window.innerWidth - tip.offsetWidth - 12);
      tip.style.top = `${top < 0 ? rect.bottom + window.scrollY + 8 : top}px`;
      tip.style.left = `${left}px`;
    };
    const hide = () => { tip.style.display = 'none'; };
    btn.addEventListener('mouseenter', show);
    btn.addEventListener('mouseleave', hide);
    btn.addEventListener('focus', show);
    btn.addEventListener('blur', hide);
  }

  editor.on('load', () => {
    // Slight delay to allow GrapesJS to render buttons
    setTimeout(() => {
      attachEnhancedTooltip('openai-text-button');
      attachEnhancedTooltip('openai-html-button');
      attachEnhancedTooltip('openai-sales-letter-button');
    }, 50);
    // Onboarding toast (first session)
    if (!sessionStorage.getItem('ai_editor_onboarded')) {
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 z-50 bg-gray-900 text-white px-4 py-3 rounded shadow-lg text-sm max-w-sm';
      toast.innerHTML = `<strong class="block mb-1">AI Tools Ready</strong>Use the <span class='font-semibold'>robot</span> icon for copy, the <span class='font-semibold'>code</span> icon for HTML, and the <span class='font-semibold'>envelope</span> icon for sales letters. Hover the buttons for full instructions.`;
      document.body.appendChild(toast);
      setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 600ms'; setTimeout(() => toast.remove(), 700); }, 6000);
      sessionStorage.setItem('ai_editor_onboarded', '1');
    }
  });

  // --- Load External Components & Blocks ---
  try { initFunnelComponents(editor, opts); } catch (e) { console.warn('Failed to load components', e); }
  try { registerBlocks(editor, opts); } catch (e) { console.warn('Failed to load blocks', e); }
};
