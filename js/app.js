// Bangalore center coordinates (MG Road area)
let userLat = 12.9752;
let userLng = 77.6069;
let homeMap = null;
let currentSearchResults = [];
let prescriptionHistory = JSON.parse(localStorage.getItem('prescriptionHistory')) || [];

// Screen Navigation
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    if (screenId === 'homeScreen') {
        loadNearbyPharmacies();
        if (homeMap) {
            setTimeout(() => homeMap.invalidateSize(), 100);
        }
    }
    if (screenId === 'profileScreen') {
        loadPrescriptionHistory();
    }
}

// Splash screen auto transition
setTimeout(() => {
    document.getElementById('splashScreen').classList.remove('active');
    document.getElementById('homeScreen').classList.add('active');
    initHomeMap();
    loadNearbyPharmacies();
}, 2500);

// Initialize Home Map with Bangalore focus
function initHomeMap() {
    homeMap = L.map('homeMap').setView([userLat, userLng], 12);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap | Bangalore',
        subdomains: 'abcd'
    }).addTo(homeMap);
    
    // Add user marker
    L.marker([userLat, userLng], {
        icon: L.divIcon({
            html: '<div style="background: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
            iconSize: [20, 20]
        })
    }).addTo(homeMap).bindPopup("<b>📍 Your Location</b><br>Bangalore");
    
    // Add pharmacy markers with area labels
    pharmacies.forEach(ph => {
        const marker = L.marker([ph.lat, ph.lng])
            .bindPopup(`<b>🏪 ${ph.name}</b><br>📍 ${ph.area}<br>${ph.address}<br>⏰ ${ph.timing}`)
            .addTo(homeMap);
    });
}

// Load nearby pharmacies list for Bangalore
function loadNearbyPharmacies() {
    const container = document.getElementById('nearbyPharmaciesList');
    
    // Sort pharmacies by approximate distance (simulated)
    const pharmaciesWithDistance = pharmacies.map(ph => ({
        ...ph,
        distance: Math.random() * 5 + 0.5 // Random distance 0.5-5.5 km for demo
    })).sort((a, b) => a.distance - b.distance);
    
    container.innerHTML = pharmaciesWithDistance.map(ph => `
        <div class="result-card" onclick="viewPharmacyDetails(${ph.id})">
            <div style="display: flex; justify-content: space-between;">
                <strong><i class="fas fa-store"></i> ${ph.name}</strong>
                <span class="stock-badge">${ph.distance.toFixed(1)} km</span>
            </div>
            <div style="font-size: 0.8rem; color: #666;">📍 ${ph.area} • ${ph.address}</div>
            <div style="font-size: 0.7rem; margin-top: 5px;"><i class="fas fa-clock"></i> ${ph.timing}</div>
        </div>
    `).join('');
}

// Search from home screen
function searchFromHome() {
    const medicine = document.getElementById('homeSearchInput').value.trim().toLowerCase();
    if (!medicine) {
        alert("Please enter a medicine name");
        return;
    }
    performMedicineSearch(medicine);
    showScreen('resultsScreen');
}

