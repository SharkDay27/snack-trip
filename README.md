# 點心旅行
A Traditional Chinese, mobile-first match-three game with 100 deterministic level configurations, eight board silhouettes, ice and crate obstacles, procedural Web Audio effects, animated swaps and cascades, three free boosters, hints and local progress.

Static entry: dist/index.html. No build step or runtime dependency. Serve dist with any static host.

Run `node test.cjs` to simulate 500 games across all 100 levels and check board, refill, obstacle and victory invariants. Browser and physical-device QA have not been run in the creation environment.

Art: image-generated six-food icon atlas based on the user's flat circular icon reference. Prompt: six matte colored circular badges with minimal food pictograms, no outlines, arranged in a 3x2 atlas. Asset: dist/foods.webp.

Progress is local to the browser. Audio starts after a user gesture. No accounts, ads, purchases or analytics.

Update v2: fixed corner close controls on all dialogs, keyboard dismissal/focus containment, four goal configurations, progressive patterned ice/crate/jelly obstacles with layered coverage. Run `node obstacles-test.cjs` for focused goal and obstacle checks.

Update v3: chain-dependent visual effects with five tiers (1, 2–3, 4–5, 6–7, 8+), expanding rings, confetti and radial celebrations. Effects are capped at 80 particles, old layers are replaced, and reduced-motion preferences disable particles. Pure presentation changes do not change scoring or move counts.
