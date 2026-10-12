"use strict";

const SEMESTER_START = "2026-09-14";
const SEMESTER_END = "2026-12-20";

const HOTSPOTS = [
    {
        x: 44, y: 57,
        title: "Monitor",
        text: "Na väčšom monitore si zobrazujem kód, poznámky a materiály k štúdiu. Pomáha mi mať pri práci viac vecí vedľa seba."
    },
    {
        x: 80, y: 60,
        title: "Notebook",
        text: "Notebook používam na programovanie a prípravu školských zadaní. Môžem na ňom pracovať doma aj na univerzite."
    },
    {
        x: 48, y: 83,
        title: "Klávesnica",
        text: "Na klávesnici píšem kód a poznámky."
    },
    {
        x: 7, y: 25,
        title: "Slúchadlá",
        text: "Slúchadlá používam na počúvanie hudby a pri hraní hier."
    },
    {
        x: 82, y: 85,
        title: "Myš",
        text: "Myš používam pri práci s počítačom a hraní hier."
    }
];

createHotspots();

function createHotspots() {
    const image = document.getElementById("workspace-image");
    if (!image) {
        return;
    }

    HOTSPOTS.forEach(function (point, index) {
        const hotspot = document.createElement("div");
        hotspot.className = "hotspot";
        hotspot.style.setProperty("--x", point.x + "%");
        hotspot.style.setProperty("--y", point.y + "%");

        if (point.x > 50) {
            hotspot.classList.add("hotspot--left");
        }
        if (point.y > 70) {
            hotspot.classList.add("hotspot--above");
        }

        const button = document.createElement("button");
        button.className = "hotspot__dot";
        button.type = "button";
        button.textContent = index + 1;
        button.setAttribute("aria-label", point.title);
        button.setAttribute("aria-describedby", "hotspot-text-" + index);

        const panel = document.createElement("div");
        panel.className = "hotspot__panel";
        const heading = document.createElement("h2");
        heading.textContent = point.title;
        const paragraph = document.createElement("p");
        paragraph.id = "hotspot-text-" + index;
        paragraph.textContent = point.text;

        panel.append(heading, paragraph);
        hotspot.append(button, panel);
        image.append(hotspot);
    });
}

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

if (document.getElementById("schedule-table")) {
    initialiseSchedule();
}

