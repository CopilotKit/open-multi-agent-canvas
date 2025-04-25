# Open Multi-Agent Canvas

Open Multi-Agent Canvas is an open-source multi-agent chat interface that leverages specialized agents to assist with travel planning, research, email drafting, and more. Built with Next.js, React, and CopilotKit, this project offers an interactive, unified experience by managing multiple agents within one dynamic conversation.

## Key Features

- **Multi-Agent Chat Interface:**
  Chat with a range of specialized agents:
  - **Travel Agent:** Plan trips, create itineraries, and view travel recommendations on an interactive map powered by Leaflet.
  - **Research Agent:** Conduct research with real-time logs and progress updates.
  - **MCP Agent:** A general-purpose agent capable of handling various tasks through configurable MCP servers.
  - **Knowledge Agent:** A specialized agent for visualizing, querying, and managing knowledge graphs.

- **Real-Time Interactivity:**
  Enjoy a live chat powered by `@copilotkit/react-ui` that orchestrates dynamic state changes and agent responses.

- **State Management & Agent Coordination:**
  Leverages `@copilotkit/react-core` for robust agent state management and smooth integration of travel and research functionalities.

- **Responsive & Modern UI:**
  Designed with Tailwind CSS to ensure your experience is smooth and adaptive across all devices.

## Technology Stack

- **Framework:** [Next.js](https://nextjs.org)
- **UI Library:** React, [CopilotKit UI](https://www.npmjs.com/package/@copilotkit/react-ui)
- **State Management:** [CopilotKit React Core](https://www.npmjs.com/package/@copilotkit/react-core)
- **Mapping:** [Leaflet](https://leafletjs.com) with [React Leaflet](https://react-leaflet.js.org)
- **Styling:** Tailwind CSS

## Setup Instructions

1. **Prerequisites:**
   - [Node.js](https://nodejs.org) (v18 or later)
   - [pnpm](https://pnpm.io/installation) (recommended package manager)
   - Backend server running (see main README.md for backend setup)

2. **Installation:**
   ```bash
   # Navigate to the frontend directory
   cd frontend

   # Install dependencies with pnpm
   pnpm install
   ```

3. **Environment Setup:**
   ```bash
   # Copy the example.env file to .env
   cp example.env .env

   # Edit .env to add your Copilot Cloud API key and set the backend URL
   # NEXT_PUBLIC_COPILOT_CLOUD_API_KEY=your_api_key_here
   # NEXT_PUBLIC_BACKEND_URL=http://localhost:8124
   ```

4. **Running the Development Server:**
   ```bash
   pnpm run dev
   ```
   Then, open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Verifying Backend Connection:**
   - The frontend will automatically check if the backend is running at startup
   - You can verify the connection status in the MCP Agent interface
   - If the backend is not running, you'll see a "Backend Disconnected" message

## Backend Integration

The frontend integrates with the backend through the following mechanisms:

1. **Environment Configuration**:
   - The `NEXT_PUBLIC_BACKEND_URL` environment variable specifies the backend URL (default: `http://localhost:8124`)

2. **Health Check**:
   - The MCP Agent component performs a health check to verify the backend is running
   - It calls the `/health` endpoint on the backend server

3. **Server-Sent Events (SSE)**:
   - The frontend uses SSE to communicate with the backend in real-time
   - This allows for streaming responses from the LLM through the backend

4. **MCP Configuration**:
   - The frontend allows configuring custom MCP servers through the MCP Servers panel
   - These configurations are stored in localStorage and passed to the backend when making requests

## Project Structure

- **/src/app:**
  Contains Next.js page components, layouts, and global styles.

- **/src/components:**
  Houses reusable components including agent interfaces (Travel, Research, MCP, Knowledge, Chat, Map, Sidebar) and UI elements.

- **/src/providers:**
  Wraps the global state providers responsible for managing agent states.

- **/src/lib:**
  Contains utility functions and configuration files (like available agents configuration and MCP server types).

- **/src/hooks:**
  Custom React hooks for state management and local storage.

## Value Proposition

Open Multi-Agent Canvas simplifies complex tasks by unifying multiple specialized agents in a single, interactive chat interface. Whether you're planning a trip with an interactive map, conducting in-depth research with real-time logs, connecting to MCP servers for specialized tasks, or visualizing knowledge graphs, this application streamlines your workflow and provides focused assistance tailored to each task—all within one platform.

## Deployment

The easiest way to deploy this project is with [Vercel](https://vercel.com). Build and start your application with:
```bash
pnpm run build
pnpm run start
```

Note that you'll need to deploy the backend separately and update the `NEXT_PUBLIC_BACKEND_URL` environment variable to point to your deployed backend.

## Contributing

Contributions are welcome! Fork the repository and submit a pull request with any improvements, bug fixes, or new features.

## License

Distributed under the MIT License. See `LICENSE` for more information.