// Perform medicine search across Bangalore pharmacies
function performMedicineSearch(medicine) {
    const medicineKey = medicine.toLowerCase();
    const stockedIds = stockDB[medicineKey] || [];
    
    currentSearchResults = pharmacies.filter(ph => stockedIds.includes(ph.id));
    
    const resultsContainer = document.getElementById('resultsList');
    
    if (currentSearchResults.length === 0) {
        resultsContainer.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #e67e22;"></i>
                <h3>No pharmacies found in Bangalore</h3>
                <p>"${medicine}" is currently out of stock nearby</p>
                <button class="directions-btn" onclick="showScreen('alternativesScreen')">Check Alternatives →</button>
            </div>
        `;
    } else {
        resultsContainer.innerHTML = `
            <h3>🔍 Results for "${medicine}" in Bangalore</h3>
            <p>✅ ${currentSearchResults.length} pharmacies have this medicine in stock</p>
            ${currentSearchResults.map(ph => `
                <div class="result-card" onclick="viewPharmacyDetails(${ph.id})">
                    <div style="display: flex; justify-content: space-between;">
                        <strong><i class="fas fa-store"></i> ${ph.name}</strong>
                        <span class="stock-badge" style="background: #c6f6d5;">✅ In Stock</span>
                    </div>
                    <div style="font-size: 0.8rem; color: #666;">📍 ${ph.area} • ${ph.address}</div>
                    <div style="font-size: 0.7rem; margin-top: 5px;">⏰ ${ph.timing}</div>
                </div>
            `).join('')}
        `;
    }
    
    addToHistory(medicine);
}

// View pharmacy details
function viewPharmacyDetails(pharmacyId) {
    const pharmacy = pharmacies.find(p => p.id === pharmacyId);
    const detailsContainer = document.getElementById('pharmacyDetails');
    
    detailsContainer.innerHTML = `
        <div class="pharmacy-header">
            <i class="fas fa-store" style="font-size: 3rem; color: #1b5a7a;"></i>
            <h2>${pharmacy.name}</h2>
            <span class="stock-badge" style="background: #c6f6d5;">✅ Medicine In Stock</span>
            <p style="margin-top: 0.5rem; color: #666;">📍 ${pharmacy.area}</p>
        </div>
        
        <div class="info-row">
            <i class="fas fa-map-marker-alt" style="font-size: 1.2rem;"></i>
            <div>
                <strong>Complete Address</strong><br>
                ${pharmacy.address}<br>
                Bangalore, Karnataka
            </div>
        </div>
        
        <div class="info-row">
            <i class="fas fa-phone" style="font-size: 1.2rem;"></i>
            <div>
                <strong>Phone Number</strong><br>
                ${pharmacy.phone}
            </div>
        </div>
        
        <div class="info-row">
            <i class="fas fa-clock" style="font-size: 1.2rem;"></i>
            <div>
                <strong>Business Hours</strong><br>
                ${pharmacy.timing}
            </div>
        </div>
        
        <div class="info-row">
            <i class="fas fa-route" style="font-size: 1.2rem;"></i>
            <div>
                <strong>Distance</strong><br>
                Approximately ${(Math.random() * 3 + 0.5).toFixed(1)} km from your location
            </div>
        </div>
        
        <button class="directions-btn" onclick="window.open('https://www.google.com/maps/dir/${userLat},${userLng}/${pharmacy.lat},${pharmacy.lng}/', '_blank')">
            <i class="fab fa-google"></i> Get Directions on Google Maps
        </button>
    `;
    
    showScreen('detailsScreen');
}

// Prescription upload handling
function handlePrescriptionUpload(input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('prescriptionPreview').innerHTML = `
                <img src="${e.target.result}" class="preview-image" alt="Prescription">
            `;
            
            // Simulate AI extraction
            const mockMedicines = ["Paracetamol", "Metformin", "Amoxicillin", "Cetirizine", "Azithromycin"];
            const randomMed = mockMedicines[Math.floor(Math.random() * mockMedicines.length)];
            
            document.getElementById('extractedInfo').style.display = 'block';
            document.getElementById('extractedMedicineName').innerHTML = `<strong>${randomMed} 500mg</strong><br><small>AI detected: ${randomMed}</small>`;
            window.extractedMedicine = randomMed;
        };
        reader.readAsDataURL(file);
    }
}

function searchExtractedMedicine() {
    if (window.extractedMedicine) {
        document.getElementById('homeSearchInput').value = window.extractedMedicine;
        performMedicineSearch(window.extractedMedicine);
        showScreen('resultsScreen');
    }
}

// Emergency mode for Bangalore
function findEmergencyPharmacy() {
    const medicine = document.getElementById('emergencyMedicine').value.trim().toLowerCase();
    if (!medicine) {
        alert("Please enter a medicine name");
        return;
    }
    
    const stockedIds = stockDB[medicine] || [];
    const stockedPharmacies = pharmacies.filter(ph => stockedIds.includes(ph.id));
    
    const resultDiv = document.getElementById('emergencyResult');
    
    if (stockedPharmacies.length === 0) {
        resultDiv.innerHTML = `
            <div style="background: #fed7d7; padding: 1rem; border-radius: 12px; color: #9b2c2c;">
                <i class="fas fa-exclamation-triangle"></i> No pharmacy in Bangalore has "${medicine}" in stock nearby!
            </div>
        `;
    } else {
        const nearest = stockedPharmacies[0];
        const googleMapsUrl = `https://www.google.com/maps/dir/${userLat},${userLng}/${nearest.lat},${nearest.lng}/`;
        
        resultDiv.innerHTML = `
            <div style="background: #c6f6d5; padding: 1rem; border-radius: 12px; margin-top: 1rem;">
                <i class="fas fa-ambulance" style="font-size: 2rem;"></i>
                <h3>🚨 Nearest Pharmacy Found!</h3>
                <p><strong>${nearest.name}</strong></p>
                <p>📍 ${nearest.area} | ${nearest.address}</p>
                <p>⏰ ${nearest.timing}</p>
                <button class="directions-btn" style="background: #4285f4; margin-top: 0.5rem;" onclick="window.open('${googleMapsUrl}', '_blank')">
                    <i class="fab fa-google"></i> Open Google Maps Now
                </button>
            </div>
        `;
    }
}

