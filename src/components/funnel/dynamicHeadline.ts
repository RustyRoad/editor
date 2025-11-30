import type { Editor } from 'grapesjs';
import { COMPONENT_TYPES, Trait } from '../funnel-components';

export function addDynamicHeadlineComponent(editor: Editor): void {
  const domc = editor.DomComponents;

  // Dynamic Headline component renders a heading using ctx.title
  domc.addType(COMPONENT_TYPES.DYNAMIC_HEADLINE, {
    isComponent: el => el.getAttribute?.('data-gjs-type') === COMPONENT_TYPES.DYNAMIC_HEADLINE,
    model: {
      defaults: {
        tagName: 'h1',
        attributes: { 'data-gjs-type': COMPONENT_TYPES.DYNAMIC_HEADLINE, class: 'text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight' },
        content: '{{ ctx.title }}',
        traits: [
          {
            type: 'select', label: 'Tag', name: 'tag', options: [
              { id: 'h1', name: 'H1' }, { id: 'h2', name: 'H2' }, { id: 'h3', name: 'H3' }
            ], changeProp: true
          },
          { type: 'text', label: 'Fallback', name: 'fallback', changeProp: true },
        ] as Trait[],
        tag: 'h1',
        fallback: 'Welcome!',
      },
      init(this: any) {
        (this as any).listenTo(this, 'change:tag change:fallback', (this as any).updateTag.bind(this));
      },
      updateTag(this: any) {
        const tag = (this as any).get('tag') || 'h1';
        const fallback = (this as any).get('fallback') || 'Welcome!';
        (this as any).set('tagName', tag);
        (this as any).set('content', `{{ ctx.title | default(value="${fallback}", boolean=true) }}`);
      }
    }
  });
}