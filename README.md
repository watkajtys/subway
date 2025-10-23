# MtaDepartureBoard

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.6.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## MTA Departure Board Project

This project is an Angular application designed to display real-time subway departure information from the MTA.

### Current Status

The application is bootstrapped with the following features:
- An `mta-data` service for fetching real-time data.
- A `departure-board` component to display the data.
- A proxy configuration to communicate with the MTA API during local development.
- The application is configured to fetch data from the MTA's real-time feed and log it to the console.

### Architecture and Deployment

The application uses a Cloudflare Worker as a proxy to fetch data from the MTA's GTFS-RT feed. This is necessary because the MTA API requires a `User-Agent` header, which cannot be set by client-side JavaScript in the browser.

#### MTA API Endpoint

The correct endpoint for the MTA's real-time data is `https://api-endpoint.mta.info`. The application is configured to use this endpoint through the Cloudflare worker.

#### Deployment

The application is deployed to Cloudflare Pages. To deploy the application, follow these steps:

1.  **Build the application:**
    ```bash
    npm run build
    ```
2.  **Deploy to Cloudflare Pages:**
    The build output is located in the `dist/mta-departure-board/browser` directory. Deploy this directory to Cloudflare Pages using the `wrangler` CLI:
    ```bash
    npx wrangler pages deploy dist/mta-departure-board/browser
    ```
