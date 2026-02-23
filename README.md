# MealPlan App Preview - Local Viewing Guide

This application preview is built using React and Babel Standalone. Because the app loads an external JSX file (`mealplan-app.jsx`), you **cannot** simply double-click `index.html` to open it in a browser. Browser security policies (CORS) will block it from loading local files.

To view the app correctly, you need to run a simple local web server. Below are a few quick ways to do this depending on what software you already have installed:

## Running the App Locally

If you have Node.js/npm installed on your machine:
1. Open your terminal or command prompt.
2. Navigate to this project folder.
3. Run the following command:
   ```bash
   npx serve .
   ```
   *(Alternatively, you can use `npx http-server`)*
4. Open your browser and go to the local address provided in the terminal (usually `http://localhost:3000` or `http://localhost:8080`).
