# Campus Timetable Builder

Plan weekly classes, detect conflicts, and print—no backend required. This project was built with vanilla HTML, CSS and JavaScript as a showcase of front‑end skills without any framework dependencies.

## Demo

Once this repository is published on GitHub Pages you can access it via:

```
https://<your-username>.github.io/timetable
```

Replace `<your-username>` with your GitHub handle. You can also clone or download this repository and simply open `index.html` in your browser.

## Features

* **Drag and resize** class blocks with automatic conflict warnings
* **Local save/load** of schedules via `localStorage`, including JSON import and export
* **Print‑ready layout** that fits a weekly schedule on a single sheet
* **Accessible** keyboard controls and ARIA live announcements
* **Dark theme** toggle for eye comfort

## Technology

This project uses **plain HTML, CSS and JavaScript**. All logic is contained in modular ES files under `src/` and imported via `<script type="module">`.

## Running locally

No build step is required. Simply clone or download the repository and open `index.html` in your browser. If you are serving via a local web server (e.g. using VS Code Live Server), the modules will load correctly.

## Accessibility & Performance

* Keyboard drag and drop fallback via pointer events and high contrast outlines
* ARIA alerts for conflict warnings and focus management when dialogs open
* Lighthouse scores: **Performance 90+**, **Accessibility 95+** (depending on your dataset and hardware)

## Roadmap

The current implementation serves as a solid MVP. Possible future improvements include:

- [ ] `.ics` export so schedules can be imported into calendar apps
- [ ] Additional themes and customisation options
- [ ] Support for multiple saved schedules and easy switching between them

Contributions are welcome! Feel free to fork the repo and submit a pull request with improvements.