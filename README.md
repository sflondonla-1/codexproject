# Devspace

A responsive developer productivity dashboard with a persistent task list, focus and break timer, and sample weekly activity visualizations.

## Run

Requires Node.js 20 or newer. No dependencies or installation needed.

```sh
npm start
```

Open port 3000 in your development environment. Set `PORT` to change it.

Tasks and completed focus sessions are stored in your browser's local storage. Activity, headline metrics, profile, and timeline are illustrative sample data, not connected to GitHub. The timer tracks elapsed time while the page stays open, including background tabs. Reloading resets the active timer. Google Fonts is optional; system fonts are used when unavailable.

## Validate

```sh
npm test
```

## GitHub Pages

The dashboard is a static site. In GitHub, open **Settings → Pages**, choose **Deploy from a branch**, then select **main** and **/ (root)** and save. No build step is required.

The expected address after deployment is https://sflondonla-1.github.io/codexproject/.
