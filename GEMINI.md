This is an Angular project that displays real-time MTA subway departure information.

### Project Overview

The project is an Angular application designed to display real-time subway departure information from the MTA. It uses a Cloudflare Worker as a proxy to fetch data from the MTA's GTFS-RT feed. This is necessary because the MTA API requires a `User-Agent` header, which cannot be set by client-side JavaScript in the browser.

The application has the following features:
- An `mta-data` service for fetching real-time data.
- A `departure-board` component to display the data.
- A proxy configuration to communicate with the MTA API during local development.
- The application is configured to fetch data from the MTA's real-time feed and log it to the console.

### Building and Running

**Development server**

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

**Building**

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

**Running unit tests**

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

### Deployment

The application is deployed to Cloudflare, with separate environments for `staging` and `production`. The deployment process involves two main steps: deploying the proxy worker and deploying the frontend application.

**1. Deploy the Cloudflare Worker**

The proxy worker must be deployed to the desired environment.

-   **Staging:**
    ```bash
    npx wrangler deploy --env staging -C mta-proxy-worker/wrangler.toml
    ```
-   **Production:**
    ```bash
    npx wrangler deploy --env production -C mta-proxy-worker/wrangler.toml
    ```

**2. Deploy the Angular Application**

First, build the application for the target environment:

-   **Staging:**
    ```bash
    npm run build:staging
    ```
-   **Production:**
    ```bash
    npm run build:production
    ```

Next, deploy the build output to Cloudflare Pages. The output is located in the `dist/mta-departure-board/browser` directory.

-   **Staging:**
    ```bash
    npx wrangler pages deploy dist/mta-departure-board/browser --project-name mta-departure-board-staging
    ```
-   **Production:**
    ```bash
    npx wrangler pages deploy dist/mta-departure-board/browser --project-name mta-departure-board-production
    ```

### Development Conventions

The project uses Prettier for code formatting. The configuration is in `package.json`.

The project uses a `prebuild` script to generate `src/assets/stations.json` from `src/assets/stops.txt`. This script is run automatically before the `build` script.

The project uses a proxy for local development to communicate with the MTA API. The proxy configuration is in `proxy.conf.json`.

The project has separate build configurations for `development`, `staging`, and `production`. These configurations are defined in `angular.json`. The `staging` and `production` configurations use file replacements for the environment files.
