$(function () {
    var pharmacyNames = pharmacyData.map(pharmacy => pharmacy.name);

    $('#search-box').autocomplete({
        source: function (request, response) {
        var term = request.term.toLowerCase();
        var suggestions = pharmacyNames.filter(name =>
            name.toLowerCase().includes(term)
        );
        response(suggestions);
    },
        minLength: 2, // Minimum characters before autocomplete kicks in
        
        select: function (event, ui) {
            const selectedName = ui.item.value.toLowerCase();
            document.getElementById('search-box').value = ui.item.value;

            let found = false;

            markers.forEach(marker => {
                const name = marker.pharmacyData.name.toLowerCase(); // assuming marker.pharmacyData exists

                if (name === selectedName) {
                    found = true;
                    marker.setOpacity(0.5);
                    marker.openPopup();
                    map.setView(marker.getLatLng(), 17); // Zoom to marker
                } else {
                    marker.setOpacity(1);
                }
            });

                if (!found) {
                    console.warn('No matching marker found for:', selectedName);
                }
            }
        });   
})

// For the clear button in the search box
function clearButton () {
    const $input = $('#search-box');
    const $clearBtn = $('.form-clear');

    // Initially hides the clear button
    $clearBtn.hide();

    // Shows/hides the clear button based on input value
    $input.on('input', function () {
        if ($(this).val().length > 0) {
            $clearBtn.show();
        } else {
            $clearBtn.hide();
        }
    });

    // Clears the input and hide the clear button when clicked
    $clearBtn.on('click', function () {
        $input.val('').trigger('input'); // trigger input event to auto-hide
    });
}

$(document).ready(function () {
    clearButton();
})

function performSearch() {
    console.log('Performing search...');

    var searchTerm = document.getElementById('search-box').value.toLowerCase();

    // Reset all markers
    markers.forEach(marker => marker.setOpacity(1));

    const matchingBounds = [];

    try {
        markers.forEach(marker => {
            const content = marker.getPopup().getContent().toLowerCase();

            if (content.includes(searchTerm)) {
                marker.setOpacity(0.5);
                matchingBounds.push(marker.getLatLng());
            }
        });

        // Fit the map only once to all matching markers
        if (matchingBounds.length > 0) {
            map.fitBounds(matchingBounds);
        }

    } catch (error) {
        console.error('Error during search:', error);
    }
}

