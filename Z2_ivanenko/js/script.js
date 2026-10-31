// Restaurant sources
const RESTAURANTS = [
  {
    id: "eatandmeet",
    name: "Eat & Meet",
    url: "https://eatandmeet.sk/tyzdenne-menu",
    localUrl: "source/Eat&Meet.html",
    parse: parseEatAndMeet,
    menu: [],
    updatedAt: null,
    error: "",
    loading: false
  },
  {
    id: "fiitfood",
    name: "FIIT FOOD",
    url: "http://www.freefood.sk/menu/",
    localUrl: "source/freefood.html",
    parse: parseFiitFood,
    menu: [],
    updatedAt: null,
    error: "",
    loading: false
  },
  {
    id: "drag",
    name: "DRAG",
    url: "https://www.restauracia-drag.sk/denne-menu",
    localUrl: "source/drag.html",
    parse: parseDrag,
    menu: [],
    updatedAt: null,
    error: "",
    loading: false
  }
];

const STORAGE_PREFIX = "obedove-menu-";
const STORAGE_VERSION = 5;
const menuList = document.getElementById("menu-list");
const menuHeading = document.getElementById("menu-heading");
const statusText = document.getElementById("menu-status");
const dayButtons = document.querySelectorAll(".day-button");
const restaurantFilters = document.querySelectorAll('input[name="restaurant"]');
const refreshButton = document.getElementById("refresh-menu");
const clearButton = document.getElementById("clear-menu");

const today = new Date().getDay();
let selectedDay = today >= 1 && today <= 5 ? String(today) : "1";
let isLoading = false;
let notice = "";

// Read today's saved menu
function loadSavedMenu(restaurant) {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_PREFIX + restaurant.id));

    if (!data || data.version !== STORAGE_VERSION || data.source !== restaurant.localUrl || !Array.isArray(data.menu) || data.menu.length === 0) {
      return null;
    }

    const updatedAt = new Date(data.updatedAt);

    if (updatedAt.toDateString() !== new Date().toDateString()) {
      return null;
    }1

    const valid = data.menu.every(meal =>
      meal && Number.isInteger(meal.day) && meal.day >= 1 && meal.day <= DAYS.length &&
      typeof meal.name === "string" && typeof meal.type === "string" &&
      typeof meal.date === "string" && typeof meal.weight === "string" &&
      Array.isArray(meal.allergens)
    );

    return valid ? data : null;
  } catch {
    return null;
  }
}

// Save menu to localStorage
function saveMenu(restaurant) {
  const data = {
    version: STORAGE_VERSION,
    source: restaurant.localUrl,
    updatedAt: restaurant.updatedAt,
    menu: restaurant.menu
  };

  try {
    localStorage.setItem(STORAGE_PREFIX + restaurant.id, JSON.stringify(data));
  } catch {
    notice = "Menu je načítané, ale údaje sa nepodarilo uložiť v prehliadači.";
  }
}

// Load and parse one restaurant
async function loadRestaurant(restaurant, forceRefresh) {
  try {
    const saved = forceRefresh ? null : loadSavedMenu(restaurant);                                          

    if (saved) {
      restaurant.menu = saved.menu;
      restaurant.updatedAt = saved.updatedAt;
      return;
    }

    const response = await fetch(restaurant.localUrl, {  cache: "no-store" });

    if (!response.ok) {
      throw new Error("Zdroj menu sa nepodarilo načítať. Skúste ho aktualizovať znova.");
    }

    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    const menu = restaurant.parse(doc);

    if (menu.length === 0) {
      throw new Error("Na uloženej stránke sa nenašlo menu. Jej štruktúra sa mohla zmeniť.");
    }

    restaurant.menu = menu;
    restaurant.updatedAt = new Date().toISOString();
    saveMenu(restaurant);
  } catch (error) {
    restaurant.error = location.protocol === "file:"
      ? "Na načítanie menu otvorte stránku cez lokálny webový server."
      : error instanceof TypeError
        ? "Zdroj menu sa nepodarilo načítať. Skontrolujte jeho dostupnosť."
        : error.message;
  } finally {
    restaurant.loading = false;
    renderMenu();
  }
}

