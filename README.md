# Hex Search

Hex Search is a static HTML/CSS/JavaScript frontend with a small Express API that fetches search results.

## Deploy on Render (frontend + API)

1. Open [Render](https://render.com/) and create a **Blueprint** from this repository.
2. Render reads `render.yaml`, installs dependencies, and starts the Express server.
3. The service serves the frontend and `/api/search` from the same origin.

The app listens on Render's `PORT` environment variable.

## Deploy on GitHub Pages (static frontend)

GitHub Pages cannot run the Express API. To keep search working, deploy the API on Render first, then:

1. Edit `config.js` and set `window.HEX_SEARCH_API_BASE` to your Render service's HTTPS URL (no trailing slash).
2. Commit the change.
3. In GitHub, open **Settings → Pages** and select **GitHub Actions** as the build and deployment source. The included workflow publishes the repository's static files.

Example: `window.HEX_SEARCH_API_BASE = "https://your-service.onrender.com";`

If the API base is left empty, the frontend calls `/api/search` on its own origin, which is correct for Render but not enough for GitHub Pages.

## Local development

```sh
npm install
npm start
``

Then open http://localhost:10000.
