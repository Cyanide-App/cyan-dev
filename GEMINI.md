# Project Overview

This project is a web-based game platform called "Cyanide." It allows users to play a variety of games directly in their browser. The platform is built using React and Vite, with a custom server for proxying game assets.

## Main Technologies

*   **Frontend:** React, React Router, Material-UI
*   **Build Tool:** Vite
*   **Backend:** Node.js with custom API proxies for fetching game assets.

## Architecture

The application is a single-page application (SPA) that uses React Router for navigation. The main components are:

*   `App.jsx`: The root component that sets up the router.
*   `GamesList.jsx`: Displays a list of available games from `games.json`.
*   `GamePage.jsx`: Renders the selected game in an iframe.
*   `GameLoader.jsx`: Generates the HTML for different game types (HTML, Flash, Emulator).
*   `api/`: Contains proxy scripts for fetching game assets from external sources.

# Building and Running

*   **Development:** `npm run dev`
*   **Build:** `npm run build`
*   **Lint:** `npm run lint`
*   **Preview:** `npm run preview`

# Development Conventions

*   The project uses functional components with hooks.
*   Styling is done with CSS files imported into the components.
*   The `games.json` file is the single source of truth for the list of games.
*   The `api` directory contains proxies for different game sources.

## Embedding

This website is intended to be embedded in an `about:blank` page. This may require addressing security policies like sandboxing and Content Security Policies (CSP) to ensure that the games function correctly.
