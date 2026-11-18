# Browser QA

The Playwright harness `browser_qa.py` opens the static game in desktop Chromium at 1280x720 with SwiftShader. It checks that New Game renders the active mission, sends normal walking and sprint input, exercises interaction/fire/reload/damage/wanted controls, completes three story jobs by moving the player to their live objective coordinates and pressing E, starts the courier route, purchases an engine tune in the garage, pauses, saves, reloads and continues, and invokes the death/recovery path. It captures four JPEG frames at the end.

The harness does not establish production-grade combat AI, physical collision, full map traversal balance, or all eight jobs' narrative quality. Its QA waypoint and activity setup place the player at real mission/activity locations; the mission, reward, save and UI handlers remain the game systems. Pursuit escape currently uses a timed break in line of sight rather than geometry-based visibility, and a helicopter is not yet rendered. Any failed browser checks or gate rows are recorded in the build session rather than claimed as passes.

The harness calls `window.setCapturePreset(name)` with `cover`, `onfoot`, `harbour` and `cityrecord`. Each preset advances two fixed simulation ticks before holding for capture. Every required mesh is projected from all eight world-bounds corners; checks fail if it is hidden, behind the camera or outside NDC [-1, 1] on any axis. The broad sea, quay and promenade use explicit surface patches, while boats, containers, people and vehicles use full mesh bounds. Additional assertions cover the car's 10% margin, police lamp emissive state, distances, HUD values, minimap job marker, and unchanged measurements while held. This establishes frustum inclusion, not pixel-level visibility or occlusion.

Latest successful capture measurements:

| Frame | Selected measured NDC x / y bounds | Additional evidence |
| --- | --- | --- |
| 01 cover | Player car [-0.2368, 0.2368] / [-0.5731, 0.1576] | 10 traffic vehicles and 16 pedestrians fully inside; seated driver; camera 7 m behind, 2.9 m above car, 12° down; lit cruisers at 12.37 m and 20.22 m; health/armour 60/40, ammo 11/48, wanted 3, cash $650 |
| 02 on foot | Player [0.0301, 0.2172] / [-0.6504, -0.1820]; muzzle flash [0.0304, 0.0934] / [-0.3727, -0.2584] | Three pedestrians at 8/14/20 m, parked car at 10.30 m, lit cruiser at 25 m; health/armour 60/40, ammo 11/48, wanted 2; normal fire handler invoked |
| 03 harbour | Sea patch [-0.4920, -0.0088] / [-0.1744, -0.0647]; quay patch [-0.0802, 0.0401] / [-0.2336, -0.0511]; promenade patch [-0.0440, 0.1818] / [-0.3045, -0.0708]; job marker [0.3886, 0.4588] / [-0.0566, 0.0566] | Three boats, six pedestrians, three quay vehicles and two containers fully inside; job marker also within minimap bounds at (103, 47) |
| 04 record | Modal [-0.4844, 0.4844] / [-0.8375, 0.8375]; title [-0.4391, 0.4391] / [0.6799, 0.7736] | CITY RECORD presentation retained |

All four images are JPEG, 1280×720, below 256 KiB, with zero clipped HUD elements. The full gameplay harness completed with zero page errors. Detailed per-element x/y/z measurements are recorded in `.makefun/capture-measurements.json`. Run `python -u browser_qa.py` against the game served at `http://127.0.0.2:8085/` (8083 was occupied) to reproduce the checks and captures.
