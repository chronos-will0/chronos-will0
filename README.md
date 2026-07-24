# 3D Art Portfolio

A dark, Blender-inspired portfolio site. Every project renders in a live,
orbitable 3D viewport with a **Material / Topology** shading toggle, just
like switching shading modes in Blender's viewport — plus an image/video
gallery, a view counter, and small UI sound effects.

Built with plain HTML/CSS/JS + Three.js (loaded from a CDN). No build
step, no npm install — it runs straight from static files, which is what
GitHub Pages needs.

## What's in here

```
index.html          the page
css/style.css        the whole theme (colors, layout, animation)
js/config.js          <-- the ONE file you edit to add your work
js/viewport.js        the 3D viewport engine (Three.js)
js/main.js            gallery, boot screen, lightbox, page glue
js/sound.js           tiny synthesized click sounds (no audio files needed)
js/counter.js         the view counter
assets/models/        put your .glb exports here
assets/images/        put your render images here
assets/videos/        put your video clips here
```

## 1. Preview it on your own computer

Browsers block ES module imports (which the viewport uses) when you just
double-click index.html, so run a tiny local server from this folder:

```bash
# Python (already on most machines)
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

## 2. Add your own 3D models

1. In Blender: **File → Export → glTF 2.0 (.glb/.gltf)**, format = **glTF
   Binary (.glb)**.
2. Drop the `.glb` file into `assets/models/`.
3. Open `js/config.js` and add an entry to the `MODELS` array:

```js
{
  id: "my-model",
  title: "Robot Head",
  description: "Hard-surface study, ~6k tris.",
  file: "assets/models/robot-head.glb",
},
```

That's it — a new viewport card appears automatically, with its own
Material/Topology toggle and live vertex/edge/face/triangle stats read
straight from the mesh.

If you leave `file` empty (or the file can't be found), the card falls
back to a placeholder shape instead of breaking, so it's safe to add an
entry before the export is ready.

**Stats note:** meshes are triangulated for the web, so "Faces" and
"Triangles" will match even if the model used quads in Blender (like the
hand study in your screenshot). "Edges" is a close estimate from Euler's
formula rather than a re-derived quad topology.

## 3. Add images and videos

Drop files into `assets/images/` or `assets/videos/`, then list them in
`js/config.js`:

```js
const GALLERY_IMAGES = [
  { src: "assets/images/render01.jpg", caption: "Studio render, 4k" },
];
const GALLERY_VIDEOS = [
  { src: "assets/videos/turntable.mp4", caption: "360 turntable" },
];
```

> **Why not a real upload button?** GitHub Pages only serves static
> files — there's no server behind it to receive an upload from a
> visitor. Editing `config.js` and pushing to GitHub *is* the "upload"
> step for a static site like this. If you outgrow this later, that's
> when you'd add a small backend (or a service like Cloudinary) — happy
> to help with that when you get there.

## 4. The view counter

Same static-hosting limitation applies here: a real "total visitors"
number needs somewhere to store the count. This site uses the free
[CounterAPI](https://counterapi.dev) service for that.

1. Sign up free at counterapi.dev and create a workspace.
2. Open `js/counter.js` and replace `WORKSPACE` with your workspace name.

If you skip this step (or the service is ever down), the counter still
works — it just falls back to counting views in that visitor's own
browser, labeled "(this browser)" so it's never presented as a fake
global number.

## 5. Customize text and colors

- Your name, role, tagline, email, and social links: top of `js/config.js`.
- About/contact copy: edit directly in `index.html`.
- Colors: all defined as CSS variables at the top of `css/style.css`
  under `:root` — change `--accent-orange` / `--accent-blue` etc. and
  the whole site updates.

## 6. Deploy to GitHub Pages

1. Create a new repository on GitHub (e.g. `your-username.github.io`, or
   any name).
2. Push this folder to it:
   ```bash
   git init
   git add .
   git commit -m "Portfolio site"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages → Source → Deploy from a branch**, pick
   `main` and `/ (root)`, then **Save**.
4. Your site goes live at `https://YOUR_USERNAME.github.io/YOUR_REPO/`
   (or `https://YOUR_USERNAME.github.io/` if you named the repo
   `your-username.github.io`) within a minute or two.

## Notes

- The hero HUD, boot sequence, and viewport toggle sounds are all
  generated in code — nothing to license or attribute.
- Reduced-motion is respected: visitors with that OS setting turned on
  get a near-static version of the page.
- Everything is a single set of static files, so there's nothing to
  keep running or paying for.
