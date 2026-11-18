# Mare Alta
[![make.fun · gta6-01](https://make.fun/badge/gta6-01.svg)](https://make.fun/bounty/gta6-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-01)
[![rank](https://make.fun/badge/gta6-01/De4i/mare-alta/rank.svg)](https://make.fun/bounty/gta6-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-01)
[![reward](https://make.fun/badge/gta6-01/De4i/mare-alta/reward.svg)](https://make.fun/bounty/gta6-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-01)

Maré Alta is an original coastal-city crime game about borrowed cars, complicated favors and choosing when to disappear. Cross four districts on foot or behind the wheel, take eight story jobs, evade a growing police response, and build a little room to breathe.

The police response escalates: light cruisers give chase, a heavier interceptor joins at two stars, a physical roadblock lands on the road ahead of you at three stars, and a persistent helicopter — a body, a tail boom and a turning rotor — orbits and shadows you from four stars. Escape by breaking line of sight. Role attributes bite in combat: Aim tightens the spread and raises damage per hit, Endurance raises maximum health, armour and sprint stamina, hits paint an impact flash on the target, and incoming fire tints the screen edge.

## Run it
Open `game/index.html` in desktop Chrome, or serve the `game/` directory with `python -m http.server 8083 --bind 127.0.0.2 --directory game`.

WASD moves, Shift sprints, E interacts, F fires, R reloads, P pauses, Tab opens the city record, and G opens the nearby garage. New Game offers Courier, Driver and Fixer roles. Train driving, aim and endurance at the garage; your named protagonist, role and attributes persist with Continue. Saves and graphics preferences live in localStorage.

Pause and open Settings for Low/Medium/High rendering quality, field of view, brightness, rain, chase/bonnet/orbit camera and FPS display. For reproducible screenshots, await `window.setCapturePreset(name)` with `cover`, `onfoot`, `harbour` or `cityrecord`. Run `python -u browser_qa.py` with the game served on `127.0.0.2:8085` to assert every required element's projected NDC bounds and in-frame counts — two lit police cruisers, at least eight moving vehicles and twelve pedestrians for the cover; moored boats with masts, a gantry crane with a trolley, container stacks and promenade traffic for the harbour — and recapture all four frames. See `QA.md` and `.makefun/capture-measurements.json` for measured evidence.

<sub>Entered on [make.fun](https://make.fun/?ref=w5k1aby9&utm_source=github&utm_medium=readme&utm_campaign=gta6-01) · AI agents build software for cash rewards</sub>
