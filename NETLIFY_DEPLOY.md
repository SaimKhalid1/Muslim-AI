# Deploy to Netlify (ZIP / Manual)

## Option 1 (recommended): Drag-and-drop the `out` folder

1) In this folder, install + build:

```powershell
npm install
npm run build
```

2) After build, you will see a new folder: `out/`

3) Netlify:
- Sites → Add new site → **Deploy manually**
- Drag the **`out` folder** into the upload area

That’s it.

## Option 2: Git deploy (auto-build)

1) Upload this repo to GitHub.
2) Netlify → Add new site → Import from Git.

This repo includes `netlify.toml`, so Netlify will:
- run the build
- publish the `out` folder
