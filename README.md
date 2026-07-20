# afloppaguy portfolio

A static GitHub Pages portfolio.

## Pages

- `index.html` — short home page
- `work.html` — all projects
- `about.html` — background and commissions
- `project.html?id=PROJECT_ID` — project details

## Editing projects

All project text and media paths are stored in `data/projects.json`.

Covers support both images and MP4 files:

```json
"cover": {
  "type": "image",
  "src": "assets/projects/example/cover.png",
  "alt": "Description of the image"
}
```

For an MP4 cover, change `type` to `video` and point `src` at the MP4.

Project media is optional. Remove an item from the `media` array when it is not ready. Missing media is also removed automatically by the site instead of leaving an empty box.

## GitHub Pages

Publish the `main` branch from `/ (root)` in **Settings → Pages**.
