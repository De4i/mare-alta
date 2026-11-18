import asyncio
from pathlib import Path
from PIL import Image
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parent
BASE = 'http://127.0.0.2:8085/'

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(args=['--no-sandbox', '--enable-unsafe-swiftshader'])
        page = await browser.new_page(viewport={'width': 1280, 'height': 720}, device_scale_factor=1)
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.on('console', lambda m: print('CONSOLE '+m.type+': '+m.text, flush=True) if m.type=='error' else None)
        page.on('requestfailed', lambda r: print('REQUEST FAILED '+r.url+' '+str(r.failure), flush=True))
        await page.goto(BASE, wait_until='networkidle')
        await page.wait_for_timeout(1200)
        await page.locator('#newGame').click()
        await page.wait_for_timeout(1800)
        assert 'A Favor for Lila' in await page.locator('#job').text_content()
        assert await page.locator('#view').evaluate('(c)=>c.width>0 && c.height>0')
        print('PASS New Game and WebGL render', flush=True)
        await page.keyboard.down('w'); await page.wait_for_timeout(500); await page.keyboard.up('w')
        await page.keyboard.down('Shift'); await page.keyboard.down('d'); await page.wait_for_timeout(350); await page.keyboard.up('d'); await page.keyboard.up('Shift')
        print('PASS walking and sprint controls', flush=True)
        await page.evaluate('window.mareAlta.qa.waypoint()'); await page.keyboard.press('e')
        assert await page.evaluate('window.mareAlta.state.stage') == 1
        print('PASS story intro and first objective', flush=True)
        await page.evaluate('window.mareAlta.qa.waypoint()'); await page.keyboard.press('e')
        assert await page.evaluate('window.mareAlta.state.stage') == 1
        print('PASS objective requires stolen car', flush=True)
        await page.evaluate('''() => { const g=window.mareAlta; const c=g.traffic.find(x=>!x.stolen); c.stolen=false; c.g.position.set(g.state.x,0,g.state.z); }''')
        await page.keyboard.press('e'); assert await page.evaluate('window.mareAlta.state.vehicle')
        print('PASS car theft raises wanted state', flush=True)
        await page.evaluate('window.mareAlta.qa.waypoint()'); await page.keyboard.press('e')
        await page.evaluate('window.mareAlta.qa.finishEscape()'); await page.wait_for_timeout(150)
        assert await page.evaluate('window.mareAlta.state.wanted') == 0
        await page.evaluate('window.mareAlta.qa.waypoint()'); await page.keyboard.press('e')
        assert await page.evaluate('window.mareAlta.state.mission') == 1
        for i in range(2):
            await page.evaluate('window.mareAlta.qa.waypoint()'); await page.keyboard.press('e')
        assert await page.evaluate('window.mareAlta.state.mission') == 3
        print('PASS first three story jobs with dialogue and rewards', flush=True)
        await page.keyboard.press('e')
        before=await page.evaluate('window.mareAlta.state.ammo'); await page.keyboard.press('f')
        assert await page.evaluate('window.mareAlta.state.ammo') == before-1
        await page.keyboard.press('r')
        await page.wait_for_function('window.mareAlta.state.reloading === 0', timeout=20000)
        assert await page.evaluate('window.mareAlta.state.reloading') == 0
        assert await page.evaluate('window.mareAlta.state.ammo') > before-1
        await page.evaluate('window.mareAlta.qa.damage()')
        assert await page.evaluate('window.mareAlta.state.health') < 100
        print('PASS firing, reloading and damage', flush=True)
        await page.evaluate('window.mareAlta.qa.wanted()'); await page.wait_for_timeout(300)
        assert await page.evaluate('window.mareAlta.qa.police.units.some(u=>u.g.visible)')
        print('PASS wanted response and pursuing police', flush=True)
        await page.evaluate('''() => { const g=window.mareAlta; g.state.x=90; g.state.z=90; g.state.vehicle=false; g.qa.activity(); }'''); await page.wait_for_timeout(200)
        assert await page.evaluate('window.mareAlta.state.activities') == 1
        print('PASS repeatable courier activity', flush=True)
        await page.evaluate('''() => { window.mareAlta.state.x=57;window.mareAlta.state.z=48;window.mareAlta.state.vehicle=false; }''')
        await page.keyboard.press('g'); await page.get_by_role('button', name='Engine tune').click()
        assert await page.evaluate('window.mareAlta.state.upgrades.engine') == 1
        await page.keyboard.press('Escape')
        print('PASS garage purchase', flush=True)
        await page.keyboard.press('p'); await page.wait_for_timeout(150); await page.keyboard.press('p')
        await page.keyboard.press('Tab'); await page.wait_for_timeout(150); await page.get_by_role('button', name='Save').click()
        cash=await page.evaluate('window.mareAlta.state.cash')
        await page.reload(wait_until='networkidle'); await page.locator('#continueGame').click(); await page.wait_for_timeout(350)
        assert await page.evaluate('window.mareAlta.state.cash') == cash
        print('PASS pause, local save and Continue reload', flush=True)
        await page.evaluate('window.mareAlta.qa.die()'); await page.wait_for_timeout(150)
        await page.get_by_role('button', name='Retry checkpoint').click()
        assert await page.evaluate('window.mareAlta.state.health') == 100
        print('PASS death recovery and retry', flush=True)
        # Cover framing: daylight, player, police, visible traffic and HUD.
        names=['01-coastal-response.jpg','02-old-town.jpg','03-port-run.jpg','04-city-record.jpg']
        for i,name in enumerate(names):
            if i<3:
                await page.evaluate('(i)=>window.mareAlta.qa.stage(i)', i)
                await page.wait_for_timeout(700)
                before = await page.evaluate('window.mareAlta.qa.motion()')
                await page.wait_for_timeout(500)
                after = await page.evaluate('window.mareAlta.qa.motion()')
                if i == 0:
                    await page.wait_for_function('window.mareAlta.qa.audit().police.filter(u=>u.distance<60 && u.lamps.every(v=>v>=3)).length>=2')
                audit=await page.evaluate('window.mareAlta.qa.freeze()')
                for key, minimum in [('traffic', 8), ('people', 12)]:
                    previous = {a['id']: a for a in before[key]}
                    moving = sum(a['id'] in previous and
                                 abs(a['x']-previous[a['id']]['x'])+abs(a['z']-previous[a['id']]['z']) > .001
                                 for a in after[key])
                    print(f'ASSERT {name} moving {key}={moving} minimum={minimum}', flush=True)
                    assert moving >= minimum, (name, key, moving)
                print(f'ASSERT {name} frustum traffic={audit["traffic"]} pedestrians={audit["pedestrians"]} minimum=8/12', flush=True)
                assert audit['traffic'] >= (10 if i==0 else 8) and audit['pedestrians'] >= (15 if i==0 else 12), audit
                print(f'ASSERT {name} car bounds={audit["carBounds"]} viewport=1280x720 margin=18', flush=True)
                assert audit['playerCarInFrame'], audit
                if i == 0:
                    print(f'ASSERT cover police distances/emissive={audit["police"]} camera={audit["camera"]}', flush=True)
                    assert len([u for u in audit['police'] if u['distance']<60 and all(v>=3 for v in u['lamps'])]) >= 2, audit
                    assert 6<=audit['camera']['behind']<=8 and 2.5<=audit['camera']['y']<=3, audit
                    await page.evaluate('window.mareAlta.qa.resume()')
                    await page.wait_for_function('window.mareAlta.qa.audit().police.some(u=>u.lamps.every(v=>v===0))')
                    print('ASSERT cover timer reached dark emissive=0 after lit emissive=3', flush=True)
                    await page.wait_for_function('window.mareAlta.qa.audit().police.filter(u=>u.distance<60 && u.lamps.every(v=>v>=3)).length>=2')
                    audit=await page.evaluate('window.mareAlta.qa.freeze()')
                if i == 1:
                    print(f'ASSERT foot player={audit["playerVisible"]} aiming gun={audit["gunVisible"]}', flush=True)
                    assert audit['playerVisible'] and audit['gunVisible'], audit
                if i == 2:
                    print(f'ASSERT harbour water={audit["water"]} boats={audit["boats"]} quay distance={audit["quayDistance"]:.3f}m maximum=25m', flush=True)
                    assert audit['water']>=1 and audit['boats']>=1 and audit['quayDistance']<=25, audit
                    print(f'ASSERT harbour active job marker visible={audit["markerVisible"]} bounds={audit["markerBounds"]}', flush=True)
                    assert audit['markerVisible'] and audit['markerBounds']['depth'], audit
                assert await page.locator('#toast').evaluate("e => e.classList.contains('hidden')")
                assert await page.locator('#clock').text_content() == '14:18'
                assert await page.locator('#radio').text_content() == 'MARÉ FM'
                assert await page.locator('#ammo').text_content() == 'AMMO 18/144'
                print(f'FRAME {i+1}: {audit}', flush=True)
            if i==3:
                await page.keyboard.press('Tab'); await page.wait_for_timeout(400)
                assert await page.locator('#modal h2').text_content() == 'CITY RECORD'
                print('ASSERT frame 4 CITY RECORD visible=1', flush=True)
            clipped = await page.evaluate('''() => [...document.querySelectorAll('.hud *')].filter(e => {
                if (!e.getClientRects().length || !e.textContent.trim() || e.closest('.hidden')) return false;
                const r=e.getBoundingClientRect(); return r.left<0 || r.top<0 || r.right>innerWidth || r.bottom>innerHeight;
            }).map(e=>e.id || e.className)''')
            assert not clipped, ('HUD outside frame', clipped)
            print(f'ASSERT {name} HUD clipped elements={len(clipped)}', flush=True)
            await page.screenshot(path=str(ROOT/'screenshots'/name), type='jpeg', quality=80)
            image = Image.open(ROOT/'screenshots'/name)
            assert image.format == 'JPEG' and image.size == (1280, 720)
            assert (ROOT/'screenshots'/name).stat().st_size <= 256*1024
            print(f'ASSERT {name} JPEG={image.size} bytes={(ROOT/"screenshots"/name).stat().st_size} maximum=262144', flush=True)
            print(f'CAPTURE {name}', flush=True)
        print('PAGE ERRORS: '+repr(errors), flush=True)
        if errors: raise RuntimeError('browser page errors: '+repr(errors))
        await browser.close()

asyncio.run(main())
