const weatherUrl =
    "https://api.open-meteo.com/v1/forecast" +
    "?latitude=48.15" +
    "&longitude=17.11" +
    "&current=temperature_2m,wind_speed_10m,relative_humidity_2m" +
    "&forecast_hours=1" +
    "&timezone=auto";

fetch(weatherUrl)
    .then(response => response.json())
    .then(data => {

        const temperature = data.current.temperature_2m;
        const wind = data.current.wind_speed_10m;
        const humidity = data.current.relative_humidity_2m;
        const time = data.current.time.replace("T", " ");

        weatherElement.innerHTML =
            "Mesto: " + city + "<br>" +
            "Teplota: " + temperature + " °C<br>" +
            "Vietor: " + wind + " km/h<br>" +
            "Vlhkosť: " + humidity + " %<br>";
            
    })
    .catch(error => {

        document.getElementById("weather").innerHTML =
            "Nepodarilo sa načítať počasie.";

        console.error(error);

    });

    const city = "Bratislava";

const weatherElement = document.getElementById("weather");

const map = L.map("map").setView(
    [48.151965, 17.072995],
    15
);

L.tileLayer(
    "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        maxZoom: 19,
        attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }
).addTo(map);

L.marker([48.151965, 17.072995])
    .addTo(map)
    .bindPopup("FEI STU Bratislava");

L.marker([48.159238, 17.064226])
    .addTo(map)
    .bindPopup("SD Mladost")
    .openPopup();