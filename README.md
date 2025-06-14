# Radiocast Global Waves

Radiocast Global Waves is a web application that allows users to explore and listen to radio stations from around the world. It features an interactive 3D globe and a map view for discovering stations, along with search and filtering capabilities.

## Features

*   **Interactive 3D Globe:** Visualize radio stations on a 3D globe.
*   **Map View:** Explore stations on a 2D map.
*   **Station Search:** Search for stations by name, genre, or country.
*   **Filtering:** Filter stations by genre and mood.
*   **Player Controls:** Play, pause, and control the volume of the selected station.
*   **Favorites:** Save your favorite stations for quick access.
*   **Theme Toggle:** Switch between light and dark themes.
*   **Responsive Design:** Adapts to different screen sizes.

## Tech Stack

*   **Frontend:**
    *   React
    *   TypeScript
    *   Vite (Build Tool)
    *   Tailwind CSS (Styling)
    *   Shadcn/ui (UI Components)
    *   React Router (Routing)
    *   React Query (Data Fetching and Caching)
    *   React Three Fiber & Drei (3D Globe)
    *   MapLibre GL JS / MapTiler SDK (Map View)
    *   HLS.js (Audio Streaming)
    *   Axios (HTTP Client)
*   **Backend (Proxy Server):**
    *   Node.js
    *   Express
    *   CORS (for handling cross-origin requests)

## Project Structure

```
radiocast-global-waves/
├── public/                  # Static assets
├── src/
│   ├── components/          # React components (UI elements, Globe, Map, Player, etc.)
│   ├── contexts/            # React contexts (e.g., PlayerContext)
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility functions, API clients, type definitions
│   ├── pages/               # Top-level page components
│   ├── utils/               # General utility functions
│   ├── App.tsx              # Main application component
│   ├── main.tsx             # Entry point of the application
│   └── index.css            # Global styles
├── .gitignore
├── eslint.config.js         # ESLint configuration
├── package.json             # Project metadata and dependencies
├── postcss.config.js        # PostCSS configuration
├── tailwind.config.ts       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
└── vite.config.ts           # Vite configuration
```

## Getting Started

### Prerequisites

*   Node.js (v18 or later recommended)
*   npm or Bun (Bun is used in `bun.lockb`)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/radiocast-global-waves.git
    cd radiocast-global-waves
    ```
2.  Install dependencies:
    ```bash
    npm install
    # or if using bun
    # bun install
    ```

### Running the Development Server

To start the development server (frontend and proxy):

```bash
npm run dev
```

This will typically start the Vite development server on `http://localhost:8080` and the proxy server (defined in `server.js`) on `http://localhost:3001`.

The application will be accessible at `http://localhost:8080`.

### Building for Production

To build the application for production:

```bash
npm run build
```

This will create a `dist` folder with the optimized static assets.

## Available Scripts

*   `npm start`: Starts the production server (requires `server.js` to be configured for serving static files from `dist`).
*   `npm run dev`: Starts the Vite development server and the proxy server.
*   `npm run build`: Builds the application for production.
*   `npm run build:dev`: Builds the application in development mode.
*   `npm run lint`: Lints the codebase using ESLint.
*   `npm run preview`: Serves the production build locally for preview.

## Configuration

*   **Vite Configuration (`vite.config.ts`):** Configures the development server, build process, and aliases. Includes proxy settings for API requests.
*   **Tailwind CSS Configuration (`tailwind.config.ts`):** Defines the design tokens, themes, and custom styles.
*   **ESLint Configuration (`eslint.config.js`):** Defines linting rules for code quality and consistency.
*   **Proxy Server (`server.js`):** A simple Express server is used to proxy requests to the radio-browser API and potentially other external services to avoid CORS issues. The `vite.config.ts` proxies `/api` and `/proxy` requests to this server running on `http://localhost:3001`.

## Key Components and Logic

*   **`PlayerContext.tsx`:** Manages the global audio player state, including current station, playback status, volume, and favorite stations.
*   **`Globe.tsx` / `MapboxView.tsx`:** Handles the rendering and interaction with the 3D globe and 2D map, displaying station markers.
*   **`RadioBrowserExplorer.tsx`:** Fetches and displays station data from the RadioBrowser API.
*   **`radioBrowserApi.ts`:** Contains functions for interacting with the RadioBrowser API.
*   **UI Components (`src/components/ui`):** Leverages Shadcn/ui for a consistent and accessible component library.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an issue for any bugs or feature requests.

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## License

This project is licensed under the MIT License - see the `LICENSE` file for details (if one exists, otherwise assume MIT or specify).