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
    const selectedPharmacyPhone = pharmacyData.find(pharmacy => pharmacy.phone_number);
    const selectedPharmacyHours = pharmacyData.find(pharmacy => pharmacy.working_hours);
    const selectedPharmacy247 = pharmacyData.find(pharmacy => pharmacy.open24_7);

     
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
        <p><a class="link-light" href="district.html?district=${encodeURIComponent(selectedPharmacy.district)}">${selectedPharmacy.district}</a>, ${selectedPharmacy.region} 
        </p>
    </div>
    `;
    header.insertAdjacentHTML('beforeend', headerHTML);

    // For indicating if delivery is available
    const detailSection = document.getElementById("detail-section");

    var delivery = selectedPharmacy.delivery_available === 'Yes'
        ? `
        <div class="col">
            <span class="text-success"><i class="fa fa-motorcycle" aria-hidden="true"></i> Delivery available</span>
        </div>`
        : "";

    var isOpenSpan = "";  

    if (selectedPharmacy.open24_7 === true) {
        isOpenSpan = `
        <div class="col">
            <span class="text-success"><i class="fa fa-clock-o" aria-hidden="true"></i> Open 24/7</span>
        </div>
        `;
    } else {
        const openStatus = isPharmacyOpen(selectedPharmacy);
        if (openStatus === true) {
            isOpenSpan = `
            <div class="col">
                <span class="text-success"><i class="fa fa-clock-o" aria-hidden="true"></i> Open now</span>
            </div>`;
        } else if (openStatus === false) {
            isOpenSpan = `
            <div class="col">
                <span class="text-danger"><i class="fa fa-clock-o" aria-hidden="true"></i> Closed</span>
            </div>`;
        }
        // if openStatus is null, it will show nothing
    }

    detailSection.insertAdjacentHTML('beforeend', delivery);
    detailSection.insertAdjacentHTML('beforeend', isOpenSpan);


    // The physical address and the map
    const detailSection2 = document.getElementById("details-map"); 


    const detailSection2html = `
    <div id="pharmacy-details" class="col-lg-6">
        <table class="table">
            <tbody>
                <tr>
                    <td class="text-center"><b><i class="fa fa-map-marker" aria-hidden="true"></i></b></td>
                    <td>${selectedPharmacy.address}</td>
                </tr>
            </tbody>
        </table>
        <br>
        <br>
        <h5>Working hours</h5>
    </div>
    <div class="col-lg-6">
        <h4>Location</h4>
        <div id="pharmacy-map" style="height: 300px; width: 100%"></div>
    </div>`;

    detailSection2.insertAdjacentHTML('beforeend', detailSection2html);

    if (selectedPharmacy.phone_number) {
        const detailsTable = document.querySelector(".table tbody");
        const phoneRow = 
        `<tr>
            <td class="text-center"><b><i class="fa fa-phone" aria-hidden="true"></i></b></td>
            <td>${selectedPharmacy.phone_number}</td>
        </tr>`;
        detailsTable.insertAdjacentHTML('beforeend', phoneRow);
    }

    function formatPharmacyHours(pharmacy) {
        
        if (selectedPharmacy.open24_7 === true) {
            return `<tr><td colspan="2"><strong>Open 24/7</strong></td></tr>`;
        }
        
        const hoursObj = selectedPharmacy.working_hours;

        if (!hoursObj || typeof hoursObj !== 'object') {
            return `<tr><td colspan="2">Hours not available</td></tr>`;
        }

        const daysOfWeek = [
            "Monday", "Tuesday", "Wednesday", "Thursday",
            "Friday", "Saturday", "Sunday"
        ];

        return daysOfWeek.map(day => {
            const time = hoursObj[day];

            if (Array.isArray(time) && time.length === 2) {
                const [open, close] = time;
                return `<tr><td><strong>${day}</strong></td><td>${to12HourFormat(open)} – ${to12HourFormat(close)}</td></tr>`;
            } else if (time === "Closed") {
                return `<tr><td><strong>${day}</strong></td><td>Closed</td></tr>`;
            } else {
                return `<tr><td><strong>${day}</strong></td><td>Not specified</td></tr>`;
            }
        }).join("");
    }
    
    const hoursSection = document.getElementById("pharmacy-details");

    const hoursTable = document.createElement("table");
    hoursTable.classList.add("table");
    hoursTable.innerHTML = formatPharmacyHours(selectedPharmacy.working_hours);

    hoursSection.appendChild(hoursTable);

    
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