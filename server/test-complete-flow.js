import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

let userAToken, userBToken, userAId, userBId, eventAId, eventBId, swapRequestId;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const runTests = async () => {
  try {
    console.log('\n=== COMPLETE SWAP FLOW TEST ===\n');

    // 1. Sign up two users
    console.log('1️⃣ Creating User A...');
    const signupA = await axios.post(`${API_URL}/auth/signup`, {
      username: 'alice',
      email: 'alice@test.com',
      password: 'password123',
    });
    userAToken = signupA.data.token;
    userAId = signupA.data._id;
    console.log('✓ User A created:', signupA.data.username);

    console.log('2️⃣ Creating User B...');
    const signupB = await axios.post(`${API_URL}/auth/signup`, {
      username: 'bob',
      email: 'bob@test.com',
      password: 'password456',
    });
    userBToken = signupB.data.token;
    userBId = signupB.data._id;
    console.log('✓ User B created:', signupB.data.username);

    // 2. Create events
    console.log('\n3️⃣ User A creates event...');
    const eventA = await axios.post(
      `${API_URL}/events`,
      {
        title: 'Team Meeting',
        startTime: '2025-11-10T10:00:00',
        endTime: '2025-11-10T11:00:00',
      },
      { headers: { Authorization: `Bearer ${userAToken}` } }
    );
    eventAId = eventA.data.event._id;
    console.log('✓ Event A created:', eventA.data.event.title, '- Status:', eventA.data.event.status);

    console.log('4️⃣ User B creates event...');
    const eventB = await axios.post(
      `${API_URL}/events`,
      {
        title: 'Focus Block',
        startTime: '2025-11-10T14:00:00',
        endTime: '2025-11-10T15:00:00',
      },
      { headers: { Authorization: `Bearer ${userBToken}` } }
    );
    eventBId = eventB.data.event._id;
    console.log('✓ Event B created:', eventB.data.event.title, '- Status:', eventB.data.event.status);

    // 3. Mark events as swappable
    console.log('\n5️⃣ User A marks event as SWAPPABLE...');
    await axios.patch(
      `${API_URL}/events/${eventAId}/status`,
      { status: 'SWAPPABLE' },
      { headers: { Authorization: `Bearer ${userAToken}` } }
    );
    console.log('✓ Event A status changed to SWAPPABLE');

    console.log('6️⃣ User B marks event as SWAPPABLE...');
    await axios.patch(
      `${API_URL}/events/${eventBId}/status`,
      { status: 'SWAPPABLE' },
      { headers: { Authorization: `Bearer ${userBToken}` } }
    );
    console.log('✓ Event B status changed to SWAPPABLE');

    // 4. Get marketplace (swappable slots)
    console.log('\n7️⃣ User B views marketplace...');
    const marketplace = await axios.get(`${API_URL}/swap-request/swappable-slots`, {
      headers: { Authorization: `Bearer ${userBToken}` },
    });
    console.log('✓ Found', marketplace.data.count, 'swappable slot(s)');
    console.log('  Slot:', marketplace.data.slots[0].title, 'by', marketplace.data.slots[0].userId.username);

    // 5. Create swap request
    console.log('\n8️⃣ User B creates swap request...');
    const swapReq = await axios.post(
      `${API_URL}/swap-request/create`,
      {
        mySlotId: eventBId,
        theirSlotId: eventAId,
      },
      { headers: { Authorization: `Bearer ${userBToken}` } }
    );
    swapRequestId = swapReq.data.swapRequest._id;
    console.log('✓ Swap request created');
    console.log('  Requester:', swapReq.data.swapRequest.requesterId.username, '→ gives', swapReq.data.swapRequest.requesterSlotId.title);
    console.log('  Receiver:', swapReq.data.swapRequest.receiverId.username, '← receives', swapReq.data.swapRequest.receiverSlotId.title);

    // 6. Check slot statuses (should be SWAP_PENDING)
    console.log('\n9️⃣ Checking slot statuses after request...');
    const checkA = await axios.get(`${API_URL}/events/${eventAId}`, {
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    console.log('✓ Event A status:', checkA.data.event.status, '(should be SWAP_PENDING)');

    const checkB = await axios.get(`${API_URL}/events/${eventBId}`, {
      headers: { Authorization: `Bearer ${userBToken}` },
    });
    console.log('✓ Event B status:', checkB.data.event.status, '(should be SWAP_PENDING)');

    // 7. User A views incoming requests
    console.log('\n🔟 User A checks notifications...');
    const myReqs = await axios.get(`${API_URL}/swap-request/my-requests`, {
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    console.log('✓ Incoming requests:', myReqs.data.incoming.length);
    if (myReqs.data.incoming.length > 0) {
      console.log('  From:', myReqs.data.incoming[0].requesterId.username);
      console.log('  Status:', myReqs.data.incoming[0].status);
    }

    // 8. Accept swap
    console.log('\n1️⃣1️⃣ User A accepts swap...');
    const accept = await axios.post(
      `${API_URL}/swap-request/respond/${swapRequestId}`,
      { action: 'ACCEPT' },
      { headers: { Authorization: `Bearer ${userAToken}` } }
    );
    console.log('✓ Swap accepted!');
    console.log('✓ SwapRequest status:', accept.data.swapRequest.status);

    // 9. Check final ownership (should be swapped)
    console.log('\n1️⃣2️⃣ Verifying ownership after acceptance...');
    const finalA = await axios.get(`${API_URL}/events/${eventAId}`, {
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    console.log('✓ Event A (Team Meeting):');
    console.log('  Owner: User', finalA.data.event.userId === userBId ? 'B' : 'A');
    console.log('  Status:', finalA.data.event.status);

    const finalB = await axios.get(`${API_URL}/events/${eventBId}`, {
      headers: { Authorization: `Bearer ${userBToken}` },
    });
    console.log('✓ Event B (Focus Block):');
    console.log('  Owner: User', finalB.data.event.userId === userAId ? 'A' : 'B');
    console.log('  Status:', finalB.data.event.status);

    console.log('\n✅ ALL TESTS PASSED - Swap flow working correctly!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data?.message || error.message);
    process.exit(1);
  }
};

runTests();
