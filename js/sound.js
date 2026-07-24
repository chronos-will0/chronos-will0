/* =========================================================================
   SOUND — tiny synthesized UI sounds (no audio files to host/download).
   Mimics the soft "click" of switching viewport shading modes in Blender.
   ========================================================================= */
(function () {
  let ctx = null;
  function getCtx() {
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      ctx = new AudioCtx();
    }
    return ctx;
  }

  function tone({ freq = 440, duration = 0.08, type = "sine", gain = 0.05, glideTo = null }) {
    try {
      const c = getCtx();
      if (c.state === "suspended") c.resume();
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, c.currentTime);
      if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, c.currentTime + duration);
      g.gain.setValueAtTime(gain, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration);
      osc.connect(g).connect(c.destination);
      osc.start();
      osc.stop(c.currentTime + duration + 0.02);
    } catch (e) { /* audio not available yet (needs a user gesture) */ }
  }

  window.SFX = {
    toggle: () => tone({ freq: 520, glideTo: 720, duration: 0.09, type: "triangle", gain: 0.05 }),
    click:  () => tone({ freq: 300, duration: 0.05, type: "square", gain: 0.03 }),
    hover:  () => tone({ freq: 900, duration: 0.03, type: "sine", gain: 0.015 }),
    open:   () => tone({ freq: 200, glideTo: 500, duration: 0.15, type: "sine", gain: 0.04 }),
  };
})();
