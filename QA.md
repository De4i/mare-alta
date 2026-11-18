# Browser QA

The Playwright harness `browser_qa.py` opens the static game in desktop Chromium at 1280x720 with SwiftShader. It checks that New Game renders the active mission, sends normal walking and sprint input, exercises interaction/fire/reload/damage/wanted controls, completes three story jobs by moving the player to their live objective coordinates and pressing E, starts the courier route, purchases an engine tune in the garage, pauses, saves, reloads and continues, and invokes the death/recovery path. It captures four JPEG frames at the end.

The harness does not establish production-grade combat AI, physical collision, full map traversal balance, or all eight jobs' narrative quality. Its QA waypoint and activity setup place the player at real mission/activity locations; the mission, reward, save and UI handlers remain the game systems. Pursuit escape currently uses a timed break in line of sight rather than geometry-based visibility, and a helicopter is not yet rendered. Any failed browser checks or gate rows are recorded in the build session rather than claimed as passes.

Capture staging uses live scene meshes and camera matrices, with a capture-only camera override. The harness prints assertions unbuffered and fails before taking a screenshot if a required check fails. It waits for the police lamps' timer-driven emissive intensity of 3, verifies the dark phase at 0, waits for the next lit phase, then pauses simulation to keep the measured phase through capture. Projected car bounds must fit within an 18 px margin of the 1280×720 viewport. Actor counts use world-space bounding boxes intersecting the camera frustum; they measure frustum inclusion, not pixel-level visibility or occlusion.

Latest successful capture measurements:

| Frame | Car bounds (left, top, right, bottom), px | Traffic / pedestrians in frustum | Additional evidence |
| --- | --- | --- | --- |
| 01 chase | 521.67, 371.04, 758.33, 581.31 | 30 / 40 | Driving; camera 7 m behind, 2.9 m high; four lit police units at 4.24, 7.00, 16.38 and 22.79 m |
| 02 foot | 681.92, 346.43, 861.42, 453.11 | 27 / 40 | Player and aiming weapon in frustum; nearby parked car; health 100, armour 75, ammo 18/144 |
| 03 harbour | 655.49, 440.38, 844.79, 688.10 | 30 / 40 | Water mesh and 3 boats in frustum; camera 6.627 m from quay; active job beacon bounds 861.82, 275.01, 896.00, 305.04 |
| 04 record | Same paused harbour scene | Same paused harbour scene | CITY RECORD title asserted |

All four images are JPEG, 1280×720, below 256 KiB, with zero clipped HUD elements. The full gameplay harness completed with zero page errors. Run `python -u browser_qa.py` against the game served at `http://127.0.0.2:8085/` to reproduce the checks and captures.
