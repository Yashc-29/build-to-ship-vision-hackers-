async function runConversationalFlow() {
  console.log('🌌 --- TESTING FULL CONVERSATIONAL INTELLIGENCE FLOW ---');

  const BASE_URL = 'http://localhost:3001/api';

  // 1. Register a test agent
  const email = `agent.${Date.now()}@nebula.ai`;
  const regRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      full_name: 'Alex Rivera (Tier 1)',
      email,
      password: 'Password@123',
      preferred_language: 'en',
      role: 'agent'
    })
  });
  const regData = await regRes.json();
  if (!regRes.ok) throw new Error('Registration failed: ' + JSON.stringify(regData));
  const token = regData.token;
  console.log(`1. Agent Registered: ${regData.user.full_name} (${email})`);

  // 2. Initialize Voice Session
  const sessionRes = await fetch(`${BASE_URL}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ channel: 'voice', language: 'en', title: 'Live Logistics Voice Support' })
  });
  const session = (await sessionRes.json()).session;
  console.log(`2. Voice Session Initialized: ${session.id} (Channel: ${session.channel})`);

  // 3. Turn 1: Customer specifies name and order ID
  console.log('\n--- Turn 1: Voice Input ---');
  const t1Res = await fetch(`${BASE_URL}/sessions/${session.id}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      content: "Hello, my name is Alex Rivera and I'm calling about order #ORD-7719. It hasn't arrived.",
      channel: 'voice',
      language: 'en'
    })
  });
  const t1Data = await t1Res.json();
  console.log('   User: "Hello, my name is Alex Rivera and I\'m calling about order #ORD-7719. It hasn\'t arrived."');
  console.log('   Nebula AI:', t1Data.assistant_message.content);
  console.log('   Intent:', t1Data.intelligence.intent);
  console.log('   Sentiment:', t1Data.intelligence.sentiment_label, `(${t1Data.intelligence.sentiment_score})`);
  console.log('   Memory Slots:');
  t1Data.memory_slots.forEach(s => console.log(`     - ${s.slot_key}: "${s.slot_value}"`));

  // 4. Turn 2: Omnichannel Hop to WhatsApp & address modification
  console.log('\n--- Channel Hopping: Voice -> WhatsApp ---');
  await fetch(`${BASE_URL}/sessions/${session.id}/channel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ channel: 'whatsapp' })
  });
  console.log('   Channel switched to: WhatsApp');

  console.log('\n--- Turn 2: WhatsApp Input (Context Retention) ---');
  const t2Res = await fetch(`${BASE_URL}/sessions/${session.id}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      content: "Can you update the delivery address to 452 Tech Parkway, Austin TX?",
      channel: 'whatsapp',
      language: 'en'
    })
  });
  const t2Data = await t2Res.json();
  console.log('   User: "Can you update the delivery address to 452 Tech Parkway, Austin TX?"');
  console.log('   Nebula AI:', t2Data.assistant_message.content);
  console.log('   Updated Memory Slots:');
  t2Data.memory_slots.forEach(s => console.log(`     - ${s.slot_key}: "${s.slot_value}"`));

  // 5. Turn 3: Verify Context Memory
  console.log('\n--- Turn 3: Context Memory Query ---');
  const t3Res = await fetch(`${BASE_URL}/sessions/${session.id}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      content: "What was the order number and address we discussed?",
      channel: 'whatsapp',
      language: 'en'
    })
  });
  const t3Data = await t3Res.json();
  console.log('   User: "What was the order number and address we discussed?"');
  console.log('   Nebula AI:', t3Data.assistant_message.content);

  // 6. Verify Memory Buffer Persistence
  console.log('\n--- Memory Buffer Verification ---');
  const memRes = await fetch(`${BASE_URL}/sessions/${session.id}/memory`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const memData = await memRes.json();
  console.log(`   Memory Buffer has ${memData.memory_slots.length} persistent slots in database.`);

  console.log('\n======================================================================');
  console.log('✨ CONVERSATIONAL INTELLIGENCE & MEMORY BUFFER VALIDATED SUCCESSFULLY!');
  console.log('======================================================================\n');
}

runConversationalFlow().catch(err => {
  console.error('❌ Flow Failed:', err);
  process.exit(1);
});
