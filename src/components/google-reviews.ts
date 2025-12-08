import { Editor } from "grapesjs";

/**
 * Google Reviews GrapesJS Component
 * 
 * Renders server-side via Tera templates using the {% google_reviews %} macro.
 * Reviews are fetched from the database at render time, not via client-side API.
 */
export default (editor: Editor) => {
  const domc = editor.DomComponents;
  const bm = editor.BlockManager;

  // Register the component type
  domc.addType('google-reviews', {
    model: {
      defaults: {
        name: 'Google Reviews',
        tagName: 'div',
        draggable: true,
        droppable: false,
        removable: true,
        attributes: {
          class: 'google-reviews-widget',
          'data-gjs-type': 'google-reviews',
        },
        // Traits allow customization in the editor
        traits: [
          {
            type: 'number',
            name: 'maxReviews',
            label: 'Max Reviews',
            default: 6,
            min: 1,
            max: 20,
          },
          {
            type: 'select',
            name: 'minRating',
            label: 'Min Rating',
            default: '4',
            options: [
              { id: '5', name: '5 Stars Only' },
              { id: '4', name: '4+ Stars' },
              { id: '3', name: '3+ Stars' },
              { id: '1', name: 'All Reviews' },
            ],
          },
          {
            type: 'select',
            name: 'layout',
            label: 'Layout',
            default: 'grid',
            options: [
              { id: 'grid', name: 'Grid' },
              { id: 'carousel', name: 'Carousel' },
              { id: 'list', name: 'List' },
            ],
          },
          {
            type: 'checkbox',
            name: 'showHeader',
            label: 'Show Header',
            default: true,
          },
          {
            type: 'checkbox',
            name: 'showRating',
            label: 'Show Star Rating',
            default: true,
          },
          {
            type: 'checkbox',
            name: 'showDate',
            label: 'Show Date',
            default: true,
          },
          {
            type: 'checkbox',
            name: 'showGoogleLink',
            label: 'Show Google Link',
            default: true,
          },
        ],
        // The component outputs Tera template syntax
        // This will be rendered server-side
        components: `
          <div class="google-reviews-widget" data-tera="google_reviews">
            <!-- Tera macro: {% call google_reviews(max=6, min_rating=4, layout="grid") %} -->
            <div class="gjs-placeholder" style="padding: 40px; text-align: center; background: linear-gradient(135deg, #4285f4 0%, #34a853 100%); border-radius: 12px; color: white;">
              <div style="font-size: 48px; margin-bottom: 16px;">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="white" style="display: inline-block;">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </div>
              <div style="font-size: 20px; font-weight: bold; margin-bottom: 8px;">Google Reviews</div>
              <div style="font-size: 14px; opacity: 0.9;">Reviews will be loaded from your Google Business Profile</div>
              <div style="margin-top: 16px; font-size: 12px; opacity: 0.7;">Configure display options in the traits panel →</div>
            </div>
          </div>
        `,
      },
      
      // Generate the Tera template when exporting
      toHTML() {
        const maxReviews = this.get('traits').where({ name: 'maxReviews' })[0]?.get('value') || 6;
        const minRating = this.get('traits').where({ name: 'minRating' })[0]?.get('value') || '4';
        const layout = this.get('traits').where({ name: 'layout' })[0]?.get('value') || 'grid';
        const showHeader = this.get('traits').where({ name: 'showHeader' })[0]?.get('value') !== false;
        const showGoogleLink = this.get('traits').where({ name: 'showGoogleLink' })[0]?.get('value') !== false;
        const theme = 'dark'; // Could be a trait too
        
        // Output Tera template with variable assignments and include
        // The reviews and summary variables are injected by the controller
        return `{% set theme = "${theme}" %}
{% set layout = "${layout}" %}
{% set max_reviews = ${maxReviews} %}
{% set show_header = ${showHeader} %}
{% set show_write_review = ${showGoogleLink} %}
{% include "components/google_reviews.html.tera" %}`;
      },
    },
  });

  // Add block to the block manager
  bm.add('google-reviews', {
    label: 'Google Reviews',
    category: 'Dynamic',
    attributes: { class: 'fa fa-star' },
    content: { type: 'google-reviews' },
  });
};
