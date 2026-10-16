const RESTAURANTS = [
  {
    id: "jedalen",
    name: "Jedáleň",
    menu: [
      { day: 1, type: "Polievka", name: "Zeleninová polievka", price: 1.80 },
      { day: 1, type: "Hlavné jedlo", name: "Kurací rezeň so zemiakovou kašou", price: 6.20 },
      { day: 2, type: "Polievka", name: "Hrachová polievka", price: 1.80 },
      { day: 2, type: "Hlavné jedlo", name: "Bravčové na šťave s ryžou", price: 6.40 },
      { day: 3, type: "Polievka", name: "Paradajková polievka", price: 1.90 },
      { day: 3, type: "Hlavné jedlo", name: "Pečené kuracie stehno s ryžou", price: 6.30 },
      { day: 4, type: "Polievka", name: "Šošovicová polievka", price: 1.80 },
      { day: 4, type: "Hlavné jedlo", name: "Zeleninové rizoto so syrom", price: 5.80 },
      { day: 5, type: "Polievka", name: "Kurací vývar s rezancami", price: 1.90 },
      { day: 5, type: "Hlavné jedlo", name: "Vyprážaný syr so zemiakmi", price: 6.10 },
    ],
  },
  {
    id: "bistro",
    name: "Bistro",
    menu: [
      { day: 1, type: "Polievka", name: "Tekvicová krémová polievka", price: 2.20 },
      { day: 1, type: "Hlavné jedlo", name: "Cestoviny s paradajkovou omáčkou", price: 6.90 },
      { day: 2, type: "Polievka", name: "Brokolicová polievka", price: 2.20 },
      { day: 2, type: "Hlavné jedlo", name: "Kurací šalát s pečivom", price: 7.20 },
      { day: 3, type: "Polievka", name: "Mrkvová polievka so zázvorom", price: 2.30 },
      { day: 3, type: "Hlavné jedlo", name: "Špenátové cestoviny", price: 6.80 },
      { day: 4, type: "Polievka", name: "Hrášková krémová polievka", price: 2.20 },
      { day: 4, type: "Hlavné jedlo", name: "Grilovaný hermelín so šalátom", price: 7.10 },
      { day: 5, type: "Polievka", name: "Zemiaková polievka", price: 2.10 },
      { day: 5, type: "Hlavné jedlo", name: "Pečená zelenina s kuskusom", price: 6.60 },
    ],
  },
  {
    id: "bufet",
    name: "Bufet",
    menu: [
      { day: 1, type: "Polievka", name: "Fazuľová polievka", price: 1.70 },
      { day: 1, type: "Hlavné jedlo", name: "Zapekané zemiaky so zeleninou", price: 5.40 },
      { day: 2, type: "Polievka", name: "Cesnaková polievka", price: 1.60 },
      { day: 2, type: "Hlavné jedlo", name: "Zeleninové placky so šalátom", price: 5.20 },
      { day: 3, type: "Polievka", name: "Karfiolová polievka", price: 1.70 },
      { day: 3, type: "Hlavné jedlo", name: "Francúzske zemiaky", price: 5.50 },
      { day: 4, type: "Polievka", name: "Zeleninový vývar", price: 1.60 },
      { day: 4, type: "Hlavné jedlo", name: "Šošovicový prívarok s vajcom", price: 5.10 },
      { day: 5, type: "Polievka", name: "Hustá paradajková polievka", price: 1.70 },
      { day: 5, type: "Hlavné jedlo", name: "Palacinky s tvarohom", price: 5.30 },
    ],
  },
];

const DAYS = ["Pondelok", "Utorok", "Streda", "Štvrtok", "Piatok"];
const menuList = document.getElementById("menu-list");
const menuHeading = document.getElementById("menu-heading");
const statusText = document.getElementById("menu-status");
const dayButtons = document.querySelectorAll(".day-button");
const restaurantFilters = document.querySelectorAll('input[name="restaurant"]');

const today = new Date().getDay();
let selectedDay = today >= 1 && today <= 5 ? String(today) : "1";

function createMealItem(meal) {
  const item = document.createElement("li");
  item.className = "meal-item";

  if (meal.type === "Hlavné jedlo") {
    item.classList.add("meal-item-main");
  }

  const details = document.createElement("div");
  details.className = "meal-details";

  const type = document.createElement("p");
  type.className = "meal-type";
  type.textContent = meal.type;

  const name = document.createElement("p");
  name.className = "meal-name";
  name.textContent = meal.name;

  const price = document.createElement("strong");
  price.className = "meal-price";
  price.textContent = `${meal.price.toFixed(2).replace(".", ",")} €`;

  details.append(type, name);
  item.append(details, price);
  return item;
}

function createRestaurantCard(restaurant, number) {
  const column = document.createElement("div");
  column.className = "col-md-6 col-lg-4";

  const card = document.createElement("article");
  card.className = "card menu-card";

  const body = document.createElement("div");
  body.className = "card-body";

  const header = document.createElement("div");
  header.className = "restaurant-heading";

  const label = document.createElement("span");
  label.className = "restaurant-number";
  label.textContent = `0${number}`;

  const title = document.createElement("h3");
  title.textContent = restaurant.name;
  header.append(label, title);
  body.appendChild(header);

  for (let index = 0; index < DAYS.length; index++) {
    const day = index + 1;

    if (selectedDay !== "all" && selectedDay !== String(day)) {
      continue;
    }

    if (selectedDay === "all") {
      const dayHeading = document.createElement("h4");
      dayHeading.className = "day-heading";
      dayHeading.textContent = DAYS[index];
      body.appendChild(dayHeading);
    }

    const list = document.createElement("ul");
    list.className = "meal-list";

    for (const meal of restaurant.menu) {
      if (meal.day === day) {
        list.appendChild(createMealItem(meal));
      }
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

  card.appendChild(body);
  column.appendChild(card);
  return column;
}

function renderMenu() {
  while (menuList.firstChild) {
    menuList.removeChild(menuList.firstChild);
  }

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
    : `Zobrazené prevádzky: ${visibleCount}.`;

  for (const button of dayButtons) {
    button.setAttribute("aria-pressed", String(button.dataset.day === selectedDay));
  }
}

for (const button of dayButtons) {
  button.addEventListener("click", () => {
    selectedDay = button.dataset.day;
    renderMenu();
  });
}

for (const checkbox of restaurantFilters) {
  checkbox.addEventListener("change", renderMenu);
}

renderMenu();


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
