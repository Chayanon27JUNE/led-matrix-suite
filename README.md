# LED Matrix Suite

Interactive documentation for a volumetric 3D LED display built in TouchDesigner 2025
(`LEDMatrixSystem.toe`, 27JUNE STUDIO). Thai / English — switch from the top bar.

| Page | What it covers |
|------|----------------|
| `index.html` | Overview + entry point |
| `system.html` | **Volumetric slicing** — 12 ortho cameras slice the volume into layers → one texture → Art-Net. Live 3-panel demo of the whole pipeline. |
| `scale.html` | **Scaling & slice cameras** — automatic layer rig up to 248,832 pixels, `camRig` capture controls, the aspect trap that blanks the render with no error, measured performance. |
| `diagram.html` | **Install map** — the real 6×6 m build: 144 modules, universes, IPs, wiring and power (TH / EN / 中文). |

## Numbers

- LED volume: **72 × 72 × 48 = 248,832** pixels · 144 modules · 6 × 6 m
- Slice texture: 5,184 × 48 · 72 layers
- Render cost for all 248,832 instances at 4K: **0.09 ms/frame**
- Content cost: GLSL generator 0.67 ms · POP scene through 72 renderpasses 20.6 ms

## Structure

Static HTML, no build step and no dependencies. `assets/lmx.js` injects the shared nav and
swaps every text node through the Thai → English dictionary in `assets/i18n.js`; `<pre>`
blocks keep their original code. Canvas labels go through `LMX.t()`.

Built and inspected live through the ClaudeControl bridge (WebSocket 9981).
