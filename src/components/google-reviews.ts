import { Editor } from "grapesjs";

// Add dataLayer to the Window interface for TypeScript
declare global {
  interface Window {
    dataLayer?: Record<string, any>[];
  }
}

interface Review {
  authorName: string;
  rating: number;
  title: string;
  text: string;
  date: string;
}

interface GoogleReviewsData {
  businessName: string;
  businessImage: string;
  businessUrl: string;
  averageRating: number;
  totalReviews: number;
  reviews: Review[];
}


export default (editor: Editor) => {
  const domc = editor.DomComponents;

  domc.addType('google-reviews', {
    model: {
      defaults: {
        name: 'Google Reviews',
        tagName: 'div',
        draggable: true,
        droppable: false,
        removable: true,
        attributes: {
          class: 'google-reviews-container',
        },
        components: `
          <div class="google-reviews-header">
            <h3>Customer Reviews</h3>
            <div class="google-reviews-summary">
              <span class="rating-value"></span>
              <span class="stars"></span>
              <span class="review-count"></span>
            </div>
          </div>
          <div class="google-reviews-list">
            <!-- Reviews will be dynamically loaded here -->
          </div>
        `,
        script: function () {
          const container = this;
          const reviewsList = container.querySelector('.google-reviews-list');
          const ratingValueSpan = container.querySelector('.rating-value');
          const starsSpan = container.querySelector('.stars');
          const reviewCountSpan = container.querySelector('.review-count');

          // Function to render stars based on rating
          const renderStars = (rating: number): string => {
            const fullStars = Math.floor(rating);
            const halfStar = rating % 1 >= 0.5;
            let starsHtml = '';
            for (let i = 0; i < fullStars; i++) {
              starsHtml += '<span class="star-icon full">★</span>';
            }
            if (halfStar) {
              starsHtml += '<span class="star-icon half">★</span>';
            }
            return starsHtml;
          };

          // Function to inject JSON-LD structured data
          const injectStructuredData = (data: GoogleReviewsData): void => {
            let script = document.querySelector('script[type="application/ld+json"][data-component="google-reviews"]') as HTMLScriptElement;
            if (!script) {
              script = document.createElement('script') as HTMLScriptElement;
              script.type = 'application/ld+json';
              script.setAttribute('data-component', 'google-reviews');
              document.head.appendChild(script);
            }
            script.textContent = JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness", // Or Product, Organization, etc., depending on context
              "name": data.businessName,
              "image": data.businessImage,
              "url": data.businessUrl,
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": data.averageRating,
                "reviewCount": data.totalReviews
              },
              "review": data.reviews.map(review => ({
                "@type": "Review",
                "author": {
                  "@type": "Person",
                  "name": review.authorName
                },
                "reviewRating": {
                  "@type": "Rating",
                  "ratingValue": review.rating
                },
                "headline": review.title,
                "reviewBody": review.text,
                "datePublished": review.date
              }))
            });
          };

          // Function to fetch and render reviews
          const fetchAndRenderReviews = async () => {
            try {
              // Placeholder for fetching Google Reviews data
              // In a real scenario, this would fetch from a backend API or a public Google Reviews API
              // For now, using dummy data to demonstrate functionality
              const response = await fetch('/api/google/reviews?max=6');
              const data = await response.json();

              if (data && data.reviews && data.reviews.length > 0) {
                // Update summary
                ratingValueSpan.textContent = data.averageRating.toFixed(1);
                starsSpan.innerHTML = renderStars(data.averageRating);
                reviewCountSpan.textContent = `(${data.totalReviews} reviews)`;

                // Render individual reviews
                reviewsList.innerHTML = ''; // Clear existing reviews
                data.reviews.forEach((review: Review) => {
                  const reviewEl = document.createElement('div');
                  reviewEl.className = 'google-review-item';
                  reviewEl.innerHTML = `
                    <div class="review-author">${review.authorName}</div>
                    <div class="review-rating">${renderStars(review.rating)}</div>
                    <div class="review-date">${new Date(review.date).toLocaleDateString()}</div>
                    <div class="review-text">${review.text}</div>
                  `;
                  reviewsList.appendChild(reviewEl);
                });

                // Inject structured data
                injectStructuredData(data);

                // Push event to dataLayer for GTM
                if (window.dataLayer) {
                  window.dataLayer.push({
                    event: 'googleReviewsDisplayed',
                    googleReviews: {
                      businessName: data.businessName,
                      averageRating: data.averageRating,
                      totalReviews: data.totalReviews,
                      reviewCount: data.reviews.length,
                    }
                  });
                  console.log('Google Reviews data pushed to dataLayer:', data);
                }
              } else {
                reviewsList.innerHTML = '<p>No reviews found.</p>';
                if (window.dataLayer) {
                  window.dataLayer.push({
                    event: 'googleReviewsLoadFailed',
                    error: 'No reviews data received'
                  });
                }
              }
            } catch (error) {
              console.error('Error fetching Google Reviews:', error);
              reviewsList.innerHTML = '<p>Failed to load reviews.</p>';
              if (window.dataLayer) {
                window.dataLayer.push({
                  event: 'googleReviewsLoadFailed',
                  error: error instanceof Error ? error.message : String(error)
                });
              }
            }
          };

          // Fetch reviews on component load
          fetchAndRenderReviews();
        },
        // Styles for the component (basic example)
        // These can be adjusted or moved to a separate CSS file
        style: `
          .google-reviews-container {
            font-family: Arial, sans-serif;
            padding: 20px;
            border: 1px solid #eee;
            border-radius: 8px;
            max-width: 600px;
            margin: 20px auto;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .google-reviews-header {
            text-align: center;
            margin-bottom: 20px;
          }
          .google-reviews-header h3 {
            color: #333;
            margin-bottom: 10px;
          }
          .google-reviews-summary {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
          }
          .google-reviews-summary .rating-value {
            font-size: 1.8em;
            font-weight: bold;
            color: #f90;
          }
          .google-reviews-summary .stars .star-icon {
            color: #f90;
            font-size: 1.5em;
          }
          .google-reviews-summary .stars .star-icon.half {
            /* You might use a half-star character or clip a full star */
            position: relative;
            display: inline-block;
            overflow: hidden;
            width: 0.75em; /* Adjust as needed */
          }
          .google-reviews-summary .review-count {
            color: #666;
            font-size: 0.9em;
          }
          .google-reviews-list {
            border-top: 1px solid #eee;
            padding-top: 20px;
          }
          .google-review-item {
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 15px;
            margin-bottom: 15px;
            background-color: #fff;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
          }
          .google-review-item .review-author {
            font-weight: bold;
            color: #555;
            margin-bottom: 5px;
          }
          .google-review-item .review-rating .star-icon {
            color: #f90;
            font-size: 1.2em;
          }
          .google-review-item .review-date {
            font-size: 0.8em;
            color: #999;
            margin-bottom: 10px;
          }
          .google-review-item .review-text {
            color: #333;
            line-height: 1.5;
          }
        `,
      },
    },
  });
};
