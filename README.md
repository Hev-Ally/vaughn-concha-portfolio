# Client — Junior Graphic Designer

A responsive junior graphic designer portfolio for graphic, digital, sportswear, and print design, with an interactive 3D model gallery. Visitors can select models from the gallery panel, then drag to rotate and scroll to zoom.

The selected-work section presents the packaging mockups in `assets/mockups/`. The jersey editorial section presents real-time basketball photography from `assets/rt pics/`. Canva proficiency is marked for confirmation; certification, training, and contact details can be added when available.

## Run locally

Open this folder with a local web server (for example, VS Code Live Server). The viewer loads Three.js from jsDelivr and reads models and textures from `assets/`, so it needs an internet connection and should be served over HTTP rather than opened directly as a `file://` URL.

## Jersey editorial photos

The `assets/rt pics/` folder contains the real-time basketball photography currently displayed in the Jersey Editorial section. Keep accurate, approved image descriptions in the existing `<img>` `alt` attributes.

## Add a model to the gallery

1. Copy the `.glb` model and its matching texture into `assets/`.
2. In `viewer.js`, add an entry to the `models` array. Use the existing basketball jersey entry as a template and set:
   - `name` and `type` for the gallery card.
   - `modelUrl` and `textureUrl` for the files in `assets/`.
   - `project`, `format`, `design`, and `artist` for the details below the viewer.
   - `credit` with the model's author, attribution link, license, and original model link.
3. Keep the creator's attribution and license accurate for each model.

The gallery cards, previous/next controls, model counter, loading state, and model details are generated from the `models` array. The existing 3D model is an included sample. Add confirmed contact details before publishing.
