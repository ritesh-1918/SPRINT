# ClimaSpace

A Next.js application for weather visualization and AI travel assistance.

This project is built with:
- Next.js (App Router)
- React
- TypeScript
- ShadCN UI components
- Tailwind CSS
- Genkit (for AI features)

## Getting Started

To get this project running locally:

1.  **Clone the repository (if you haven't already):**
    ```bash
    git clone https://github.com/ritesh-1918/ClimaSpace.git
    cd ClimaSpace
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