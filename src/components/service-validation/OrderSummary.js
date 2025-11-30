// @ts-nocheck
export default (function (service, formattedPrice) {
    // Use the bin icon or a placeholder
    var imageUrl = 'https://spotlessbinco.com/assets/bin-icon.png'; // Default bin icon
    if (service.images && service.images.length > 0 && typeof service.images[0] === 'string') {
        var firstImage = service.images[0];
        if (firstImage.startsWith('http')) {
            imageUrl = firstImage;
        }
    }
    return "\n    <div class=\"mb-6 pb-4 border-b border-gray-200\">\n      <h2 class=\"text-xl font-bold text-gray-800 mb-3\">Order Summary</h2>\n      <div class=\"flex items-start space-x-4\">\n        <img src=\"".concat(imageUrl, "\" alt=\"Service icon\" class=\"h-16 w-16 flex-none rounded-md object-cover border border-gray-200\" onerror=\"this.style.display='none'\" />\n        <div class=\"flex-auto space-y-1\">\n          <h3 class=\"text-gray-900 font-semibold\">").concat(service.title, "</h3>\n          <p class=\"text-sm text-gray-600\">").concat(service.description || 'Service details not available.', "</p>\n        </div>\n        <p class=\"flex-none text-lg font-medium text-gray-900\">").concat(formattedPrice, "</p>\n      </div>\n      <dl class=\"mt-4 space-y-1 text-sm font-medium text-gray-600\">\n        <div class=\"flex items-center justify-between pt-2 text-gray-900\">\n          <dt class=\"text-base font-semibold\">Total</dt>\n          <dd class=\"text-base font-semibold\">").concat(formattedPrice, "</dd>\n        </div>\n      </dl>\n    </div>\n  ");
});
