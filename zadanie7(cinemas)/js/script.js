const SOURCES = [
  {
    id: "hviezda",
    name: "Kino Hviezda",
    website: "https://www.kino-hviezda.example/program?tyzden=45&jazyk=sk",
    localUrl: "source/kino-hviezda.html",
    parse: parseHviezda,
  },
  {
    id: "mier",
    name: "Kino Mier",
    website: "https://kinomier.example/rozpis?mesto=ba&tyzden=45",
    localUrl: "source/kino-mier.html",
    parse: parseMier,
  },
  {
    id: "lumiere",
    name: "Kino Lumière",
    website: "https://lumiere.example/program/?od=2026-11-02&do=2026-11-08",
    localUrl: "source/kino-lumiere.html",
    parse: parseLumiere,
  },
  {
  id: "odeon",
  name: "Kino Odeon",
  website: "https://odeon.example/program",
  localUrl: "source/kino-odeon.html",
  parse: parseHviezda,
  },
];

// Simulated server delay (ms), so that we can see slow and fast sources. Not part of a real solution.
const DELAYS = { hviezda: 1500, mier: 500, lumiere: 1000 };

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function loadSource(source) {
  await wait(DELAYS[source.id] ?? 0);
  const response = await fetch(source.localUrl);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return source.parse(parseHtml(await response.text()));
}

const statusText = document.getElementById("status");
const refreshButton = document.getElementById("refresh");
const cards = document.getElementById("cards");

const results = {};
const hiddenSources = new Set();

function createTodayList(days) {
  const today = DAY_NAMES[(new Date().getDay() + 6) % 7];
  const day = days.find((item) => item.day === today);
  if (!day || day.screenings.length === 0) {
    const empty = document.createElement("p");
    empty.className = "mb-0 text-body-secondary";
    empty.textContent = `${today}: dnes sa nehrá.`;
    return empty;
  }
  const list = document.createElement("ul");
  list.className = "list-unstyled mb-0";
  for (const screening of day.screenings) {
    const item = document.createElement("li");
    const price = screening.price === null ? "cena neuvedená" : `${screening.price.toFixed(2)} €`;
    item.textContent = `${screening.time} ${screening.title} (${price})`;
    list.append(item);
  }
  return list;
}

function createCard(source) {
  const result = results[source.id] ?? { state: "loading" };

  const column = document.createElement("div");
  column.className = "col-12 col-md-6 col-lg-4";
  column.dataset.source = source.id;

  const card = document.createElement("article");
  card.className = "card h-100";

  const header = document.createElement("div");
  header.className = "card-header d-flex justify-content-between align-items-center";

  const title = document.createElement("h2");
  title.className = "h5 mb-0";

  const link = document.createElement("a");
  link.href = source.website;
  link.textContent = source.name;

  title.append(link);
  header.append(title);

  const body = document.createElement("div");
  body.className = "card-body";

  if (result.state === "loading") {
    const spinner = document.createElement("div");
    spinner.className = "spinner-border spinner-border-sm";
    spinner.setAttribute("role", "status");

    const label = document.createElement("span");
    label.className = "visually-hidden";
    label.textContent = "Načítava sa…";

    spinner.append(label);
    header.append(spinner);
    body.textContent = "Načítavam program…";

  } else if (result.state === "error") {
    body.classList.add("text-danger");
    body.textContent =
      `Program sa nepodarilo načítať (${result.error.message}). `;

    const retry = document.createElement("button");
    retry.type = "button";
    retry.className = "btn btn-sm btn-outline-danger";
    retry.textContent = "Skúsiť znova";

    retry.addEventListener("click", () =>
      loadOne(source).catch(() => {})
    );

    body.append(retry);

  } else {
    body.append(createTodayList(result.days));
  }

  const footer = document.createElement("div");
  footer.className = "card-footer small text-body-secondary";

  footer.textContent = result.updatedAt
    ? `Aktualizované ${result.updatedAt.toLocaleString("sk-SK")}`
    : "Zatiaľ nenačítané";

  card.append(header, body, footer);
  column.append(card);

  return column;
}

function renderCards() {
  const visible = SOURCES.filter((source) => !hiddenSources.has(source.id));
  cards.replaceChildren(...visible.map(createCard));
}

async function loadOne(source) {
  const previous = results[source.id];
  results[source.id] = { state: "loading", updatedAt: previous?.updatedAt };
  renderCards();
  try {
    const days = await loadSource(source);
    results[source.id] = { state: "ok", days, updatedAt: new Date() };
  } catch (error) {
    results[source.id] = { state: "error", error, updatedAt: previous?.updatedAt };
    throw error;
  } finally {
    renderCards();
  }
}

async function loadAll() {
  refreshButton.disabled = true;
  statusText.textContent = "Načítavam programy…";
  const outcomes = await Promise.allSettled(SOURCES.map(loadOne));
  const failed = outcomes.filter((outcome) => outcome.status === "rejected").length;
  statusText.textContent = `Načítané ${SOURCES.length - failed} z ${SOURCES.length} kín.`;
  refreshButton.disabled = false;
}

refreshButton.addEventListener("click", loadAll);
loadAll();

const filters = document.getElementById("filters");

for (const source of SOURCES) {
  const label = document.createElement("label");
  label.className = "form-check form-check-inline";
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "form-check-input";
  checkbox.checked = true;
  checkbox.addEventListener("change", () => {
  if (checkbox.checked) {
    hiddenSources.delete(source.id);
  } else {
    hiddenSources.add(source.id);
  }
  renderCards();
  });
  label.append(checkbox, ` ${source.name}`);
  filters.append(label);
}

