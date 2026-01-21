# Run Islam AI (Windows / VS Code)

## 1) Open in VS Code
Unzip the folder, then open the **islam-ai** folder in VS Code.

## 2) Install dependencies
Open VS Code Terminal (PowerShell) and run:

```powershell
npm install
```

## 3) Start the dev server
```powershell
npm run dev
```

Open:
- http://localhost:3000

## Deploy to Netlify
See **NETLIFY_DEPLOY.md**.

## If you ever see "next is not recognized"
That means `npm install` didn’t finish or `node_modules` is missing. Run:

```powershell
npm install
```
