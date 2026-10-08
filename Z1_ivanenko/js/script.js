"use strict";

const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".site-nav");

if (menuButton && navigation) {
    menuButton.hidden = false;
    navigation.classList.add("menu-ready");
    menuButton.addEventListener("click", function () {
        const isOpen = navigation.classList.toggle("menu-open");
        menuButton.setAttribute("aria-expanded", String(isOpen));
    });
    navigation.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            navigation.classList.remove("menu-open");
            menuButton.setAttribute("aria-expanded", "false");
            menuButton.focus();
        }
    });
}

function calculateDistance(latitudeA, longitudeA, latitudeB, longitudeB) {
    const earthRadius = 6371;
    const radians = Math.PI / 180;
    const latitudeDifference = (latitudeB - latitudeA) * radians;
    const longitudeDifference = (longitudeB - longitudeA) * radians;
    const a = Math.sin(latitudeDifference / 2) ** 2
        + Math.cos(latitudeA * radians) * Math.cos(latitudeB * radians)
        * Math.sin(longitudeDifference / 2) ** 2;
    const safeValue = Math.max(0, Math.min(1, a));
    return earthRadius * 2 * Math.atan2(Math.sqrt(safeValue), Math.sqrt(1 - safeValue));
}

if (document.getElementById("map")) {
    initialiseMap();
}

