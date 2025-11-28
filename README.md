<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1L5pyihIVBSfX_naOGK1crGpLseW_fOi-

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Create a `.env.local` based on `.env.example` and set the `VITE_GEMINI_API_KEY` in it to your Gemini API key (or `GEMINI_API_KEY` — Vite config maps both).
    Optionally set `VITE_API_URL` to your backend URL (defaults to `http://localhost:5000/api`). If running the backend on localhost, prefer `http://` (not `https://`) unless your backend is serving HTTPS.
   Also make sure the backend server is running (e.g., `node server.js` from the backend folder) and CORS is configured if needed. If the backend runs on HTTP (common in local dev), ensure `VITE_API_URL` uses `http://`.
3. Run the app:
   `npm run dev`
