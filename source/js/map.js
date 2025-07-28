var map = L.map('map').setView([0.311, 32.5666], 13);

var tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: `&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>`
    }).addTo(map);

// creates location button
const customControl = L.Control.extend({
    options: {
        position: "topleft",
        className: "locate-button leaflet-bar",
        html: `<i class="fa fa-map-pin" aria-hidden="true"></i>
        <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>`,
        style:
        "margin-top: 0; left: 0; display: flex; cursor: pointer; justify-content: center; font-size: 24px;",
    },

    onAdd: function (map) {
        this._map = map;
        const button = L.DomUtil.create("div", this.options.className);

        L.DomEvent.disableClickPropagation(button);

        button.title = "Show My Location";
        button.innerHTML = this.options.html;
        button.className = this.options.className;
        button.setAttribute("style", this.options.style);

        L.DomEvent.on(button, "click", this._clicked, this);

        return button;
    },
    _clicked: function (e) {
        L.DomEvent.stopPropagation(e);

        // this.removeLocate();

        this._checkLocate();

        return;
    },
    _checkLocate: function () {
        return this._locateMap();
    },

    _locateMap: function () {
        const locateActive = document.querySelector(".locate-button");
        const locate = locateActive.classList.contains("locate-active");
        // add/remove class from locate button
        locateActive.classList[locate ? "remove" : "add"]("locate-active");

        // removes class from button
        // and stops watching location
        if (locate) {
            this.removeLocate();
            this._map.stopLocate();
            return;
    }

    // location on found
    this._map.on("locationfound", this.onLocationFound, this);
    // location on error
    this._map.on("locationerror", this.onLocationError, this);

    // start locate
    this._map.locate({ setView: true, enableHighAccuracy: true });
    },
    onLocationFound: function (e) {
        // add circle
        this.addCircle(e).addTo(this.featureGroup()).addTo(map);

        // add marker
        this.addMarker(e).addTo(this.featureGroup()).addTo(map);

        // add legend
    },
    // on location error
    onLocationError: function (e) {
        this.addLegend("Location access denied.");
    },
    // feature group
    featureGroup: function () {
        return new L.FeatureGroup();
    },
    // add legend
    addLegend: function (text) {
        const checkIfDescriotnExist = document.querySelector(".description");

        if (checkIfDescriotnExist) {
            checkIfDescriotnExist.textContent = text;
            return;
        }

        const legend = L.control({ position: "bottomleft" });

        legend.onAdd = function () {
            let div = L.DomUtil.create("div", "description");
            L.DomEvent.disableClickPropagation(div);
            const textInfo = text;
            div.insertAdjacentHTML("beforeend", textInfo);
            return div;
        };
        legend.addTo(this._map);
    },
    addCircle: function ({ accuracy, latitude, longitude }) {
        return L.circle([latitude, longitude], accuracy / 2, {
            className: "circle-test",
            weight: 2,
            stroke: false,
            fillColor: "#136aec",
            fillOpacity: 0.15,
        });
    },
    addMarker: function ({ latitude, longitude }) {
        return L.marker([latitude, longitude], {
        icon: L.divIcon({
            className: "located-animation",
            iconSize: L.point(17, 17),
            popupAnchor: [0, -15],
        }),
        }).bindPopup("You are here!!!").openPopup();
    },
    removeLocate: function () {
    this._map.eachLayer(function (layer) {
            if (layer instanceof L.Marker) {
                const { icon } = layer.options;
                if (icon?.options.className === "located-animation") {
                    map.removeLayer(layer);
                }
            }
            if (layer instanceof L.Circle) {
                if (layer.options.className === "circle-test") {
                    map.removeLayer(layer);
                }
            }
        });
    },
});

// adding new button to map control
map.addControl(new customControl());

var markers = [];

for (var i = 0; i < pharmacyData.length; i++) {
    addMarker(pharmacyData[i]);
}


function addMarker(pharmacy) {
    var marker = L.marker([pharmacy.latitude, pharmacy.longitude]).addTo(map);

    var delivery = pharmacy.delivery_available === 'Yes'
        ? `<span class="badge bg-success"><i class="fa fa-motorcycle" aria-hidden="true"></i> Delivery</span>`
        : "";

    var pharmacyImage = pharmacy.image_url
        ? pharmacy.image_url
        : "source/no-image.jpg";

    var isOpenSpan = "";  

    if (pharmacy.open24_7 === true) {
        isOpenSpan = `<span class="text-success"><i class="fa fa-clock-o" aria-hidden="true"></i> Open 24/7</span>`;
    } else {
        const openStatus = isPharmacyOpen(pharmacy);
        if (openStatus === true) {
            isOpenSpan = `<span class="text-success"><i class="fa fa-clock-o" aria-hidden="true"></i> Open now</span>`;
        } else if (openStatus === false) {
            isOpenSpan = `<span class="textdanger"><i class="fa fa-clock-0" aria-hidden="true"></i> Closed</span>`;
        }
        // if openStatus is null, it will show nothing
    }

    var popupContent = `
        <img src="${pharmacyImage}" width="250" height="144">
        <a href="pharmacy_page.html?name=${encodeURIComponent(pharmacy.name)}"><h5>${pharmacy.name}</h5></a>
        <br>
        ${pharmacy.address}
        <br>
        <br>
        ${delivery}    ${isOpenSpan}
    `;
    
    marker.bindPopup(popupContent);
    marker.pharmacyData = pharmacy; 

    markers.push(marker);
}