function initialiseSchedule() {
    const table = document.getElementById("schedule-table");
    const lessons = Array.from(table.querySelectorAll(".lesson"));
    const filters = document.getElementById("schedule-filters");
    const buttons = filters.querySelectorAll("button");
    const scrollArea = document.getElementById("schedule-scroll");
    const filterStatus = document.getElementById("filter-status");
    const status = document.getElementById("schedule-status");
    const progress = document.getElementById("semester-progress");
    const semesterStatus = document.getElementById("semester-status");
    const semesterDates = document.getElementById("semester-dates");
    const semesterStart = new Date(SEMESTER_START + "T00:00:00");
    const semesterEnd = new Date(SEMESTER_END + "T23:59:59");
    const validDates = !Number.isNaN(semesterStart.getTime())
        && !Number.isNaN(semesterEnd.getTime()) && semesterEnd > semesterStart;

    filters.hidden = false;
    buttons.forEach(function (button) {
        button.addEventListener("click", function () {
            applyFilter(button.dataset.filter);
        });
    });
    applyFilter("all");
    updateSchedule();
    setInterval(updateSchedule, 30000);

    function applyFilter(filter) {
        let matchingCount = 0;
        lessons.forEach(function (lesson) {
            const matches = filter === "all" || lesson.dataset.type === filter;
            lesson.classList.toggle("is-filtered", !matches);
            lesson.setAttribute("aria-hidden", String(!matches));
            if (matches) {
                matchingCount++;
            }
        });
        buttons.forEach(function (button) {
            button.setAttribute("aria-pressed", String(button.dataset.filter === filter));
        });
        filterStatus.hidden = matchingCount > 0 || lessons.length === 0;
        filterStatus.textContent = "V rozvrhu nemám žiadne hodiny tohto typu.";
        scrollArea.hidden = matchingCount === 0;
    }

    function updateSchedule() {
        const now = new Date();
        status.hidden = false;
        lessons.forEach(function (lesson) {
            lesson.classList.remove("is-current");
        });

        if (validDates) {
            const percentage = Math.round(Math.max(0, Math.min(100,
                (now - semesterStart) / (semesterEnd - semesterStart) * 100)));
            progress.hidden = false;
            progress.value = percentage;
            progress.textContent = percentage + " %";
            semesterDates.textContent = "Začiatok: " + semesterStart.toLocaleDateString("sk-SK")
                + ". Koniec: " + semesterEnd.toLocaleDateString("sk-SK") + ".";
            semesterStatus.hidden = false;
            semesterStatus.textContent = "Uplynulo " + percentage + " % semestra.";
        }

        if (lessons.length === 0) {
            status.textContent = "V rozvrhu nie sú žiadne hodiny.";
            return;
        }
        if (!validDates) {
            status.textContent = "Dátumy semestra nie sú dostupné.";
            return;
        }
        if (now > semesterEnd) {
            status.textContent = "Semester sa už skončil. V tomto rozvrhu už nemám ďalšiu hodinu.";
            return;
        }

        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const current = lessons.find(function (lesson) {
            return now >= semesterStart && Number(lesson.dataset.day) === now.getDay()
                && currentMinutes >= timeToMinutes(lesson.dataset.start)
                && currentMinutes < timeToMinutes(lesson.dataset.end);
        });
        if (current) {
            current.classList.add("is-current");
            status.textContent = "Práve mám " + current.querySelector("strong").textContent
                + " (" + current.dataset.start + "–" + current.dataset.end + ").";
            return;
        }

        let nextLesson = null;
        let nextDate = null;
        const searchStart = now < semesterStart ? semesterStart : now;
        for (let offset = 0; offset <= 7; offset++) {
            const day = new Date(searchStart);
            day.setDate(day.getDate() + offset);
            lessons.forEach(function (lesson) {
                if (Number(lesson.dataset.day) !== day.getDay()) {
                    return;
                }
                const startsAt = new Date(day);
                const minutes = timeToMinutes(lesson.dataset.start);
                startsAt.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
                if (startsAt > now && startsAt >= semesterStart && startsAt <= semesterEnd
                    && (nextDate === null || startsAt < nextDate)) {
                    nextLesson = lesson;
                    nextDate = startsAt;
                }
            });
        }
        status.textContent = nextLesson
            ? "Teraz nemám výučbu. Najbližšie mám " + nextLesson.querySelector("strong").textContent
                + ": " + nextDate.toLocaleDateString("sk-SK", { weekday: "long", day: "numeric", month: "numeric" })
                + " o " + nextLesson.dataset.start + "."
            : "Teraz nemám výučbu. Do konca semestra už v rozvrhu nemám ďalšiu hodinu.";
    }

    function timeToMinutes(time) {
        const parts = time.split(":").map(Number);
        return parts[0] * 60 + parts[1];
    }
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
        errorMessage.textContent = "Mapu sa nepodarilo načítať. Skúste obnoviť stránku.";
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
        errorMessage.textContent = "Mapové podklady sa nepodarilo načítať. Body a vzdialenosti sú stále dostupné.";
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
        }).addTo(map).bindPopup(createPopup(place.name), {
            keepInView: true,
            autoPanPaddingTopLeft: [5, 80]
        });
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
        pointStatus.hidden = false;
        pointStatus.textContent = "Zadajte názov a stlačte „Pridať miesto“.";
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
        pointStatus.hidden = false;
        pointStatus.textContent = "Miesto „" + name + "“ je pridané.";
    });

    pointSelect.addEventListener("change", updateConnection);
    destinationSelect.addEventListener("change", updateConnection);
    removeButton.addEventListener("click", function () {
        const selectedIndex = Number(pointSelect.value);
        const removed = points.splice(selectedIndex, 1)[0];
        savePoints();
        renderPoints(Math.min(selectedIndex, points.length - 1));
        pointStatus.hidden = false;
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
            storageStatus.textContent = "Uložené miesta sa nepodarilo načítať.";
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
            storageStatus.textContent = "Miesta sú uložené v tomto prehliadači.";
        } catch (error) {
            storageStatus.textContent = "Zmeny sa nepodarilo uložiť. Po obnovení stránky sa nezachovajú.";
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
        pointMarkers.forEach(function (marker) {
            map.removeLayer(marker);
        });
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
            }).addTo(map).bindPopup(createPopup(point.name), {
                keepInView: true,
                autoPanPaddingTopLeft: [5, 80]
            });
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
            distanceResult.hidden = true;
            distanceResult.textContent = "";
            return;
        }
        const index = Number(pointSelect.value);
        const point = points[index];
        const target = destinations[destinationSelect.value];
        const distance = calculateDistance(point.latitude, point.longitude, target.latitude, target.longitude);
        const distanceText = distance.toLocaleString("sk-SK", {
            minimumFractionDigits: 2, maximumFractionDigits: 2
        }) + " km";
        distanceResult.hidden = false;
        distanceResult.textContent = point.name + " → " + target.name + ": " + distanceText;
        connection = L.polyline([
            [point.latitude, point.longitude],
            [target.latitude, target.longitude]
        ], { color: routeColor, weight: 4 }).addTo(map);
        pointMarkers[index].setPopupContent(createPopup(point.name, "K cieľu " + target.name + ": " + distanceText));
        destinationMarkers[destinationSelect.value].setPopupContent(createPopup(target.name, "Od miesta " + point.name + ": " + distanceText));
        map.fitBounds(connection.getBounds(), { padding: [36, 36], maxZoom: 15, animate: !reduceMotion });
    }
}
