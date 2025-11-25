import React, { useState, useEffect, useCallback } from 'react';
import LoginScreen from './components/LoginScreen';
import MissionList from './components/MissionList';
import MissionCreator from './components/MissionCreator';
import { db } from './services/localDb';
import { User, Mission } from './types';

type ViewState = 'login' | 'list' | 'creator';

function App() {
  const [view, setView] = useState<ViewState>('login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [editingMission, setEditingMission] = useState<Mission | undefined>(undefined);

  // --- Data Loading ---
  const loadMissions = useCallback(async () => {
    const data = await db.getMissions();
    setMissions(data);
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadMissions();
    }
  }, [currentUser, loadMissions]);

  // --- Handlers ---
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setView('list');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setMissions([]);
    setView('login');
  };

  const handleCreateNew = () => {
    setEditingMission(undefined);
    setView('creator');
  };

  const handleEdit = (mission: Mission) => {
    setEditingMission(mission);
    setView('creator');
  };

  const handleSaveSuccess = () => {
    loadMissions();
    setView('list');
    setEditingMission(undefined);
  };

  const handleCancelCreator = () => {
    setView('list');
    setEditingMission(undefined);
  };

  // --- Render ---
  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans selection:bg-green-900 selection:text-white">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-center mb-10 text-gray-200 tracking-[0.2em] font-mono border-b-2 border-green-800 pb-4 shadow-green-900/20 drop-shadow-md">
          BRM5 TACTICAL COMMAND <span className="text-gray-600 text-lg font-normal block md:inline md:ml-4 tracking-normal">(MISSION TERMINAL)</span>
        </h1>
        
        {view === 'login' && (
          <LoginScreen onLoginSuccess={handleLoginSuccess} />
        )}

        {view === 'list' && currentUser && (
          <MissionList
            user={currentUser}
            missions={missions}
            onRefresh={loadMissions}
            onCreate={handleCreateNew}
            onEdit={handleEdit}
            onLogout={handleLogout}
          />
        )}

        {view === 'creator' && currentUser && (
          <MissionCreator
            user={currentUser}
            missionToEdit={editingMission}
            onCancel={handleCancelCreator}
            onSaveSuccess={handleSaveSuccess}
          />
        )}
      </div>
    </div>
  );
}

export default App;