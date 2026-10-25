const SOURCE_URL = "source/kino-hviezda.html";
const STORAGE_KEY = "cinema-program";

const DAY_NAMES = [
  "Pondelok",
  "Utorok",
  "Streda",
  "Štvrtok",
  "Piatok",
  "Sobota",
  "Nedeľa"
];

const statusText = document.getElementById("status");
const refreshButton = document.getElementById("refresh");
const clearButton = document.getElementById("clear");
const tabs = document.getElementById("day-tabs");
const schedule = document.getElementById("schedule");

let program = [];
let selectedDay = 0;

async function loadCinemaHtml() {
  const response = await fetch(SOURCE_URL);

  if (!response.ok) {
    throw new Error(
      `Stránku kina sa nepodarilo načítať (HTTP ${response.status}).`
    );
  }

  return response.text();
}

function loadCinemaHtmlJquery() {
  return $.ajax({
    url: SOURCE_URL,
    dataType: "text"
  });
}

function parseHtml(html) {
  return new DOMParser().parseFromString(html, "text/html");
}

function cleanText(text) {
  return text.replace(/\s+/g, " ").trim();
}

function textOf(element, selector) {
  return cleanText(
    element.querySelector(selector)?.textContent ?? ""
  );
}

function parsePrice(text) {
  if (!text) {
    return null;
  }

  const price = parseFloat(text.replace(",", "."));

  return Number.isNaN(price) ? null : price;
}

function parseCinema(doc) {
  const days = [];

  for (const section of doc.querySelectorAll(".den")) {
    const heading = section.querySelector("h2");
    const screenings = [];

    for (const film of section.querySelectorAll(".film")) {
      const time = textOf(film, ".cas");
      const title = textOf(film, ".nazov");

      if (!time || !title) {
        console.warn("Skipping incomplete screening:", film);
        continue;
      }

      screenings.push({
        time,
        title,
        hall: textOf(film, ".sala"),
        price: parsePrice(textOf(film, ".cena"))
      });
    }

    days.push({
      day: cleanText(heading.firstChild.textContent),
      date: textOf(heading, "small"),
      screenings
    });
  }

  return days;
}

function parseCinemaJquery(doc) {
  const days = [];

  $(doc).find(".den").each((index, section) => {
    const $section = $(section);
    const screenings = [];

    $section.find(".film").each((filmIndex, film) => {
      const $film = $(film);

      const time = cleanText($film.find(".cas").text());
      const title = cleanText($film.find(".nazov").text());

      if (!time || !title) {
        console.warn("Skipping incomplete screening:", film);
        return;
      }

      screenings.push({
        time,
        title,
        hall: cleanText($film.find(".sala").text()),
        price: parsePrice($film.find(".cena").text())
      });
    });

    days.push({
      day: cleanText(
        $section.find("h2").contents().first().text()
      ),
      date: cleanText($section.find("h2 small").text()),
      screenings
    });
  });

  return days;
}

function saveProgram(days) {
  const data = {
    savedAt: new Date().toISOString(),
    days
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadSavedProgram() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (!data || !Array.isArray(data.days) || data.days.length === 0) {
      return null;
    }

    const savedAt = new Date(data.savedAt);

    if (savedAt.toDateString() !== new Date().toDateString()) {
      return null;
    }

    return {
      savedAt,
      days: data.days
    };
  } catch (error) {
    console.warn("Could not read saved program:", error);
    return null;
  }
}

function getTodayIndex() {
  const todayName = DAY_NAMES[(new Date().getDay() + 6) % 7];
  const index = program.findIndex((day) => day.day === todayName);

  return index === -1 ? 0 : index;
}

function renderTabs() {
  tabs.replaceChildren();

  program.forEach((day, index) => {
    const button = document.createElement("button");

    button.type = "button";
    button.textContent = day.day;
    button.setAttribute("aria-pressed", index === selectedDay);

    button.addEventListener("click", () => {
      selectedDay = index;
      render();
    });

    tabs.append(button);
  });
}

function renderDay() {
  schedule.replaceChildren();

  const day = program[selectedDay];

  if (!day) {
    return;
  }

  const heading = document.createElement("h2");
  heading.textContent = `${day.day} ${day.date}`;
  schedule.append(heading);

  if (day.screenings.length === 0) {
    const empty = document.createElement("p");
    empty.textContent =
      "Na tento deň nie je v programe žiadne predstavenie.";

    schedule.append(empty);
    return;
  }

  const list = document.createElement("ul");

  for (const screening of day.screenings) {
    const item = document.createElement("li");

    const price = screening.price === null
      ? "cena neuvedená"
      : `${screening.price.toFixed(2)} €`;

    item.textContent =
      `${screening.time} · ${screening.title} · ` +
      `${screening.hall} · ${price}`;

    list.append(item);
  }

  schedule.append(list);
}

function render() {
  renderTabs();
  renderDay();
}

async function showProgram(forceRefresh = false) {
  const saved = forceRefresh ? null : loadSavedProgram();

  if (saved) {
    program = saved.days;

    statusText.textContent =
      `Uložený program z ${saved.savedAt.toLocaleString("sk-SK")}.`;
  } else {
    statusText.textContent = "Načítavam program…";
    refreshButton.disabled = true;

    try {
      const html = await loadCinemaHtml();
      const doc = parseHtml(html);
      const days = parseCinema(doc);

      if (days.length === 0) {
        throw new Error(
          "Na stránke kina sa nenašiel program. " +
          "Možno sa zmenila jej štruktúra."
        );
      }

      program = days;
      saveProgram(program);

      statusText.textContent =
        `Program aktualizovaný ${new Date().toLocaleString("sk-SK")}.`;
    } catch (error) {
      statusText.textContent = error.message;
    } finally {
      refreshButton.disabled = false;
    }
  }

  selectedDay = getTodayIndex();
  render();
}

refreshButton.addEventListener("click", () => {
  showProgram(true);
});

clearButton.addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  statusText.textContent = "Uložené dáta sú vymazané.";
});

showProgram();