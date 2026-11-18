import asyncio
import json
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
        await page.get_by_role('button', name='COURIER · Swift feet / cheap repairs').click()
        await page.wait_for_timeout(1800)
        assert 'A Favor for Lila' in await page.locator('#job').text_content()
        assert await page.locator('#roleBadge').text_content() == 'COURIER · RAFA VALE'
        assert 'DRI 1 · AIM 1 · END 1' in await page.locator('#attributes').text_content()
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
        await page.get_by_role('button', name='Aim +').click()
        assert await page.evaluate('window.mareAlta.state.attributes.aim') == 2
        await page.keyboard.press('Escape')
        print('PASS garage purchase and attribute training', flush=True)
        await page.keyboard.press('p'); await page.wait_for_timeout(150); await page.keyboard.press('p')
        await page.keyboard.press('Tab'); await page.wait_for_timeout(150); await page.get_by_role('button', name='Save').click()
        cash=await page.evaluate('window.mareAlta.state.cash')
        await page.reload(wait_until='networkidle'); await page.locator('#continueGame').click(); await page.wait_for_timeout(350)
        assert await page.evaluate('window.mareAlta.state.cash') == cash
        assert await page.evaluate('window.mareAlta.state.role') == 'COURIER'
        assert await page.evaluate('window.mareAlta.state.attributes.aim') == 2
        print('PASS pause, local save and Continue reload', flush=True)
        await page.evaluate('window.mareAlta.qa.die()'); await page.wait_for_timeout(150)
        await page.get_by_role('button', name='Retry checkpoint').click()
        assert await page.evaluate('window.mareAlta.state.health') == 100
        print('PASS death recovery and retry', flush=True)
        # Capture measurements are taken again immediately before each screenshot.
        names=['01-coastal-response.jpg','02-old-town.jpg','03-port-run.jpg','04-city-record.jpg']
        measurements=[]
        for i,name in enumerate(names):
            preset=['cover','onfoot','harbour','cityrecord'][i]
            await page.evaluate('(name)=>window.setCapturePreset(name)', preset)
            audit=await page.evaluate('window.mareAlta.qa.measure()')
            measurements.append(audit)
            print(f'FRAME {preset}: '+json.dumps(audit), flush=True)
            assert audit['elements'], ('No measured elements', preset)
            for e in audit['elements']:
                print(f'NDC {preset} {e["id"]}: min={e["min"]} max={e["max"]} front={e["front"]} visible={e["visible"]}', flush=True)
                assert e['inside'] and e['visible'], (preset,e)
            by_id={e['id']:e for e in audit['elements']}
            s=audit['state']
            counts=audit['counts']
            print(f'INFRAME {preset}: '+json.dumps(counts), flush=True)
            if i==0:
                b=by_id['player-car']
                assert all(-.8<=b['min'][k]<=b['max'][k]<=.8 for k in (0,1)), b
                assert abs(audit['camera']['behind']-7)<.001 and abs(audit['camera']['pitch']-12)<.001
                assert abs(audit['camera']['position'][1]-3)<.001 # 2.9 above the car's y=.1
                assert s['vehicle'] and s['wanted']==3 and s['cash']==650
                assert await page.locator('#roleBadge').text_content() == 'COURIER · RAFA VALE'
                assert 'DRI 1 · AIM 1 · END 1' in await page.locator('#attributes').text_content()
                # The supervisor's cover bar: two cruisers with lamps lit inside the
                # frame, at least eight moving vehicles and twelve pedestrians in it.
                assert counts['policeLampsInLitPhase']>=2, ('lit cruisers in frame', counts)
                for pid in ('police-1','police-2'):
                    assert by_id[pid]['inside'] and by_id[f'{pid}-red-lamp']['emissive']>=3 and by_id[f'{pid}-blue-lamp']['emissive']>=3, ('lit cruiser', pid, by_id.get(pid))
                assert counts['vehicles']>=8, ('vehicles in frame', counts)
                assert counts['pedestrians']>=12, ('pedestrians in frame', counts)
                assert len([e for e in by_id if e.startswith('traffic-')])>=8
            if i==1:
                assert not s['vehicle'] and s['wanted']==2 and audit['flash'] and s['shots']>0
                assert len([e for e in by_id if e.startswith('pedestrian-')])>=3
                assert all(e['distance']<=25 for e in audit['elements'] if e['id'].startswith('pedestrian-'))
                assert by_id['parked-car']['distance']<=15 and by_id['police-1-red-lamp']['emissive']>=3
            if i<2:
                assert s['health']==60 and s['armour']==40 and s['ammo']==11 and s['reserve']==48
                assert all(e['emissive']>=3 for e in audit['elements'] if e['id'].endswith('-lamp'))
                assert await page.locator('#ammo').text_content() == 'AMMO 11/48'
                assert await page.locator('#health').evaluate('e=>e.style.width') == '60%'
                assert await page.locator('#armour').evaluate('e=>e.style.width') == '40%'
            if i==2:
                # The supervisor's harbour bar: moored boats with masts, a gantry
                # crane with its trolley, containers, three promenade vehicles and
                # six pedestrians, all projected inside the frame.
                assert len([e for e in by_id if e.startswith('moored-boat-')])>=2
                assert len([e for e in by_id if e.startswith('boat-') and e.endswith('-mast')])>=2
                assert by_id['gantry-crane']['inside'] and by_id['crane-trolley']['inside']
                assert counts['boats']>=2 and counts['cranes']>=1
                assert len([e for e in by_id if e.startswith('container-stack-')])>=2
                assert counts['pedestrians']>=6
                assert counts['vehicles']>=3
                assert by_id['sea-visible-section']['inside'] and by_id['sea-visible-section']['visible']
                m=audit['minimapMarker'];assert 6<=m['x']<=172 and 6<=m['y']<=136, m
                print('ASSERT frame 3 harbour water=%s boats=%s crane=%s' % (by_id['sea-visible-section']['inside'], counts['boats'], by_id['gantry-crane']['inside']), flush=True)
            if i==3:
                assert await page.locator('#modal h2').text_content() == 'CITY RECORD'
                print('ASSERT frame 4 CITY RECORD visible=1', flush=True)
            assert await page.locator('#toast').evaluate("e => e.classList.contains('hidden')")
            assert await page.locator('#clock').text_content() == '14:18'
            assert await page.locator('#radio').text_content() == 'MARÉ FM'
            await page.wait_for_timeout(100)
            assert await page.evaluate('window.mareAlta.qa.measure()') == audit, ('Capture moved while held', preset)
            clipped = await page.evaluate('''() => [...document.querySelectorAll('.hud *')].filter(e => {
                if (!e.getClientRects().length || !e.textContent.trim() || e.closest('.hidden')) return false;
                const r=e.getBoundingClientRect(); return r.left<0 || r.top<0 || r.right>innerWidth || r.bottom>innerHeight;
            }).map(e=>e.id || e.className)''')
            assert not clipped, ('HUD outside frame', clipped)
            print(f'ASSERT {name} role={await page.locator("#roleBadge").text_content()} attributes={await page.locator("#attributes").text_content()} HUD clipped elements={len(clipped)}', flush=True)
            await page.screenshot(path=str(ROOT/'screenshots'/name), type='jpeg', quality=80)
            image = Image.open(ROOT/'screenshots'/name)
            assert image.format == 'JPEG' and image.size == (1280, 720)
            assert (ROOT/'screenshots'/name).stat().st_size <= 256*1024
            print(f'ASSERT {name} JPEG={image.size} bytes={(ROOT/"screenshots"/name).stat().st_size} maximum=262144', flush=True)
            print(f'CAPTURE {name}', flush=True)
        (ROOT/'.makefun'/'capture-measurements.json').write_text(json.dumps(measurements, indent=2)+'\n')
        print('PAGE ERRORS: '+repr(errors), flush=True)
        if errors: raise RuntimeError('browser page errors: '+repr(errors))
        await browser.close()

asyncio.run(main())