// Show alternatives
function showAlternatives() {
    const medicine = document.getElementById('altMedicineInput').value.trim().toLowerCase();
    const alternatives = alternativesDB[medicine] || [];
    
    const resultDiv = document.getElementById('alternativesResult');
    
    if (alternatives.length === 0) {
        resultDiv.innerHTML = `<div style="background: #fff0e0; padding: 1rem; border-radius: 12px;">No alternatives found for "${medicine}" in our database</div>`;
    } else {
        resultDiv.innerHTML = `
            <h3>💊 Alternatives for ${medicine}</h3>
            <p>Available at pharmacies across Bangalore:</p>
            ${alternatives.map(alt => `
                <div class="result-card" onclick="searchAlternative('${alt}')">
                    <strong><i class="fas fa-pills"></i> ${alt}</strong>
                    <div style="font-size: 0.8rem; color: #666;">Click to check availability</div>
                </div>
            `).join('')}
        `;
    }
}

function searchAlternative(medicine) {
    document.getElementById('homeSearchInput').value = medicine;
    performMedicineSearch(medicine);
    showScreen('resultsScreen');
}

// Prescription history functions
function addToHistory(medicine) {
    const historyItem = {
        medicine: medicine,
        date: new Date().toLocaleString(),
        id: Date.now()
    };
    prescriptionHistory.unshift(historyItem);
    if (prescriptionHistory.length > 10) prescriptionHistory.pop();
    localStorage.setItem('prescriptionHistory', JSON.stringify(prescriptionHistory));
    loadPrescriptionHistory();
}

function loadPrescriptionHistory() {
    const container = document.getElementById('prescriptionHistory');
    if (prescriptionHistory.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 2rem; color: #666;">No prescription history yet</div>';
    } else {
        container.innerHTML = prescriptionHistory.map(item => `
            <div class="history-item" onclick="searchAlternative('${item.medicine}')">
                <div>
                    <strong><i class="fas fa-capsules"></i> ${item.medicine}</strong>
                    <div style="font-size: 0.7rem; color: #666;">${item.date}</div>
                </div>
                <i class="fas fa-chevron-right" style="color: #1b5a7a;"></i>
            </div>
        `).join('');
    }
}

function clearHistory() {
    if (confirm("Clear all prescription history?")) {
        prescriptionHistory = [];
        localStorage.setItem('prescriptionHistory', JSON.stringify(prescriptionHistory));
        loadPrescriptionHistory();
    }
}

// Get user's real location (Bangalore or anywhere)
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
        userLat = pos.coords.latitude;
        userLng = pos.coords.longitude;
        if (homeMap) {
            homeMap.setView([userLat, userLng], 13);
        }
        const locationText = document.getElementById('locationText');
        if (locationText) {
            locationText.innerHTML = `📍 ${userLat.toFixed(4)}, ${userLng.toFixed(4)}`;
        }
    }, err => {
        console.log("Using default Bangalore location");
        const locationText = document.getElementById('locationText');
        if (locationText) {
            locationText.innerHTML = "📍 Bangalore (Default)";
        }
    });
}

// Make functions global
window.showScreen = showScreen;
window.searchFromHome = searchFromHome;
window.viewPharmacyDetails = viewPharmacyDetails;
window.handlePrescriptionUpload = handlePrescriptionUpload;
window.searchExtractedMedicine = searchExtractedMedicine;
window.findEmergencyPharmacy = findEmergencyPharmacy;
window.showAlternatives = showAlternatives;
window.searchAlternative = searchAlternative;
window.clearHistory = clearHistory;
window.performMedicineSearch = performMedicineSearch;
