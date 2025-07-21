document.addEventListener("DOMContentLoaded", () => {
    
    const urlParams = new URLSearchParams(window.location.search);
    const selectedPharmacyName = urlParams.get('name');
    
    const selectedpharmacyName = pharmacyData.find(pharmacy => pharmacy.name);
    const selectedpharmacyImage = pharmacyData.find(pharmacy => pharmacy.image_url);
    const selectedpharmacyLatitude = pharmacyData.find(pharmacy => pharmacy.latitude);
    const selectedpharmacyLongitude = pharmacyData.find(pharmacy => pharmacy.longitude);
    const selectedpharmacyDistrict = pharmacyData.find(pharmacy => pharmacy.district);
    const selectedpharmacyRegion = pharmacyData.find(pharmacy => pharmacy.region);
    const selectedPharmacyAddress = pharmacyData.find(pharmacy => pharmacy.address);
    const selectedPharmacyPhone = pharmacyData.find(pharmacy => pharmacy.phone_number)

     
    // Finds the pharmacy in the data
    const selectedPharmacy = pharmacyData.find(
        pharmacy => pharmacy.name === selectedPharmacyName
    );

    if (!selectedPharmacy) {
        console.warn("Pharmacy not found!");
        return;
    }
    
    // Sets the HTML title 
    document.title = `${selectedPharmacy.name} - PharmLooker`;

    const header = document.getElementById("pharmacy-header");
    // Sets background image or fallback if there is none
    if (selectedPharmacy.image_url) {
        header.style.backgroundImage = `url('${selectedPharmacy.image_url}')`;
        header.style.backgroundSize = "cover";
        header.style.backgroundPosition = "center";
        header.style.color = "white";
        header.style.padding = "3rem";
    } else {
        header.style.backgroundColor = "gray";
        header.style.color = "white";
        header.style.padding = "3rem";
    }

    // Insert pharmacy info into the header
    const headerHTML = `
    <div>
        <h1>${selectedPharmacy.name}</h1>
        <p>${selectedPharmacy.district}, ${selectedPharmacy.region}</p>
    </div>
    `;
    header.insertAdjacentHTML('beforeend', headerHTML);

    // For indicating if delivery is available
    const detailSection = document.getElementById("detail-section");

    var delivery = selectedPharmacy.delivery_available === 'Yes'
        ? `<span class="text-success"><i class="fa fa-motorcycle" aria-hidden="true"></i> Delivery available</span>`
        : "";

    detailSection.insertAdjacentHTML('beforeend', delivery);

    // The physical address and the map
    const detailSection2 = document.getElementById("details-map");

    const detailSection2html = `
    <div class="col-lg-6">
        <table class="table">
            <tbody>
                <tr>
                    <td class="text-center"><b><i class="fa fa-map-marker" aria-hidden="true"></i></b></td>
                    <td>${selectedPharmacy.address}</td>
                </tr>
                <tr>
                    <td class="text-center"><b><i class="fa fa-phone" aria-hidden="true"></i></b></td>
                    <td>${selectedPharmacy.phone_number}</td>
                </tr>
            </tbody>
        </table>
    </div>
    <div class="col-lg-6">
        <h4>Location</h4>
        <div id="pharmacy-map" style="height: 300px; width: 100%"></div>
    </div>`;

    detailSection2.insertAdjacentHTML('beforeend', detailSection2html);

    var map = L.map('pharmacy-map').setView([selectedPharmacy.latitude, selectedPharmacy.longitude], 15);

    var tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: `&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>`
    }).addTo(map);

    var marker = L.marker([selectedPharmacy.latitude, selectedPharmacy.longitude]).addTo(map);

    var popupContent = `
    <strong>${selectedPharmacy.name}</strong>`;

    marker.bindPopup(popupContent);
})