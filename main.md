# MTA Real-Time Departure Board

This project is a real-time departure board for the New York City subway system, built with Angular and Cloudflare Workers. It provides up-to-the-minute train arrival times for stations across the MTA network.

## Key Features

- **Real-Time Data**: Train arrival information is sourced directly from the MTA's GTFS-RT feed, ensuring data is always current.
- **System-Wide Coverage**: The application fetches data from all available MTA subway feeds, providing a comprehensive view of the entire system.
- **Modern UI**: The frontend is built with Angular and uses Signals for efficient, real-time state management, providing a responsive and fast user experience.
- **Scalable Architecture**: The use of a Cloudflare Worker to proxy MTA API requests ensures the application is scalable and reliable.

## Architecture

The application consists of two main components: an Angular frontend and a Cloudflare Worker for proxying API requests.

### Angular Frontend

The frontend is a single-page application built with Angular. It is responsible for:

- **Displaying Data**: Renders train arrival times, routes, and destinations in a user-friendly interface.
- **State Management**: Uses Angular Signals to manage application state, ensuring the UI is always in sync with the latest data.
- **Data Fetching**: Periodically fetches fresh data from the MTA API through the Cloudflare Worker.

### Cloudflare Worker

The Cloudflare Worker acts as a proxy between the Angular application and the MTA's GTFS-RT API. Its primary responsibilities are:

- **CORS Proxying**: Handles Cross-Origin Resource Sharing (CORS) to allow the frontend to communicate with the MTA API.
- **Header Injection**: Injects the required `User-Agent` header into API requests, which is necessary to access the MTA's real-time feed.

## Development Setup

To get started with the project, you will need to have Node.js and npm installed.

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/your-username/mta-departure-board.git
    cd mta-departure-board
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Run the Development Server**:
    ```bash
    ./node_modules/.bin/ng serve
    ```
    Navigate to `http://localhost:4200/` to see the application in action.

## Deployment

The application is designed to be deployed to Cloudflare Pages, with the proxy worker deployed to Cloudflare Workers.

### Deploying the Worker

The Cloudflare Worker is located in the `mta-proxy-worker` directory. To deploy it, run:

```bash
npx wrangler deploy mta-proxy-worker/index.js
```

### Deploying the Frontend

The Angular application can be deployed to Cloudflare Pages.

1.  **Build the Application**:
    ```bash
    ./node_modules/.bin/ng build
    ```

2.  **Deploy to Cloudflare Pages**:
    ```bash
    npx wrangler pages deploy dist/mta-departure-board/browser
    ```

    This command will deploy the compiled application to Cloudflare Pages, providing you with a publicly accessible URL.
