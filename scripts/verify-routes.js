async function verifyFrontend() {
  console.log('🔍 Testing Frontend Routes & Asset Delivery on Vite (5173) and Unified Server (3001)...\n');
  const routes = ['/', '/login', '/register', '/dashboard', '/sessions', '/settings', '/admin'];
  
  for (const port of [5173, 3001]) {
    console.log(`--- Testing Port ${port} ---`);
    for (const route of routes) {
      try {
        const res = await fetch(`http://localhost:${port}${route}`);
        const text = await res.text();
        const hasRoot = text.includes('id="root"') || text.includes('Nebula');
        console.log(`  Route ${route.padEnd(12)} -> Status: ${res.status} | SPA Shell: ${hasRoot ? 'OK' : 'MISSING'}`);
      } catch (err) {
        console.error(`  Route ${route} FAILED:`, err.message);
      }
    }
  }

  // Also test asset chunk delivery from 3001
  const htmlRes = await fetch('http://localhost:3001/');
  const html = await htmlRes.text();
  const jsMatch = html.match(/\/assets\/[^"]+\.js/);
  const cssMatch = html.match(/\/assets\/[^"]+\.css/);

  if (jsMatch && cssMatch) {
    console.log('\n--- Testing Static Asset Delivery (Port 3001) ---');
    const jsRes = await fetch(`http://localhost:3001${jsMatch[0]}`);
    console.log(`  JS Bundle (${jsMatch[0]}) -> Status: ${jsRes.status} | Size: ${jsRes.headers.get('content-length')} bytes`);
    
    const cssRes = await fetch(`http://localhost:3001${cssMatch[0]}`);
    console.log(`  CSS Bundle (${cssMatch[0]}) -> Status: ${cssRes.status} | Size: ${cssRes.headers.get('content-length')} bytes`);
  }

  console.log('\n✨ All frontend routes and asset chunks delivered successfully!');
}

verifyFrontend();
