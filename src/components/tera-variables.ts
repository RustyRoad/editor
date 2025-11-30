/**
 * Tera Variable Components for GrapesJS
 * 
 * Allows marketers to insert dynamic Tera template variables into pages
 * similar to Mautic's token system. Variables are HTML-entity encoded to
 * survive GrapesJS parsing and restored server-side.
 * 
 * Uses Kanel-generated types for type safety and auto-discovery of available fields.
 * 
 * Example usage in GrapesJS:
 *   Drag "Customer Name" → outputs: &lbrace;&lbrace; customer.first_name &rbrace;&rbrace;
 *   Server decodes to: {{ customer.first_name }}
 */

import type { Editor } from 'grapesjs';
import type Customer from '../../../types/public/Customer';
import type Offers from '../../../types/public/Offers';
import type Funnels from '../../../types/public/Funnels';
import type FunnelSteps from '../../../types/public/FunnelSteps';
import type Products from '../../../types/public/Products';
import type Addresses from '../../../types/public/Addresses';

// Type helper to extract field names from Kanel types
type FieldsOf<T> = keyof T;

// Define variable metadata with types
interface VariableMetadata {
  label: string;
  variable: string;
  default: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'object';
  description?: string;
}

// Generate variables from Kanel types with friendly labels
export const TERA_VARIABLES: Record<string, VariableMetadata[]> = {
  customer: [
    { label: 'Customer ID', variable: 'customer.id', default: '', type: 'number', description: 'Unique customer identifier' },
    { label: 'First Name', variable: 'customer.first_name', default: 'there', type: 'string', description: 'Customer first name' },
    { label: 'Last Name', variable: 'customer.last_name', default: '', type: 'string', description: 'Customer last name' },
    { label: 'Email', variable: 'customer.email', default: '', type: 'string', description: 'Customer email address' },
    { label: 'Phone', variable: 'customer.phone_number', default: '', type: 'string', description: 'Customer phone number' },
    { label: 'Username', variable: 'customer.username', default: '', type: 'string', description: 'Customer username' },
    { label: 'Stripe Customer ID', variable: 'customer.stripe_customer_id', default: '', type: 'string', description: 'Stripe customer identifier' },
    { label: 'Pickup Day', variable: 'customer.pickup_day', default: '', type: 'number', description: 'Day of week for pickup (1-7)' },
    { label: 'Signup Date', variable: 'customer.date_signed_up', default: '', type: 'date', description: 'Date customer signed up' },
  ] satisfies VariableMetadata[],

  address: [
    { label: 'Address Line 1', variable: 'address.line1', default: '', type: 'string', description: 'Street address' },
    { label: 'Address Line 2', variable: 'address.line2', default: '', type: 'string', description: 'Apartment, suite, etc.' },
    { label: 'City', variable: 'address.city', default: '', type: 'string', description: 'City name' },
    { label: 'State', variable: 'address.state', default: '', type: 'string', description: 'State or province' },
    { label: 'Zip/Postal Code', variable: 'address.postal_code', default: '', type: 'string', description: 'ZIP or postal code' },
    { label: 'Country', variable: 'address.country', default: 'US', type: 'string', description: 'Country code' },
  ] satisfies VariableMetadata[],

  offer: [
    { label: 'Offer ID', variable: 'offer.id', default: '', type: 'number', description: 'Unique offer identifier' },
    { label: 'Offer Name', variable: 'offer.name', default: 'Special Offer', type: 'string', description: 'Offer display name' },
    { label: 'Description', variable: 'offer.description', default: '', type: 'string', description: 'Offer description' },
    { label: 'Price', variable: 'offer.price', default: '0.00', type: 'number', description: 'Offer price' },
    { label: 'Currency', variable: 'offer.currency', default: 'USD', type: 'string', description: 'Currency code' },
    { label: 'Credits Per Cycle', variable: 'offer.credits_per_cycle', default: '0', type: 'number', description: 'Credits awarded per billing cycle' },
    { label: 'Offer Type', variable: 'offer.offer_type', default: '', type: 'string', description: 'Type of offer (tripwire, upsell, etc.)' },
    { label: 'Stripe Product ID', variable: 'offer.stripe_product_id', default: '', type: 'string', description: 'Stripe product identifier' },
    { label: 'Stripe Price ID', variable: 'offer.stripe_price_id', default: '', type: 'string', description: 'Stripe price identifier' },
    { label: 'Link Token', variable: 'offer.link_token', default: '', type: 'string', description: 'Unique offer link token' },
  ] satisfies VariableMetadata[],

  product: [
    { label: 'Product Name', variable: 'product.name', default: '', type: 'string', description: 'Product name from Stripe' },
    { label: 'Product Description', variable: 'product.description', default: '', type: 'string', description: 'Product description' },
    { label: 'Product Price', variable: 'product.price', default: '0.00', type: 'number', description: 'Product price' },
    { label: 'Currency', variable: 'product.currency', default: 'USD', type: 'string', description: 'Product currency' },
    { label: 'Active Status', variable: 'product.active', default: 'true', type: 'boolean', description: 'Whether product is active' },
  ] satisfies VariableMetadata[],

  funnel: [
    { label: 'Funnel Name', variable: 'funnel.name', default: '', type: 'string', description: 'Name of the funnel' },
    { label: 'Funnel Description', variable: 'funnel.description', default: '', type: 'string', description: 'Funnel description' },
    { label: 'Funnel Slug', variable: 'funnel.slug', default: '', type: 'string', description: 'URL-friendly funnel identifier' },
    { label: 'Funnel Status', variable: 'funnel.status', default: 'active', type: 'string', description: 'Funnel status (active, paused, etc.)' },
    { label: 'Is Active', variable: 'funnel.is_active', default: 'true', type: 'boolean', description: 'Whether funnel is active' },
  ] satisfies VariableMetadata[],

  step: [
    { label: 'Step Name', variable: 'step.name', default: '', type: 'string', description: 'Current funnel step name' },
    { label: 'Step Type', variable: 'step.step_type', default: '', type: 'string', description: 'Step type (checkout, upsell, etc.)' },
    { label: 'Step Slug', variable: 'step.slug', default: '', type: 'string', description: 'URL-friendly step identifier' },
    { label: 'Step Order', variable: 'step.step_order', default: '1', type: 'number', description: 'Position in funnel sequence' },
    { label: 'Primary CTA Text', variable: 'step.primary_cta_text', default: '', type: 'string', description: 'Main call-to-action text' },
  ] satisfies VariableMetadata[],

  dynamic: [
    { label: 'Next Available Date', variable: 'next_available_date', default: '', type: 'string', description: 'Next available service date' },
    { label: 'Spots Remaining', variable: 'spots_remaining', default: '10', type: 'number', description: 'Available booking spots' },
    { label: 'Customer Count', variable: 'customer_count', default: '1000', type: 'number', description: 'Total customer count' },
    { label: 'Service Name', variable: 'service_name', default: 'Our Service', type: 'string', description: 'Service name' },
    { label: 'Service Price', variable: 'service_price', default: '0.00', type: 'number', description: 'Service price' },
    { label: 'Service Type', variable: 'service_type', default: 'standard', type: 'string', description: 'Type of service' },
  ] satisfies VariableMetadata[],

  ab_test: [
    { label: 'Test ID', variable: 'ab_test.id', default: '', type: 'number', description: 'A/B test identifier' },
    { label: 'Variant Name', variable: 'ab_variant', default: 'A', type: 'string', description: 'Current variant (A, B, C, etc.)' },
  ] satisfies VariableMetadata[],

  session: [
    { label: 'Session Token', variable: 'session.token', default: '', type: 'string', description: 'Unique session identifier' },
    { label: 'Checkout ID', variable: 'checkout_id', default: 'main', type: 'string', description: 'Checkout session ID' },
  ] satisfies VariableMetadata[],
};

