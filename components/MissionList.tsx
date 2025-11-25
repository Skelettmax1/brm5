import React, { useMemo } from 'react';
import { List, LogOut, Plus, Trash2, Edit, Users, Star, Database } from 'lucide-react';
import { User, Mission } from '../types';
import { FULL_VISIBILITY_ROLES, LIEUTENANT_ROLES } from '../constants';
import { db } from '../services/localDb';
import { Header, Button } from './UIComponents';

interface MissionListProps {
  user: User;
  missions: Mission[];
  onRefresh: () => void;
  onEdit: (mission: Mission) => void;
  onCreate: () => void;
  onLogout: () => void;
}

const MissionList: React.FC<MissionListProps> = ({ user, missions, onRefresh, onEdit, onCreate, onLogout }) => {

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`[WARNING] Confirm deletion of "${title}"? This cannot be undone.`)) {
      await db.deleteMission(id);
      onRefresh();
    }
  };

  const getPlatoonStyles = (platoon: string) => {
    switch (platoon) {
      case 'RDPL':
        return { text: 'text-red-500', border: 'border-l-4 border-red-600', badge: 'bg-red-950 text-red-300 border-red-800' };
      case 'GRPL':
        return { text: 'text-green-500', border: 'border-l-4 border-green-600', badge: 'bg-green-950 text-green-300 border-green-800' };
      case 'BLPL':
        return { text: 'text-blue-500', border: 'border-l-4 border-blue-600', badge: 'bg-blue-950 text-blue-300 border-blue-800' };
      case 'LTPR':
      case 'LTPG':
      case 'LTPB':
        return { text: 'text-yellow-500', border: 'border-l-4 border-yellow-600', badge: 'bg-yellow-950 text-yellow-300 border-yellow-800' };
      default:
        return { text: 'text-gray-500', border: 'border-l-4 border-gray-600', badge: 'bg-gray-800 text-gray-400 border-gray-600' };
    }
  };

  const visibleMissions = useMemo(() => {
    let filtered = [...missions].sort((a, b) => b.updatedAt - a.updatedAt);

    if (FULL_VISIBILITY_ROLES.includes(user.platoon)) {
      return filtered;
    }

    return filtered.filter(mission =>
      mission.assignedPlatoon === user.platoon ||
      mission.assignedPlatoon === 'GENERAL'
    );
  }, [missions, user.platoon]);

  const canEditOrDelete = (mission: Mission) => {
    if (user.platoon === 'RDPL') return true;
    return mission.creatorId === user.id;
  };

  const userPlatoonStyles = getPlatoonStyles(user.platoon);

  return (
    <div className="p-6 bg-gray-950 min-h-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b pb-4 border-gray-800 gap-4">
        <Header title="ACTIVE MISSIONS" Icon={List} />
        <div className="flex flex-wrap space-x-3 items-center">
          <span className={`text-sm font-mono font-bold px-3 py-1 rounded-sm border ${userPlatoonStyles.badge} uppercase`}>
            ID: {user.username} [{user.platoon}]
          </span>
          <Button onClick={onLogout} icon={LogOut} className="bg-red-900/50 hover:bg-red-800/50 border-red-800 text-red-200">
            LOGOUT
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="p-2 px-4 rounded-sm bg-gray-900 border border-green-900/50 text-green-600 flex items-center font-mono text-xs">
          <Database className="w-3 h-3 mr-2" />
          <span>SERVER CONNECTION: STABLE (AUTO-SAVE)</span>
        </div>
        <div className="flex space-x-2">
            <Button onClick={onCreate} icon={Plus}>
                NEW MISSION
            </Button>
        </div>
      </div>

      {visibleMissions.length === 0 ? (
        <div className="text-center p-12 bg-gray-900/50 rounded-sm border border-gray-800 border-dashed text-gray-500 font-mono">
          <p className="mb-4">[SYSTEM] NO ACTIVE MISSIONS IN FEED.</p>
          <Button onClick={onCreate} icon={Plus}>
            INITIATE OPERATION
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {visibleMissions.map(mission => {
            const canManage = canEditOrDelete(mission);
            const missionStyles = getPlatoonStyles(mission.assignedPlatoon);
            const creatorStyles = getPlatoonStyles(mission.creatorPlatoon);
            const isLieutenantMission = LIEUTENANT_ROLES.includes(mission.creatorPlatoon);

            return (
              <div
                key={mission.id}
                className={`p-5 rounded-sm shadow-lg transition duration-300 font-mono relative bg-gray-900 border border-gray-800 
                            ${missionStyles.border} hover:bg-gray-800/80 group
                            ${isLieutenantMission ? 'border-t-2 border-t-yellow-900/50' : ''}`}
              >
                {isLieutenantMission && (
                  <div className="absolute top-0 right-0 m-2 px-2 py-0.5 bg-yellow-900/40 text-yellow-500 border border-yellow-900 text-[10px] font-bold rounded-sm flex items-center tracking-wider">
                    <Star className="w-3 h-3 mr-1" fill="currentColor" /> COMMAND
                  </div>
                )}
                
                <div className="mb-2">
                  <div className="flex justify-between items-start mb-2 pr-20">
                    <h3 className={`text-xl font-bold ${missionStyles.text} leading-tight tracking-wider truncate w-full`}>{mission.title}</h3>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 text-sm text-gray-400 mb-3 border-b border-gray-800 pb-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider whitespace-nowrap border flex items-center ${missionStyles.badge}`}>
                      <Users className="w-3 h-3 mr-1" />
                      {mission.assignedPlatoon}
                    </span>
                    <span className="font-semibold text-gray-500 self-center">{mission.scenarioType}</span>
                  </div>

                  <p className="text-[10px] text-gray-600 uppercase mb-1 tracking-widest">Primary Objective</p>
                  <p className="text-sm text-gray-300 mb-4 h-20 overflow-y-auto pr-1 custom-scrollbar leading-relaxed">
                    {mission.objective}
                  </p>
                  
                  {mission.assets && (
                    <div className="mb-4">
                        <p className="text-[10px] text-gray-600 uppercase mb-1 tracking-widest">Assets</p>
                        <p className="text-xs text-gray-400 font-mono truncate">{mission.assets}</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-gray-800 mt-4">
                    <span className={`text-[10px] uppercase ${creatorStyles.text}`}>
                        Created by: {mission.creatorPlatoon}
                    </span>
                  {canManage ? (
                    <div className="flex space-x-2">
                      <button onClick={() => onEdit(mission)} className="p-1.5 bg-blue-900/30 text-blue-400 border border-blue-900 hover:bg-blue-900 hover:text-white rounded-sm transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(mission.id, mission.title)} className="p-1.5 bg-red-900/30 text-red-400 border border-red-900 hover:bg-red-900 hover:text-white rounded-sm transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px] text-gray-600 flex items-center">
                        READ ONLY
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div className="mt-8 text-center text-[10px] text-gray-700 font-mono tracking-widest">
        SECURE TERMINAL CONNECTION ESTABLISHED • VER 2.2.0 • BRM5
      </div>
    </div>
  );
};

export default MissionList;