function initialiseMap() {
    const errorMessage = document.getElementById("map-error");
    if (typeof L === "undefined") {
        errorMessage.textContent = "Mapu sa nepodarilo načítať. Obnovte stránku. Školu aj domov si môžete pozrieť cez odkazy pod mapou.";
        errorMessage.hidden = false;
        return;
    }

    const storageKey = "denys-ivanenko-map-points-v1";
    const destinations = {
        school: { name: "FEI STU Bratislava", latitude: 48.151965, longitude: 17.072995 },
        home: { name: "ŠD Mladosť (orientačný domov)", latitude: 48.159238, longitude: 17.064226 }
    };
    const pointForm = document.getElementById("point-form");
    const nameInput = document.getElementById("point-name");
    const latitudeInput = document.getElementById("point-latitude");
    const longitudeInput = document.getElementById("point-longitude");
    const pointSelect = document.getElementById("point-select");
    const destinationSelect = document.getElementById("destination-select");
    const removeButton = document.getElementById("remove-point");
    const pointStatus = document.getElementById("point-status");
    const storageStatus = document.getElementById("storage-status");
    const emptyState = document.getElementById("empty-state");
    const distanceResult = document.getElementById("distance-result");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let points = loadPoints();
    let connection = null;
    let draftMarker = null;
    const pointMarkers = [];
    const destinationMarkers = {};

    const map = L.map("map", {
        scrollWheelZoom: false,
        worldCopyJump: true,
        zoomAnimation: !reduceMotion,
        fadeAnimation: !reduceMotion,
        markerZoomAnimation: !reduceMotion
    }).setView([48.1555, 17.069], 14);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).on("tileerror", function () {
        errorMessage.textContent = "Niektoré mapové podklady sa nepodarilo načítať. Skontrolujte internet a obnovte stránku. Body a výpočet vzdialenosti fungujú aj bez podkladov.";
        errorMessage.hidden = false;
    }).addTo(map);

    const styles = getComputedStyle(document.documentElement);
    const routeColor = styles.getPropertyValue("--color-brand").trim();
    const draftColor = styles.getPropertyValue("--color-accent").trim();

    Object.keys(destinations).forEach(function (key) {
        const place = destinations[key];
        destinationMarkers[key] = L.marker([place.latitude, place.longitude], {
            title: place.name,
            alt: place.name
        }).addTo(map).bindPopup(createPopup(place.name));
        destinationMarkers[key].bindTooltip(place.name);
    });

    document.getElementById("point-fields").disabled = false;
    renderPoints();

    map.on("resize", function () {
        if (points.length > 0) {
            updateConnection();
        }
    });

    map.on("click", function (event) {
        const coordinates = event.latlng.wrap();
        latitudeInput.value = coordinates.lat.toFixed(6);
        longitudeInput.value = coordinates.lng.toFixed(6);
        if (draftMarker) {
            map.removeLayer(draftMarker);
        }
        draftMarker = L.circleMarker(coordinates, {
            radius: 9, color: draftColor, fillOpacity: 0.3
        }).addTo(map);
        pointStatus.textContent = "Miesto je vybrané. Zadajte názov a stlačte „Pridať miesto“.";
        nameInput.focus();
    });

    nameInput.addEventListener("input", function () {
        nameInput.setCustomValidity("");
    });

    pointForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const name = nameInput.value.trim();
        if (!name) {
            nameInput.setCustomValidity("Zadajte názov miesta, nie iba medzery.");
            nameInput.reportValidity();
            return;
        }
        if (!pointForm.reportValidity()) {
            return;
        }
        points.push({
            name: name,
            latitude: Number(latitudeInput.value),
            longitude: Number(longitudeInput.value)
        });
        savePoints();
        renderPoints(points.length - 1);
        pointForm.reset();
        if (draftMarker) {
            map.removeLayer(draftMarker);
            draftMarker = null;
        }
        pointStatus.textContent = "Miesto „" + name + "“ je pridané. Môžete vybrať cieľ alebo pridať ďalší bod.";
    });

    pointSelect.addEventListener("change", updateConnection);
    destinationSelect.addEventListener("change", updateConnection);
    removeButton.addEventListener("click", function () {
        const selectedIndex = Number(pointSelect.value);
        const removed = points.splice(selectedIndex, 1)[0];
        savePoints();
        renderPoints(Math.min(selectedIndex, points.length - 1));
        pointStatus.textContent = "Miesto „" + removed.name + "“ je odstránené.";
        if (points.length === 0) {
            nameInput.focus();
        }
    });

    function loadPoints() {
        try {
            const stored = localStorage.getItem(storageKey);
            if (stored === null) {
                return [];
            }
            const parsed = JSON.parse(stored);
            if (!Array.isArray(parsed) || !parsed.every(isValidPoint)) {
                throw new Error("Invalid saved points");
            }
            return parsed;
        } catch (error) {
            storageStatus.textContent = "Uložené miesta sa nepodarilo načítať. Môžete pridať nové; pri ukladaní nahradia pôvodný zoznam, ak to prehliadač umožní.";
            return [];
        }
    }

    function isValidPoint(point) {
        return point !== null && typeof point === "object"
            && typeof point.name === "string" && point.name.trim().length > 0 && point.name.length <= 80
            && Number.isFinite(point.latitude) && Math.abs(point.latitude) <= 90
            && Number.isFinite(point.longitude) && Math.abs(point.longitude) <= 180;
    }

    function savePoints() {
        try {
            localStorage.setItem(storageKey, JSON.stringify(points));
            storageStatus.textContent = "Miesta sú uložené v tomto prehliadači. Zostanú tu aj po obnovení stránky.";
        } catch (error) {
            storageStatus.textContent = "Prehliadač nepovolil uloženie. Miesta fungujú teraz, ale po obnovení sa tieto zmeny stratia.";
        }
    }

    function createPopup(name, description) {
        const content = document.createElement("div");
        const heading = document.createElement("strong");
        heading.textContent = name;
        content.append(heading);
        if (description) {
            const paragraph = document.createElement("p");
            paragraph.textContent = description;
            content.append(paragraph);
        }
        return content;
    }

    function renderPoints(selectedIndex = 0) {
        pointMarkers.forEach(function (marker) { map.removeLayer(marker); });
        pointMarkers.length = 0;
        pointSelect.replaceChildren();
        points.forEach(function (point, index) {
            const option = document.createElement("option");
            option.value = String(index);
            option.textContent = point.name;
            pointSelect.append(option);
            const marker = L.marker([point.latitude, point.longitude], {
                title: point.name,
                alt: point.name
            }).addTo(map).bindPopup(createPopup(point.name));
            marker.on("click", function () {
                pointSelect.value = String(index);
                updateConnection();
            });
            pointMarkers.push(marker);
        });
        const isEmpty = points.length === 0;
        pointSelect.disabled = isEmpty;
        destinationSelect.disabled = isEmpty;
        removeButton.disabled = isEmpty;
        emptyState.hidden = !isEmpty;
        if (isEmpty) {
            const option = document.createElement("option");
            option.value = "";
            option.textContent = "Najprv pridajte miesto";
            pointSelect.append(option);
        } else {
            pointSelect.value = String(selectedIndex);
        }
        updateConnection();
    }

    function updateConnection() {
        if (connection) {
            map.removeLayer(connection);
            connection = null;
        }
        Object.keys(destinations).forEach(function (key) {
            destinationMarkers[key].setPopupContent(createPopup(destinations[key].name));
        });
        pointMarkers.forEach(function (marker, index) {
            marker.setPopupContent(createPopup(points[index].name));
        });
        if (points.length === 0) {
            distanceResult.textContent = "Po pridaní miesta tu zobrazím vzdialenosť k zvolenému cieľu.";
            return;
        }
        const index = Number(pointSelect.value);
        const point = points[index];
        const target = destinations[destinationSelect.value];
        const distance = calculateDistance(point.latitude, point.longitude, target.latitude, target.longitude);
        const distanceText = distance.toLocaleString("sk-SK", {
            minimumFractionDigits: 2, maximumFractionDigits: 2
        }) + " km";
        distanceResult.textContent = point.name + " → " + target.name + ": " + distanceText + " vzdušnou čiarou.";
        connection = L.polyline([
            [point.latitude, point.longitude],
            [target.latitude, target.longitude]
        ], { color: routeColor, weight: 4 }).addTo(map);
        pointMarkers[index].setPopupContent(createPopup(point.name, "K cieľu " + target.name + ": " + distanceText));
        destinationMarkers[destinationSelect.value].setPopupContent(createPopup(target.name, "Od miesta " + point.name + ": " + distanceText));
        map.fitBounds(connection.getBounds(), { padding: [36, 36], maxZoom: 15, animate: !reduceMotion });
    }
}
