# Problem statement
In India, patients and caregivers frequently waste critical time visiting multiple physical pharmacies to find a single medication. This search process is particularly 
dangerous during medical emergencies where delays can lead to serious health consequences. Furthermore, elderly users and those with low digital literacy often struggle to decode 
handwritten prescriptions or navigate complex online search tools.Key Pain Points:Lack of a single platform to check real-time availability across different stores.No easy path to find 
equivalent alternatives for unavailable medicines.Significant barriers for users who cannot manually type or search for medicine names.
# Proposed solution
MediFind is an accessible web application that allows users to find medicine availability instantly on an interactive map
It is designed to be inclusive, catering to both tech-savvy users and those with limited digital experience.Core Features:Medicine Search & Map
Instantly view nearby pharmacies with stock, color-coded for easy navigation.AI Prescription Upload:
Users can upload a photo of a prescription; the app uses static data from the local storage, removing the need to type.Emergency Mode
A one-tap feature that prioritizes the closest pharmacy with the medicine in stock.Alternative 
# Tech stack
-> HTML
-> CSS
-> JS
-> Leaflet.js 
-> CartoDB Basemaps (via OpenStreetMap): Provides the actual map tiles (the visual imagery of the map) loaded into Leaflet.
-> Google Maps URL Scheme: Used to generate "Get Directions" links. It creates a simple URL containing the user's location and the destination pharmacy.
# API
-> Geolocation API (navigator.geolocation): A standard browser API used to request the user's real-world latitude and longitude coordinates.
-> LocalStorage API (window.localStorage): Used to persistently save the user's "Prescription History" data on their device so it isn't lost when they refresh the page.
-> FileReader API: Used locally to convert the user's uploaded prescription image into a data URL so it can be previewed on the screen before any "upload" happens.
# UI Asset CDN's
-> Font Awesome (v6.0.0-beta3): Provides all the icons (like the map pins, user profile, and camera icons).
-> Google Fonts: Provides the "Inter" typography family
# Git hub usage
-> deployed with vercel 
