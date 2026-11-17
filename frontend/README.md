# InternshipJunction frontend

This folder contains the React 19 and TypeScript single-page application. Vite serves it during development and builds production assets into frontend/dist.

For the project purpose, full architecture, setup, and backend requirements, see the repository root README.

Run these commands from the repository root:

~~~bash
npm run dev:frontend
npm run build
npm run lint
~~~

The development server defaults to http://localhost:5173. API calls use /api and are proxied to the backend on port 5000 when it is running.