// Load all restaurants
async function loadMenus(forceRefresh = false) {
  if (isLoading) {
    return;
  }

  isLoading = true;
  notice = "";
  refreshButton.disabled = true;
  clearButton.disabled = true;
  menuList.setAttribute("aria-busy", "true");

  for (const restaurant of RESTAURANTS) {
    restaurant.loading = true;
    restaurant.error = "";
  }

  renderMenu();
  await Promise.allSettled(RESTAURANTS.map(restaurant => loadRestaurant(restaurant, forceRefresh))); 

  isLoading = false;
  refreshButton.disabled = false;
  clearButton.disabled = false;
  menuList.setAttribute("aria-busy", "false");
  renderMenu();
}

function formatPrice(price) {
  return Number.isFinite(price)
    ? `${price.toFixed(2).replace(".", ",")} €`
    : "Cena neuvedená";
}

// Build a meal item
function createMealItem(meal) {
  const item = document.createElement("li");
  item.className = "meal-item";

  if (!meal.type.toLowerCase().startsWith("polievka")) {
    item.classList.add("meal-item-main");
  }

  if (meal.image) {
    const image = document.createElement("img");
    image.className = "meal-image";
    image.src = meal.image;
    image.alt = meal.name;
    image.width = 84;
    image.height = 84;
    image.loading = "lazy";

    image.addEventListener("error", () => {
      image.remove();
      item.classList.remove("meal-item-with-image");
    });

    item.classList.add("meal-item-with-image");
    item.appendChild(image);
  }

  const details = document.createElement("div");

  const type = document.createElement("p");
  type.className = "meal-type";
  type.textContent = meal.type;

  const name = document.createElement("p");
  name.className = "meal-name";
  name.textContent = meal.name;
  details.append(type, name);

  if (meal.weight) {
    const weight = document.createElement("p");
    weight.className = "meal-weight";
    weight.textContent = `Porcia: ${meal.weight}`;
    details.appendChild(weight);
  }

  if (meal.allergens.length > 0) {
    const allergens = document.createElement("p");
    allergens.className = "meal-allergens";
    allergens.textContent = `Alergény: ${meal.allergens.join(", ")}`;
    details.appendChild(allergens);
  }

  const price = document.createElement("strong");
  price.className = "meal-price";
  price.textContent = formatPrice(meal.price);

  if (Number.isFinite(meal.discountPrice)) {
    price.textContent += ` / ${formatPrice(meal.discountPrice)}`;
  }

  item.append(details, price);
  return item;
}

