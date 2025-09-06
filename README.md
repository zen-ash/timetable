# Campus Timetable Builder

An interactive web app for university students to build weekly schedules with drag-and-drop class blocks. The app automatically flags overlaps using a sweep-line interval algorithm and saves your schedule locally. Built with **vanilla HTML, CSS and JavaScript**, it showcases front-end fundamentals without any framework dependencies.

## Demo

Once this repository is published on GitHub Pages you can access it via:

https://<your-username>.github.io/timetable

Replace `<your-username>` with your GitHub handle. You can also clone or download this repository and simply open `index.html` in your browser.

## Features

- **Drag, resize and reposition** class blocks with intuitive mouse and keyboard controls
- Real-time **conflict detection** using a sweep-line algorithm (O(n log n))
- **Local save/load** of schedules via `localStorage`, including JSON import and export
- **Print-ready layout** that fits a weekly schedule on a single sheet
- **Accessible** keyboard controls, ARIA live announcements and high-contrast outlines
- **Theme toggle** (light/dark) for eye comfort

## Technology

This project uses **plain HTML, CSS and JavaScript**. All logic is contained in modular ES modules under `src/` and imported via `<script type="module">`. No frameworks or build tools are required.

## Running locally

No build step is needed. Clone or download the repository and open `index.html` in your browser. If you serve via a local web server (e.g. VS Code Live Server), the modules will load correctly.

## Accessibility & Performance

- Keyboard drag and drop fallback via pointer events with clear focus styles
- ARIA alerts for conflict warnings and focus management when dialogs open or close
- Lighthouse scores: **Performance 90+**, **Accessibility 95+** (may vary by dataset and hardware)

## Roadmap

The current implementation is a solid MVP. Possible future improvements include:

- [ ] `.ics` export so schedules can be imported into calendar apps
- [ ] Additional themes and customisation options
- [ ] Support for multiple saved schedules and easy switching between them

## License

This project is licensed under the [MIT License](LICENSE).

## Contributing

Contributions are welcome! Feel free to fork the repo and submit a pull request with improvements. Issues and feature requests are also appreciated.
