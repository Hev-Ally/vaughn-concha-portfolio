# Client — Junior Graphic Designer

A responsive portfolio for graphic, digital, sportswear, and print design, with an interactive 3D model gallery. Visitors can select models from the gallery panel, then drag to rotate and scroll to zoom. The gallery currently has the basketball jersey plus a clearly labeled duplicate entry for testing the slide controls. Replace that test entry with a real model before publishing.

The Jersey Editorial section has three empty frames reserved for publication-style jersey photos or campaign images.

The selected-work panels are reserved for upcoming logo and branding mockups, jersey layouts, and sample graphics. They are placeholders, not finished project work. Canva proficiency is marked for confirmation; certification, training, and contact details can be added when available.

## Run locally

Open this folder with a local web server (for example, VS Code Live Server). The viewer loads Three.js from jsDelivr and reads models and textures from `assets/`, so it needs an internet connection and should be served over HTTP rather than opened directly as a `file://` URL.

## Add jersey editorial photos

1. Put the approved photos in `assets/editorial/`.
2. In `index.html`, find the `#jersey-gallery` section and replace each `.editorial-frame` placeholder `<div>` with an image, keeping its surrounding `<figure>` and caption. For example:

   ```html
   <img src="./assets/editorial/jersey-photo-01.jpg" alt="Describe the jersey and scene shown">
   ```

3. Use accurate alt text and only images approved for the portfolio.

## Add a model to the gallery

1. Copy the `.glb` model and its matching texture into `assets/`.
2. In `viewer.js`, add an entry to the `models` array. Use the existing basketball jersey entry as a template and set:
   - `name` and `type` for the gallery card.
   - `modelUrl` and `textureUrl` for the files in `assets/`.
   - `project`, `format`, `design`, and `artist` for the details below the viewer.
   - `credit` with the model's author, attribution link, license, and original model link.
3. Keep the creator's attribution and license accurate for each model.

The gallery cards, previous/next controls, model counter, loading state, and model details are generated from the `models` array. The existing 3D model is a sample. Replace the artwork placeholders and add confirmed contact details before publishing.
