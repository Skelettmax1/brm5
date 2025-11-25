// --- CLOUDFLARE WORKER BACKEND ---
// Deploy this code to a Cloudflare Worker.
// Bind a KV Namespace to this worker with the variable name: BRM5_KV

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // In production, replace '*' with your frontend domain
  'Access-Control-Allow-Methods': 'GET, HEAD, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // --- AUTH ROUTES ---
      if (path === '/auth/register' && request.method === 'POST') {
        const { username, password, name, platoon } = await request.json();
        
        // Validation
        if (!username || !password || !name || !platoon) {
          return errorResponse('Missing required fields');
        }

        // Get existing users
        let users = await getJSON(env.BRM5_KV, 'users') || {};
        
        if (users[username]) {
          return errorResponse('Operator ID already exists');
        }

        const newUser = { 
          id: `user-${username}-${Date.now()}`,
          username, 
          password, 
          name, 
          platoon 
        };

        users[username] = newUser;
        await putJSON(env.BRM5_KV, 'users', users);

        const { password: _, ...safeUser } = newUser;
        return jsonResponse(safeUser);
      }

      if (path === '/auth/login' && request.method === 'POST') {
        const { username, password } = await request.json();
        
        const users = await getJSON(env.BRM5_KV, 'users') || {};
        const user = users[username];

        if (!user || user.password !== password) {
          return errorResponse('Invalid Credentials', 401);
        }

        const { password: _, ...safeUser } = user;
        return jsonResponse(safeUser);
      }

      // --- MISSION ROUTES ---
      if (path === '/missions' && request.method === 'GET') {
        const missions = await getJSON(env.BRM5_KV, 'missions') || [];
        return jsonResponse(missions);
      }

      if (path === '/missions' && request.method === 'POST') {
        const mission = await request.json();
        
        if (!mission.id || !mission.title) {
          return errorResponse('Invalid Mission Data');
        }

        let missions = await getJSON(env.BRM5_KV, 'missions') || [];
        
        // Check if update or create
        const index = missions.findIndex(m => m.id === mission.id);
        
        const timestamp = Date.now();
        const missionData = { ...mission, updatedAt: timestamp };

        if (index >= 0) {
          missions[index] = missionData;
        } else {
          // New mission
          missionData.createdAt = timestamp;
          missions.push(missionData);
        }

        await putJSON(env.BRM5_KV, 'missions', missions);
        return jsonResponse(missionData);
      }

      if (path === '/missions' && request.method === 'DELETE') {
        const { id } = await request.json();
        
        let missions = await getJSON(env.BRM5_KV, 'missions') || [];
        const newMissions = missions.filter(m => m.id !== id);
        
        await putJSON(env.BRM5_KV, 'missions', newMissions);
        return jsonResponse({ success: true });
      }

      return errorResponse('Endpoint not found', 404);

    } catch (err) {
      return errorResponse(`Server Error: ${err.message}`, 500);
    }
  },
};

// --- HELPERS ---

async function getJSON(kv, key) {
  const value = await kv.get(key);
  return value ? JSON.parse(value) : null;
}

async function putJSON(kv, key, value) {
  await kv.put(key, JSON.stringify(value));
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function errorResponse(message, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
