# Afritan Leather Website

A pre-built static website for Afritan Leather, a handcrafted leather goods business based in Bujumbura, Burundi.

## Project Overview

This is a compiled React + Vite + Tailwind CSS + Framer Motion website served as static files. There is no source code — only the production build output is present in the repository.

## Tech Stack

- **Frontend:** React (compiled/minified)
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Build Tool:** Vite (output only)
- **Static Server:** `serve` (npx serve)

## Project Structure

All files are in the root directory (this is the dist/build output):

- `index.html` — Entry point with SEO metadata and JSON-LD structured data
- `index-*.js` — Compiled React application bundles
- `index-*.css` — Compiled Tailwind CSS styles
- `assets/` — Additional compiled assets
- `*.png / *.jpg` — Product and hero images
- `_redirects` — SPA routing redirect rule (`/* /index.html 200`)
- `favicon.svg` — Site favicon

## Running the App

The app is served as a static site on port 5000 using `npx serve . -p 5000 -s`.

**Workflow:** `Start application` — runs `npx serve . -p 5000 -s`

## Deployment

Configured as a **static** deployment with `publicDir: "."`.
