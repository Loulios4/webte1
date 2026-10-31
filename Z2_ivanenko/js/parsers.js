const DAYS = ["Pondelok", "Utorok", "Streda", "Štvrtok", "Piatok", "Sobota", "Nedeľa"];

// Shared text and price helpers
function cleanText(text) {
  return text.replace(/\s+/g, " ").trim();
}

function textOf(element, selector) {
  return cleanText(element.querySelector(selector)?.textContent ?? "");
}

function parsePrice(text) {
  const price = parseFloat(text.replace(/\s+/g, "").replace(",", "."));
  return Number.isFinite(price) && price >= 0 ? price : null;
}

// Eat & Meet menu
function parseEatAndMeet(doc) {
  const menu = [];

  for (let day = 1; day <= 7; day++) {
    const section = doc.getElementById(`day-${day}`);

    if (!section) {
      continue;
    }

    for (const item of section.querySelectorAll(".menu-body")) {
      const description = item.querySelector(".desc");
      const label = textOf(item, ".menu-title h4");

      if (!description || !label) {
        continue;
      }

      const allergensText = textOf(description, "span");
      const allergens = (allergensText.match(/\d+/g) ?? []).map(Number);
      const nameElement = description.cloneNode(true);

      for (const span of nameElement.querySelectorAll("span")) {
        span.remove();
      }

      const name = cleanText(nameElement.textContent);
      const prices = textOf(item, ".price").split("/");
      const imageUrl = item.querySelector(".menu-thumbnail img")?.getAttribute("src") ?? "";

      if (!name) {
        continue;
      }

      menu.push({
        day,
        date: "",
        weight: "",
        type: label.replace(/^MENU\s*/i, "Hlavné jedlo "),
        name,
        price: parsePrice(prices[0]),
        discountPrice: prices.length > 1 ? parsePrice(prices[1]) : null,
        allergens,
        image: imageUrl
      });
    }
  }

  return menu;
}

// Separate name, portion and allergens
function parseMealDetails(text) {
  let name = cleanText(text);
  const allergensMatch = name.match(/A:\s*([\d,\s]*)|\/(\d+(?:\s*,\s*\d+)*)\//i);
  const allergens = allergensMatch
    ? ((allergensMatch[1] ?? allergensMatch[2]).match(/\d+/g) ?? []).map(Number)
    : [];

  if (allergensMatch) {
    name = name.replace(allergensMatch[0], "");
  }

  const weightMatch = name.match(/\d+(?:[.,]\d+)?\s*(?:kg|ml|g|l)\b(?:\s*[,/]\s*\d+(?:[.,]\d+)?\s*(?:kg|ml|g|l)\b)*/i);
  const weight = weightMatch
    ? cleanText(weightMatch[0]).replace(/(\d)\s*(kg|ml|g|l)\b/gi, "$1 $2")
    : "";

  if (weightMatch) {
    name = name.replace(weightMatch[0], "");
  }

  name = cleanText(name.replace(/^[\s.,;/]+|[\s,;/]+$/g, ""));
  return { name, weight, allergens };
}

// FIIT FOOD menu
function parseFiitFood(doc) {
  const menu = [];
  const section = doc.getElementById("fiit-food");

  if (!section) {
    return menu;
  }

  for (const daySection of section.querySelectorAll(".daily-offer > li")) {
    const heading = textOf(daySection, ".day-title");
    const day = DAYS.findIndex(name => heading.toLowerCase().startsWith(name.toLowerCase())) + 1;
    const dateMatch = heading.match(/(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})/);
    const date = dateMatch
      ? `${dateMatch[3]}-${dateMatch[2].padStart(2, "0")}-${dateMatch[1].padStart(2, "0")}`
      : "";

    if (!day) {
      continue;
    }

    for (const item of daySection.querySelectorAll(".day-offer > li")) {
      const label = textOf(item, ".brand:not(.price)");
      const nameElement = item.cloneNode(true);

      for (const span of nameElement.querySelectorAll(".brand, .price")) {
        span.remove();
      }

      const details = parseMealDetails(nameElement.textContent);

      if (!details.name || !label) {
        continue;
      }

      menu.push({
        day,
        date,
        type: label.toLowerCase().startsWith("p") ? "Polievka" : `Hlavné jedlo ${label.replace(/\D/g, "")}`,
        name: details.name,
        weight: details.weight,
        price: parsePrice(textOf(item, ".price")),
        discountPrice: null,
        allergens: details.allergens,
        image: ""
      });
    }
  }

  return menu;
}

// DRAG menu
function parseDrag(doc) {
  const menu = [];
  const dayIds = ["pondelok", "utorok", "streda", "stvrtok", "piatok"];

  for (let index = 0; index < dayIds.length; index++) {
    const section = doc.getElementById(dayIds[index]);

    if (!section) {
      continue;
    }

    const items = [];
    // Read soup text between headings
    const soupHeading = section.querySelector(".menu_box_title h3");
    let soupText = "";

    if (soupHeading?.textContent.toLowerCase().includes("polievka")) {
      let node = soupHeading.parentElement.nextSibling;

      while (node) {
        if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains("menu_box_title")) {
          break;
        }
        soupText += node.textContent;
        node = node.nextSibling;
      }
    }

    if (cleanText(soupText)) {
      items.push({ type: "Polievka", text: soupText, price: null });
    }

    let number = 0;

    // Read main dishes from the table
    for (const row of section.querySelectorAll("table tr")) {
      const cells = row.querySelectorAll("td");
      const text = cells[0] ? cleanText(cells[0].textContent) : "";

      if (cells.length < 2 || !text) {
        continue;
      }

      number++;
      items.push({ type: `Hlavné jedlo ${number}`, text, price: parsePrice(cells[1].textContent) });
    }

    for (const item of items) {
      const details = parseMealDetails(item.text);

      if (!details.name) {
        continue;
      }

      menu.push({
        day: index + 1,
        date: "",
        type: item.type,
        name: details.name,
        weight: details.weight,
        price: item.price,
        discountPrice: null,
        allergens: details.allergens,
        image: ""
      });
    }
  }

  return menu;
}
