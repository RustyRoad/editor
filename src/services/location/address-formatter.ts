export function formatAddressForDisplay(
  addressComponentData: any,
  coordinates: { latitude: number; longitude: number } | null
): string {
  const addr = addressComponentData || {};
  let formattedHtml = '<h3>Selected Location</h3>';
  let streetAddressLine = '';

  if (addr.Address) streetAddressLine = addr.Address;
  else if (addr.AddNum && addr.StreetName) streetAddressLine = `${addr.AddNum} ${addr.StreetName}`;
  else if (addr.house_number && (addr.road || addr.street)) streetAddressLine = `${addr.house_number} ${addr.road || addr.street}`;
  else if (addr.road || addr.street) streetAddressLine = addr.road || addr.street;
  else if (addr.Match_addr) streetAddressLine = addr.Match_addr.split(',')[0];

  if (streetAddressLine) formattedHtml += `<p>${streetAddressLine.trim()}</p>`;
  else formattedHtml += '<p>Street address not available.</p>';

  const cityLineParts = [addr.City || addr.city || addr.town || '', addr.Region || addr.state || '', addr.Postal || addr.postcode || ''];
  const cityLine = cityLineParts.filter(part => part).join(' ').trim();
  if (cityLine) formattedHtml += `<p>${cityLine}</p>`;

  if (!streetAddressLine && !cityLine && (!addr || Object.keys(addr).length === 0)) {
    formattedHtml = '<h3>Selected Location</h3><p>Address information could not be determined.</p>';
  }

  if (coordinates) formattedHtml += `<p><small>Lat: ${coordinates.latitude.toFixed(6)}, Lng: ${coordinates.longitude.toFixed(6)}</small></p>`;
  else formattedHtml += `<p><small>Coordinates not available.</small></p>`;
  
  return formattedHtml;
}
