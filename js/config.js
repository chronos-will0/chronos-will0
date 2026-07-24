/* =========================================================================
   PORTFOLIO CONFIG
   -------------------------------------------------------------------------
   This is the only file you need to touch to add new work.
   Drop your files into the /assets folders, then add an entry below.
   ========================================================================= */

const SITE = {
  name: "Your Name",
  role: "3D Artist & Digital Sculptor",
  tagline: "Modeling, sculpting, and bringing meshes to life.",
  email: "you@example.com",
  socials: [
    { label: "ArtStation", url: "#" },
    { label: "Instagram", url: "#" },
    { label: "GitHub", url: "#" },
  ],
};

/* ---------------------------------------------------------------------
   3D MODELS
   Each entry gets its own viewport card with a Material / Topology
   toggle, orbit controls, and a live geometry stats readout.

   file:  path to a .glb / .gltf file exported from Blender
          (File > Export > glTF 2.0, format = glTF Binary (.glb))
   If you leave "file" empty, a placeholder demo mesh is shown instead,
   so the site still works before you add your own models.
--------------------------------------------------------------------- */
const MODELS = [
  {
    id: "hand-study",
    title: "Hand Study",
    description: "Topology practice piece — quad-based hand mesh built for rigging.",
    file: "assets/models/hand.glb", // <- put your exported file here
  },
  {
    id: "demo-model",
    title: "Demo Object",
    description: "Placeholder model. Replace this entry with your own work.",
    file: "", // empty on purpose -> falls back to a built-in demo mesh
  },
];

/* ---------------------------------------------------------------------
   IMAGE GALLERY
   Put files in assets/images/ and list them here.
--------------------------------------------------------------------- */
const GALLERY_IMAGES = [
  // { src: "assets/images/render01.jpg", caption: "Studio render, 4k" },
];

/* ---------------------------------------------------------------------
   VIDEO GALLERY
   Put files in assets/videos/ and list them here.
--------------------------------------------------------------------- */
const GALLERY_VIDEOS = [
  // { src: "assets/videos/turntable.mp4", caption: "360 turntable render" },
];