// Build a restaurant card
function createRestaurantCard(restaurant, number) {
  const column = document.createElement("div");
  column.className = "col-12";

  const card = document.createElement("article");
  card.className = "card";
  card.setAttribute("aria-busy", String(restaurant.loading));

  const body = document.createElement("div");
  body.className = "card-body";

  const header = document.createElement("header");

  const label = document.createElement("span");
  label.textContent = String(number).padStart(2, "0");

  const title = document.createElement("h3");
  const source = document.createElement("a");
  source.href = restaurant.url;
  source.textContent = restaurant.name;
  title.appendChild(source);
  header.append(label, title);
  body.appendChild(header);

  const sourceNote = document.createElement("p");
  sourceNote.className = "restaurant-info";
  sourceNote.textContent = restaurant.menu.some(meal => Number.isFinite(meal.discountPrice))
    ? "Zdroj: uložená stránka. Ceny: bežná / s dotáciou ISIC."
    : "Zdroj: uložená stránka.";
  body.appendChild(sourceNote);

  if (restaurant.updatedAt) {
    const updated = document.createElement("p");
    updated.className = "restaurant-info";
    updated.append("Posledné načítanie: ");
    const time = document.createElement("time");
    time.dateTime = restaurant.updatedAt;
    time.textContent = new Date(restaurant.updatedAt).toLocaleString("sk-SK");
    updated.appendChild(time);
    body.appendChild(updated);
  }

  if (restaurant.loading) {
    const loading = document.createElement("p");
    loading.className = "restaurant-info";
    loading.textContent = "Načítavam menu…";
    body.appendChild(loading);
  }

  if (restaurant.error) {
    const error = document.createElement("p");
    error.className = "restaurant-error";
    error.textContent = restaurant.error;
    body.appendChild(error);
  }

  if (restaurant.menu.length > 0 || (!restaurant.loading && !restaurant.error)) {
    for (let index = 0; index < DAYS.length; index++) {
      const day = index + 1;

      if (selectedDay !== "all" && selectedDay !== String(day)) {
        continue;
      }

      const meals = restaurant.menu.filter(meal => meal.day === day);
      const date = meals.find(meal => meal.date)?.date;

      if (selectedDay === "all" || date) {
        const dayHeading = document.createElement("h4");
        dayHeading.className = "day-heading";
        dayHeading.textContent = DAYS[index];

        if (date) {
          const time = document.createElement("time");
          time.dateTime = date;
          time.textContent = new Date(`${date}T12:00:00`).toLocaleDateString("sk-SK");
          dayHeading.append(" · ", time);
        }

        body.appendChild(dayHeading);
      }

      const list = document.createElement("ul");

      for (const meal of meals) {
        list.appendChild(createMealItem(meal));
      }

      if (list.childElementCount === 0) {
        const message = document.createElement("p");
        message.className = "empty-menu";
        message.textContent = "Menu na tento deň nie je k dispozícii.";
        body.appendChild(message);
      } else {
        body.appendChild(list);
      }
    }
  }

  card.appendChild(body);
  column.appendChild(card);
  return column;
}

// Update the menu view
function renderMenu() {
  menuList.replaceChildren();
  const fragment = document.createDocumentFragment();
  let visibleCount = 0;

  for (let index = 0; index < RESTAURANTS.length; index++) {
    const restaurant = RESTAURANTS[index];
    const checkbox = document.getElementById(`filter-${restaurant.id}`);

    if (checkbox.checked) {
      fragment.appendChild(createRestaurantCard(restaurant, index + 1));
      visibleCount++;
    }
  }

  menuList.appendChild(fragment);
  menuHeading.textContent = selectedDay === "all"
    ? "Menu na celý týždeň"
    : `Menu · ${DAYS[Number(selectedDay) - 1]}`;

  statusText.textContent = visibleCount === 0
    ? "Vyberte aspoň jednu prevádzku vo filtri vyššie."
    : isLoading
      ? "Načítavam menu…"
      : notice || `Zobrazené prevádzky: ${visibleCount}.`;

  for (const button of dayButtons) {
    button.setAttribute("aria-pressed", String(button.dataset.day === selectedDay)); 
  }
}

// Day selection
for (const button of dayButtons) {
  button.addEventListener("click", () => {
    selectedDay = button.dataset.day;
    renderMenu();
  });
}

// Restaurant filters
for (const checkbox of restaurantFilters) {
  checkbox.addEventListener("change", renderMenu); 
}

// Refresh and clear saved data
refreshButton.addEventListener("click", () => loadMenus(true));

clearButton.addEventListener("click", () => {
  try {
    for (const restaurant of RESTAURANTS) {
      localStorage.removeItem(STORAGE_PREFIX + restaurant.id);
    }
    notice = "Uložené dáta sú vymazané.";
  } catch {
    notice = "Uložené dáta sa nepodarilo vymazať.";
  }
  renderMenu();
});

// Close navigation and focus the section
const navigation = document.getElementById("main-navigation");

for (const link of navigation.querySelectorAll("a")) {
  link.addEventListener("click", () => {
    const section = document.querySelector(link.hash);

    navigation.addEventListener("hidden.bs.offcanvas", () => {
      section.focus({ preventScroll: true });
      section.scrollIntoView();
    }, { once: true });

    bootstrap.Offcanvas.getOrCreateInstance(navigation).hide();
  });
}

loadMenus();