const filterContainer = document.querySelector("#filter .accordion-body");

generateButton();

function generateButton() {
    
    const filterHTML =  `
    <div class="row g-3">
            <div class="col-auto">
                <label for="region" class="form-label"><b>Jump to region: </b></label>
                <select class="form-select" name="region" id="region" onchange="zoomToRegion()">
                    <option>All</option>
                    <option value="Central Region">Central Region</option>
                    <option value="Eastern Region">Eastern Region</option>
                    <option value="Northern Region">Northern Region</option>
                    <option value="Western Region">Western Region</option>
                </select>
            </div>
            <div class="col-auto" id="district-wrapper" style="display: none;">
                <label for="district" class="form-label"><b>District </b></label>
                <select class="form-select" name="district" id="district">
                    <option value="">Select a district...</option>
                </select>
            </div>
        </div>
    </div>
    <div class="row mt-2">
        <div class="col">
            <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" name="item" role="switch" id="deliveryCheckbox"  value="Yes">
                <label class="form-check-label" for="deliveryCheckbox"><i class="fa fa-motorcycle" aria-hidden="true"></i> Delivery available</label>
            </div>
        </div>
        <div class="col">
            <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" name="item" role="switch" id="hoursCheckbox"  value="Yes">
                <label class="form-check-label" for="deliveryCheckbox"><i class="fa fa-clock-o" aria-hidden="true"></i> Open now</label>
            </div>
        </div>
    </div>
    `;

    filterContainer.insertAdjacentHTML("beforeend", filterHTML);

    document.getElementById("region").addEventListener("change", handleRegionChange);
    document.getElementById("district-wrapper").addEventListener("change", handleDistrictChange);
    document.getElementById('deliveryCheckbox').addEventListener('change', filterMarkers);

}

function handleRegionChange(event) {
    
    const selectedRegion = event.target.value;
    const districtDropdown = document.getElementById("district");

    const districtsByRegion = {
        "Central Region": ["Kampala", "Wakiso", "Mukono", "Masaka"],
        "Eastern Region": ["Jinja", "Mbale", "Soroti", "Busia"],
        "Northern Region": ["Gulu","Lira","Arua"],
        "Western Region": ["Hoima", "Mbarara", "Kabarole"]
    }


    districtDropdown.innerHTML = '<option value="">Select a district...</option>';

    if (districtsByRegion[selectedRegion]) {
        document.getElementById("district-wrapper").style.display = 'block';

        
        districtsByRegion[selectedRegion].forEach(district => {
            const option = new Option(district, district);
            districtDropdown.add(option);
        });

        zoomToRegion(selectedRegion);
    } else {
        document.getElementById("district-wrapper").style.display = "none";
        zoomToRegion("All");
    }
}

function handleDistrictChange(event) {
    
    const selectedDistrict = event.target.value;

    if (!selectedDistrict) return; 
    const districtMarkers = markers.filter(marker =>
        marker.pharmacyData.district === selectedDistrict
    );

    if (districtMarkers.length === 0) return;

    const districtLatLngs = districtMarkers.map(marker => marker.getLatLng());
    const districtBounds = L.latLngBounds(districtLatLngs);
    map.fitBounds(districtBounds);
}

function zoomToRegion(region) {
    if (region === "All") {
        const allLatLngs = markers.map(marker => marker.getLatLng());
        const bounds = L.latLngBounds(allLatLngs);
        map.fitBounds(bounds);
        return;
    }

    const regionMarkers = markers.filter(marker =>
        marker.pharmacyData.region === region
    );

    if (regionMarkers.length === 0) return;

    const regionLatLngs = regionMarkers.map(marker => marker.getLatLng());
    const regionBounds = L.latLngBounds(regionLatLngs);
    map.fitBounds(regionBounds);
}

function filterMarkers() {
    const deliveryChecked = document.getElementById('deliveryCheckbox').checked;

    const hoursChecked = document.getElementById('hoursCheckbox').checked;

    markers.forEach(marker => {
        const pharmacy = marker.pharmacyData;

        const hasDelivery = pharmacy.delivery_available === 'Yes';
        const isOpen = isPharmacyOpen(pharmacy);

        const showByDelivery = !deliveryChecked || hasDelivery;
        const showByHours = !hoursChecked || isOpen;

        if (showByDelivery && showByHours) {
            marker.addTo(map);
        } else {
            map.removeLayer(marker);
        }
    });
}
