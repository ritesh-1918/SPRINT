# SPRINT

SPRINT is a modern weather application built with Next.js, designed to provide real-time weather information and forecasts. It leverages the power of Gemini API for enhanced data processing and a sleek user interface for an intuitive experience.

## Features

- **Real-time Weather Data**: Get up-to-the-minute weather conditions for any location.
- **7-Day Forecast**: Plan your week with detailed weather predictions.
- **Interactive Map**: Visualize weather patterns and conditions globally.
- **User-Friendly Interface**: A clean and responsive design for easy navigation.
- **Gemini API Integration**: Utilizes advanced AI capabilities for accurate and insightful weather analysis.

## Getting Started

Follow these steps to set up and run SPRINT locally:

### Prerequisites

Make sure you have the following installed:

- Node.js (LTS version recommended)
- npm or Yarn
- Git

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/ritesh-1918/SPRINT.git
   cd SPRINT
   ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```
    Or if you use yarn:
    ```bash
    yarn install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project and add any necessary API keys (like `GEMINI_API_KEY`, `NEXT_PUBLIC_OPENCAGE_API_KEY`, `NEXT_PUBLIC_OPENWEATHERMAP_API_KEY`).
    Example `.env` structure:
    ```
    GEMINI_API_KEY=your_gemini_api_key
    NEXT_PUBLIC_OPENCAGE_API_KEY=your_opencage_api_key
    NEXT_PUBLIC_OPENWEATHERMAP_API_KEY=your_openweathermap_api_key
    NEXT_PUBLIC_GEOAPIFY_API_KEY=your_geoapify_api_key
        ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

Open [http://localhost:9002](http://localhost:9002) (or the port specified in your `dev` script) with your browser to see the result.

## Genkit Development

To run Genkit flows locally for development (e.g., for testing AI features):
```bash
npm run genkit:dev
```
Or to watch for changes:
```bash
npm run genkit:watch
```

This project was bootstrapped with assistance from Firebase Studio.