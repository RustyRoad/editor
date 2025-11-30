// @ts-nocheck

export default (service, formattedPrice) => {
  // Use the bin icon or a placeholder
  let imageUrl = 'https://spotlessbinco.com/assets/bin-icon.png'; // Default bin icon
  if (service.images && service.images.length > 0 && typeof service.images[0] === 'string') {
    const firstImage = service.images[0];
    if (firstImage.startsWith('http')) {
      imageUrl = firstImage;
    }
  }

  return `
    <div class="mb-6 pb-4 border-b border-gray-200">
      <h2 class="text-xl font-bold text-gray-800 mb-3">Order Summary</h2>
      <div class="flex items-start space-x-4">
        <img src="${imageUrl}" alt="Service icon" class="h-16 w-16 flex-none rounded-md object-cover border border-gray-200" onerror="this.style.display='none'" />
        <div class="flex-auto space-y-1">
          <h3 class="text-gray-900 font-semibold">${service.title}</h3>
          <p class="text-sm text-gray-600">${service.description || 'Service details not available.'}</p>
        </div>
        <p class="flex-none text-lg font-medium text-gray-900">${formattedPrice}</p>
      </div>
      <dl class="mt-4 space-y-1 text-sm font-medium text-gray-600">
        <div class="flex items-center justify-between pt-2 text-gray-900">
          <dt class="text-base font-semibold">Total</dt>
          <dd class="text-base font-semibold">${formattedPrice}</dd>
        </div>
      </dl>
    </div>
  `;
};
