export const UIHelpers = {
  createButton(text: string, styles: Partial<CSSStyleDeclaration> = {}): HTMLButtonElement {
    const button = document.createElement('button');
    button.innerText = text;
    Object.assign(button.style, {
      position: 'absolute',
      zIndex: '1000',
      fontSize: '1em',
      padding: '10px 20px',
      backgroundColor: '#007bff',
      color: '#fff',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
      ...styles
    });
    if ('id' in styles) button.id = styles['id'] as string;
    button.onmouseover = () => button.style.backgroundColor = '#0056b3';
    button.onmouseout = () => button.style.backgroundColor = styles.backgroundColor || '#007bff';
    return button;
  },

  createAddressDisplay(): HTMLDivElement {
    const container = document.createElement('div');
    Object.assign(container.style, {
      margin: '20px 0',
      padding: '15px',
      backgroundColor: '#f8f9fa',
      borderRadius: '5px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    });
    return container;
  }
};
