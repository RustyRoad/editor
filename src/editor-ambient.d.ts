import type { Editor } from 'grapesjs';

declare module './locale/en.js' {
  const messages: Record<string, unknown>;
  export default messages;
}

declare module './blocks/index.js' {
  const registerBlocks: (editor: Editor, opts?: Record<string, unknown>, openBlock?: unknown) => void;
  export default registerBlocks;
}

declare module './commands.js' {
  const registerCommands: (editor: Editor, opts?: Record<string, unknown>) => void;
  export default registerCommands;
}

declare module './components/webinar-checkout-1' {
  const template: (product?: Record<string, unknown>) => string;
  export default template;
}

declare module './components/embedded-checkout' {
  const template: (product: Record<string, unknown>) => string;
  export default template;
}

declare module './components/utils' {
  export function formatPrice(amount: unknown, currency?: string): string;
}

declare module './components/pricing-table/utils' {
  export function formatCurrency(amount: unknown, currency?: string): string;
}

declare module './components/service-validation/AddressValidation' {
  const template: () => string;
  export default template;
}

declare module './components/service-validation/OrderSummary' {
  const template: (service: Record<string, unknown>, formattedPrice: string) => string;
  export default template;
}

declare module './components/service-validation/PaymentForm' {
  const template: (buttonText: string) => string;
  export default template;
}

declare module '*.js' {
  const value: any;
  export default value;
}
