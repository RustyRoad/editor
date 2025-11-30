import { Editor } from 'grapesjs';

export default (editor: Editor) => {
  const domc = editor.DomComponents;

  // Define FAQ component
  domc.addType('faq-section', {
    model: {
      defaults: {
        name: 'FAQ Section',
        tagName: 'div',
        draggable: true,
        droppable: true,
        attributes: { class: 'faq-container' },
        components: `\n<div class="faq-item">\n  <h3 class="faq-question">Question?</h3>\n  <div class="faq-answer">Answer.</div>\n</div>\n`,
        script: function () {
          // In GrapesJS component scripts, `this` refers to the root DOM element of the component instance.
          const container = this as unknown as HTMLElement;
          const items = container.querySelectorAll('.faq-item');
          const faqs = Array.from(items).map(item => {
            const q = item.querySelector('.faq-question')?.textContent || '';
            const a = item.querySelector('.faq-answer')?.textContent || '';
            return {
              "@type": "Question",
              name: q,
              acceptedAnswer: {
                "@type": "Answer",
                text: a
              }
            };
          });
          let ld = document.querySelector('script[type="application/ld+json"][data-component="faq"]') as HTMLScriptElement | null;
          if (!ld) {
            ld = document.createElement('script');
            ld.type = 'application/ld+json';
            ld.setAttribute('data-component', 'faq');
            document.head.appendChild(ld);
          }
          ld.textContent = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs
          });
        },
        styles: `\n.faq-item{margin-bottom:1rem;}\n.faq-question{font-weight:bold;}\n.faq-answer{margin-top:0.5rem;}\n`,
      }
    }
  });

  // Add block so users can drag it
  editor.BlockManager.add('faq-section', {
    label: 'FAQ Section',
    category: 'Blog',
    content: { type: 'faq-section' },
  });
};
