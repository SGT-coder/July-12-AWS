# AHRI Strategic Planning Workflow

This is a [Next.js](https://nextjs.org/) project for managing the strategic planning workflow at AHRI. It uses a local file (`db.json`) for data storage and [Genkit](https://firebase.google.com/docs/genkit) for AI features.

## Getting Started in VS Code

Follow these steps to get the project running on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or later recommended)
- [npm](https://www.npmjs.com/) (which comes with Node.js)

### 1. Install Dependencies

First, open a terminal in VS Code (**View** > **Terminal**) and run the following command to install all the necessary packages for the project:

```bash
npm install
```

### 2. Set Up Environment Variables

The application uses Google's AI services via Genkit, which requires an API key.

1.  Create a new file in the root of your project named `.env.local`.
2.  Add your Google AI API key to this file like so:

    ```
    GOOGLE_API_KEY=YOUR_API_KEY_HERE
    ```

    > **Note:** You can get a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey). The key is needed for the AI autocompletion feature. The rest of the app will work without it, but you may see errors in the terminal when Genkit tries to initialize.

### 3. Run the Development Server

Now, start the Next.js development server with the following command in your terminal:

```bash
npm run dev
```

This will start the application, typically on port 9002. You can view it by opening your browser and navigating to:

[http://localhost:9002](http://localhost:9002)

The application will automatically reload if you make any changes to the code. You're all set to start developing!
