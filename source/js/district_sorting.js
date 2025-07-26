document.addEventListener("DOMContentLoaded", () => {

    const urlParams = new URLSearchParams(window.location.search);
    const selectedPharmacyDistrict = urlParams.get('district');



    const pharmacyDistrict = pharmacyData.find(
        pharmacy => pharmacy.district === selectedPharmacyDistrict
    );

    if (!pharmacyDistrict) {
        console.error("Pharmacy district not found!");
        return;
    }

    const districtPharmacies = pharmacyData.filter(
        pharmacy => pharmacy.district === selectedPharmacyDistrict
    );

    if (districtPharmacies.length === 0) {
        console.error("No pharmacies were found in this district.");
        return;
    }

    // Sets the HTML title 
    document.title = `Pharmacies in ${pharmacyDistrict.district} District - PharmLooker`;

    const selectedpharmacyName = pharmacyData.find(pharmacy => pharmacy.name);
    const selectedpharmacyImage = pharmacyData.find(pharmacy => pharmacy.image_url);
    const selectedpharmacyLatitude = pharmacyData.find(pharmacy => pharmacy.latitude);
    const selectedpharmacyLongitude = pharmacyData.find(pharmacy => pharmacy.longitude);
    const selectedpharmacyRegion = pharmacyData.find(pharmacy => pharmacy.region);
    const selectedPharmacyAddress = pharmacyData.find(pharmacy => pharmacy.address);
    const selectedPharmacyPhone = pharmacyData.find(pharmacy => pharmacy.phone_number);


    const heading = document.getElementById("heading");

    const headingHTML = `
    <div>
        <h1>Pharmacies in ${pharmacyDistrict.district} District</h1>
        <p>All the pharmacies in ${pharmacyDistrict.district}</p>
    </div>`;

    heading.insertAdjacentHTML("beforeend", headingHTML);

    const mapSection = document.getElementById("map-section");

    const districtLatLng = districtPharmacies.map(pharmacy => [pharmacy.latitude, pharmacy.longitude]);
    const districtBounds = L.latLngBounds(districtLatLng);
   
    var map = L.map("district-map").setView(districtBounds.getCenter(), 15);
    map.fitBounds(districtBounds);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: `&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>`
    }).addTo(map);

    
    var markers = [];

    // Adds all the markers within the district
    districtPharmacies.forEach(pharmacy => {
        var pharmacyImage = pharmacy.image_url || "source/no-image.jpg";

        var delivery = pharmacy.delivery_available === 'Yes'
            ? `<span class="badge bg-success"><i class="fa fa-motorcycle" aria-hidden="true"></i> Delivery</span>`
            : "";

        const marker = L.marker([pharmacy.latitude, pharmacy.longitude]);
        marker.pharmacy = pharmacy;

        marker.bindPopup(`
            <img src="${pharmacyImage}" width="250" height="144"><br>
            <a href="pharmacy_page.html?name=${encodeURIComponent(pharmacy.name)}"><h5>${pharmacy.name}</h5></a><br>
            ${pharmacy.address}<br>
            ${delivery}
        `);

        marker.addTo(map);
        markers.push(marker);
    });


    function filterMarkers() {
        const deliveryChecked = document.getElementById('deliveryCheckbox').checked;

        markers.forEach(marker => {
            const hasDelivery = marker.pharmacy.delivery_available === 'Yes';

            if (!deliveryChecked || hasDelivery) {
                marker.addTo(map);
            } else {
                map.removeLayer(marker);
            }
        });
    }

    document.getElementById('deliveryCheckbox').addEventListener('change', filterMarkers);

})


