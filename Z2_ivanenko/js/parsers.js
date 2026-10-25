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

      if (!name) {
        continue;
      }

      menu.push({
        day,
        type: label.replace(/^MENU\s*/i, "Hlavné jedlo "),
        name,
        price: parsePrice(prices[0]),
        discountPrice: prices.length > 1 ? parsePrice(prices[1]) : null,
        allergens
      });
    }
  }

  return menu;
}
