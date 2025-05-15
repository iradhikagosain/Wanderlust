const map = L.map('map').setView([28.6139, 77.2090], 4);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Automatically geocode the listing location passed from EJS
function geocodeLocation(location, title) {
  if (!location) {
    alert("No location provided");
    return;
  }

  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`)
    .then(res => res.json())
    .then(data => {
      if (data.length > 0) {
        const lat = data[0].lat;
        const lon = data[0].lon;

        map.setView([lat, lon], 13);
        L.marker([lat, lon]).addTo(map)
          .bindPopup(title || location)
          .openPopup();
      } else {
        alert("Location not found.");
      }
    })
    .catch(err => {
      console.error('Geocoding error:', err);
      alert("Error occurred while geocoding.");
    });
}

// Call the geocodeLocation with data from EJS
geocodeLocation(listingLocation, listingTitle);
