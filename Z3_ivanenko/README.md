# WEBTE1 – Zadanie 3: Môj TODO List

**Autor:** Denys Ivanenko

**Krúžok:** pondelok o 9:00

**Web na školskom serveri:** [Môj TODO List](https://webte1.fei.stuba.sk/~xivanenko/Z3_ivanenko/index.html)

Web slúži na správu osobných úloh. Po otvorení sa zo školského servera načíta zoznam pre login `xivanenko`. V hlavičke sa dá zadať aj iný študentský login. Úlohy sa dajú pridávať, upravovať, dokončiť, znova otvoriť alebo odstrániť. V zozname sa dajú vyhľadať podľa názvu, filtrovať podľa stavu a zoradiť podľa začiatku alebo konca. Kalendár zobrazuje tie isté úlohy podľa mesiaca, týždňa alebo dňa. Pri vybranom dni sa dá pridať nová úloha s predvyplneným dátumom.

## Zdroje

- Úlohy sa načítavajú a ukladajú cez Fetch API. [Dokumentácia školského REST API](https://wt1zadanie.iolab.sk/docs)
- Rozhranie používa React 19.3.1 a React DOM. Produkčnú verziu zostavuje Vite 8.3.8. [React](https://react.dev/) a [Vite](https://vite.dev/) používajú licenciu **MIT**.
- Kalendár aj výber dátumu vo formulári sú vlastné komponenty v Reacte. Pracujú s dátumami v miestnom čase pomocou objektu `Date`.
- Ikony pochádzajú z knižnice [Lucide](https://lucide.dev/). Licencie **ISC** a **MIT** sú priložené v súbore `lucide-license.txt` v produkčnej verzii.
- Písmo [Rubik](https://fonts.google.com/specimen/Rubik) sa načítava cez Google Fonts. Ikona stránky pochádza zo [SVG Repo](https://www.svgrepo.com/).

## Použitie AI

Nástroj OpenAI Codex som použil pri prepojení aplikácie so školským API, tvorbe kalendára a formulárov, úpravách CSS, testovaní a príprave tohto README.