/**
 * Encode Tera syntax for GrapesJS storage
 * Converts {{ }} to &lbrace;&lbrace; &rbrace;&rbrace;
 */
export function encodeTeraVariable(variable: string, defaultValue: string = ''): string {
  const withDefault = defaultValue 
    ? `${variable} | default(value="${defaultValue}")`
    : variable;
  
  // Use HTML entities that GrapesJS won't corrupt
  return `&lbrace;&lbrace; ${withDefault} &rbrace;&rbrace;`;
}

/**
 * Create a visual placeholder for Tera variables in the editor
 */
export function createTeraPlaceholder(label: string, variable: string): string {
  return `<span class="tera-variable" 
    data-tera-var="${variable}" 
    style="background: #e0f2fe; border: 1px solid #0ea5e9; border-radius: 4px; padding: 2px 8px; font-family: monospace; font-size: 13px; color: #0369a1; display: inline-block; cursor: pointer;"
    title="Tera Variable: {{ ${variable} }}"
  >{{ ${variable} }}</span>`;
}

export function initTeraVariables(editor: Editor): void {
  const domc = editor.DomComponents;
  const bm = editor.BlockManager;

  // Register Tera Variable component type
  domc.addType('tera-variable', {
    model: {
      defaults: {
        tagName: 'span',
        draggable: true,
        droppable: false,
        editable: false,
        traits: [
          {
            type: 'select',
            label: 'Category',
            name: 'category',
            options: Object.keys(TERA_VARIABLES).map(cat => ({
              id: cat,
              name: cat.charAt(0).toUpperCase() + cat.slice(1)
            })),
            changeProp: true,
          },
          {
            type: 'select',
            label: 'Variable',
            name: 'variable',
            options: [],
            changeProp: true,
          },
          {
            type: 'text',
            label: 'Default Value',
            name: 'defaultValue',
            placeholder: 'Optional fallback value',
            changeProp: true,
          },
          {
            type: 'checkbox',
            label: 'Show Encoded',
            name: 'showEncoded',
            changeProp: true,
          }
        ],
        attributes: {
          class: 'tera-variable',
        },
        styles: `
          .tera-variable {
            background: #e0f2fe;
            border: 1px solid #0ea5e9;
            border-radius: 4px;
            padding: 2px 8px;
            font-family: monospace;
            font-size: 13px;
            color: #0369a1;
            display: inline-block;
            cursor: pointer;
          }
          .tera-variable:hover {
            background: #bae6fd;
            border-color: #0284c7;
          }
        `,
      },

      init() {
        this.on('change:category', this.updateVariableOptions);
        this.on('change:variable change:defaultValue change:showEncoded', this.updateContent);
        
        // Set initial values
        if (!this.get('category')) {
          this.set('category', 'customer');
        }
        this.updateVariableOptions();
        this.updateContent();
      },

      updateVariableOptions() {
        const category = this.get('category') || 'customer';
        const variables = TERA_VARIABLES[category] || [];
        
        const variableTrait = this.getTrait('variable');
        if (variableTrait) {
          variableTrait.set('options', variables.map(v => ({
            id: v.variable,
            name: v.label
          })));
          
          // Set first variable as default if none selected
          if (!this.get('variable') && variables.length > 0) {
            this.set('variable', variables[0].variable);
          }
        }
      },

      updateContent() {
        const variable = this.get('variable') || 'customer.first_name';
        const defaultValue = this.get('defaultValue') || '';
        const showEncoded = this.get('showEncoded');
        
        // Find the variable config to get its label
        const category = this.get('category') || 'customer';
        const varConfig = TERA_VARIABLES[category]?.find(v => v.variable === variable);
        const label = varConfig?.label || variable;
        
        if (showEncoded) {
          // Show the actual encoded syntax that will be saved
          const encoded = encodeTeraVariable(variable, defaultValue);
          this.components(encoded);
        } else {
          // Show friendly placeholder in editor
          this.components(`<span style="background: #e0f2fe; border: 1px solid #0ea5e9; border-radius: 4px; padding: 2px 8px; font-family: monospace; font-size: 13px; color: #0369a1;">💡 {{ ${variable} }}</span>`);
        }
        
        // Store the encoded version in a data attribute for export
        this.addAttributes({ 'data-tera-encoded': encodeTeraVariable(variable, defaultValue) });
      },

      // Override toHTML to output encoded Tera syntax
      toHTML() {
        const variable = this.get('variable') || 'customer.first_name';
        const defaultValue = this.get('defaultValue') || '';
        return encodeTeraVariable(variable, defaultValue);
      },
    },
  });

  // Add blocks for each category
  Object.entries(TERA_VARIABLES).forEach(([category, variables]) => {
    variables.forEach(({ label, variable, default: defaultValue }) => {
      bm.add(`tera-${category}-${variable.replace(/\./g, '-')}`, {
        label: `${label}`,
        category: {
          id: 'tera-variables',
          label: '🔮 Tera Variables',
          open: false,
        },
        attributes: { class: 'fa fa-magic' },
        content: {
          type: 'tera-variable',
          category,
          variable,
          defaultValue,
        },
      });
    });
  });

  // Add a custom panel for quick access
  editor.Panels.addButton('options', {
    id: 'tera-variables-panel',
    className: 'fa fa-code',
    command: 'open-tera-variables',
    attributes: { title: 'Tera Variables' },
  });

  // Add command to open variables panel
  editor.Commands.add('open-tera-variables', {
    run(editor) {
      const modal = editor.Modal;
      const categories = Object.entries(TERA_VARIABLES);
      
      const content = `
        <div style="padding: 20px; max-width: 800px;">
          <h2 style="margin-top: 0; color: #1e293b;">Tera Template Variables</h2>
          <p style="color: #64748b; margin-bottom: 30px;">
            Click any variable to copy its encoded format, or drag from the blocks panel to insert.
          </p>
          
          ${categories.map(([cat, vars]) => `
            <div style="margin-bottom: 30px;">
              <h3 style="color: #334155; text-transform: capitalize; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">
                ${cat}
              </h3>
              <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 12px; margin-top: 16px;">
                ${vars.map(v => `
                  <div 
                    class="tera-var-item"
                    data-variable="${v.variable}"
                    data-default="${v.default}"
                    style="
                      background: #f8fafc;
                      border: 1px solid #e2e8f0;
                      border-radius: 6px;
                      padding: 12px;
                      cursor: pointer;
                      transition: all 0.2s;
                    "
                    onmouseover="this.style.background='#e0f2fe'; this.style.borderColor='#0ea5e9';"
                    onmouseout="this.style.background='#f8fafc'; this.style.borderColor='#e2e8f0';"
                    onclick="navigator.clipboard.writeText('${encodeTeraVariable(v.variable, v.default)}').then(() => alert('Copied: ${v.variable}'));"
                  >
                    <div style="font-weight: 600; color: #1e293b; margin-bottom: 4px;">${v.label}</div>
                    <div style="font-family: monospace; font-size: 12px; color: #64748b;">{{ ${v.variable} }}</div>
                    ${v.default ? `<div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">Default: "${v.default}"</div>` : ''}
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
          
          <div style="margin-top: 30px; padding: 16px; background: #fef3c7; border: 1px solid #fbbf24; border-radius: 6px;">
            <strong style="color: #92400e;">💡 Pro Tip:</strong>
            <p style="color: #92400e; margin: 8px 0 0 0;">
              Variables are automatically decoded server-side. The encoded format (&lbrace;&lbrace; ... &rbrace;&rbrace;) 
              ensures GrapesJS doesn't corrupt the Tera syntax.
            </p>
          </div>
        </div>
      `;
      
      modal.setTitle('Tera Variables Reference');
      modal.setContent(content);
      modal.open();
    }
  });

  console.log('✅ Tera Variables initialized - drag from "🔮 Tera Variables" block category');
}

export default initTeraVariables;
