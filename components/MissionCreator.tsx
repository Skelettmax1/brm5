import React, { useState, useEffect } from 'react';
import { Plus, Edit, Loader2, ArrowLeft, Save } from 'lucide-react';
import { User, Mission, Platoon, ScenarioType } from '../types';
import { db } from '../services/localDb';
import { SCENARIO_TYPES, PLATOON_OPTIONS, FULL_VISIBILITY_ROLES } from '../constants';
import { Header, InputField, SelectField, Button } from './UIComponents';

interface MissionCreatorProps {
  user: User;
  missionToEdit?: Mission;
  onCancel: () => void;
  onSaveSuccess: () => void;
}

const MissionCreator: React.FC<MissionCreatorProps> = ({ user, missionToEdit, onCancel, onSaveSuccess }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  const initialMissionState = {
    title: '',
    scenarioType: 'RESCUE' as ScenarioType,
    assignedPlatoon: 'GENERAL' as Platoon,
    objective: '',
    description: '',
    assets: '',
  };

  const [formData, setFormData] = useState(initialMissionState);

  useEffect(() => {
    if (missionToEdit) {
      setFormData({
        title: missionToEdit.title,
        scenarioType: missionToEdit.scenarioType,
        assignedPlatoon: missionToEdit.assignedPlatoon,
        objective: missionToEdit.objective,
        description: missionToEdit.description,
        assets: missionToEdit.assets,
      });
    }
  }, [missionToEdit]);

  const canAssignTo = (userPlatoon: Platoon, targetPlatoon: string) => {
    // 1. Always allow self-assignment or General assignment
    if (userPlatoon === targetPlatoon) return true;
    if (targetPlatoon === 'GENERAL') return true;

    // 2. High Command / Lieutenants / Red Platoon (Leaders) have full access
    if (FULL_VISIBILITY_ROLES.includes(userPlatoon)) return true;

    // 3. Allied logic (Green/Blue cooperation)
    if (userPlatoon === 'GRPL' && targetPlatoon === 'BLPL') return true;
    if (userPlatoon === 'BLPL' && targetPlatoon === 'GRPL') return true;

    return false;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    
    // Manual Validation to ensure feedback is visible
    if (!formData.title.trim()) {
        setMessage('ERROR: MISSION TITLE IS REQUIRED.');
        return;
    }
    if (!formData.objective.trim()) {
        setMessage('ERROR: PRIMARY OBJECTIVE IS REQUIRED.');
        return;
    }
    
    // Role validation
    if (!canAssignTo(user.platoon, formData.assignedPlatoon)) {
      setMessage(`ERROR: Platoon ${user.platoon} is not authorized to task ${formData.assignedPlatoon}.`);
      return;
    }

    setIsSaving(true);

    try {
      const missionPayload: Mission = {
        id: missionToEdit?.id || `mission-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        ...formData,
        creatorId: missionToEdit?.creatorId || user.id,
        creatorPlatoon: missionToEdit?.creatorPlatoon || user.platoon,
        createdAt: missionToEdit?.createdAt || Date.now(),
        updatedAt: Date.now(),
      };

      await db.saveMission(missionPayload);
      setMessage(missionToEdit ? 'STATUS: MISSION UPDATED.' : 'STATUS: MISSION LOGGED.');
      setTimeout(onSaveSuccess, 1000);
    } catch (error) {
      console.error(error);
      setMessage('ERROR: DATA UPLOAD FAILED.');
    } finally {
      setIsSaving(false);
    }
  };

  const availablePlatoonOptions = PLATOON_OPTIONS.filter(o => !o.hidden).map(option => ({
    ...option,
    disabled: !canAssignTo(user.platoon, option.value)
  }));

  // Ensure current selection is available even if technically restricted (for legacy/display purposes)
  if (missionToEdit && !canAssignTo(user.platoon, missionToEdit.assignedPlatoon)) {
    const current = PLATOON_OPTIONS.find(o => o.value === missionToEdit.assignedPlatoon);
    if(current) {
        availablePlatoonOptions.push({ ...current, disabled: false, label: `${current.label} (Current)` });
    }
  }

  return (
    <div className="p-6 bg-gray-950 min-h-full">
      <Header title={missionToEdit ? "MISSION: EDIT PARAMETERS" : "MISSION: NEW OPERATION"} Icon={missionToEdit ? Edit : Plus} />

      <form onSubmit={handleSubmit} className="bg-gray-900 p-6 rounded-sm border border-gray-800 shadow-lg max-w-4xl mx-auto">
        {message && (
          <div className={`p-3 mb-4 rounded-sm text-sm font-mono font-medium border ${message.startsWith('ERROR') ? 'bg-red-900/30 text-red-300 border-red-700' : 'bg-green-900/30 text-green-300 border-green-700'}`}>
            {message}
          </div>
        )}

        <InputField
          label="MISSION TITLE"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="OPERATION: RED DRAGON"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField
            label="SCENARIO TYPE"
            name="scenarioType"
            value={formData.scenarioType}
            onChange={handleChange}
            options={SCENARIO_TYPES}
            required
          />
          <SelectField
            label="ASSIGNED PLATOON"
            name="assignedPlatoon"
            value={formData.assignedPlatoon}
            onChange={handleChange}
            options={availablePlatoonOptions}
            required
          />
        </div>

        <InputField
          label="PRIMARY OBJECTIVE [MANDATORY]"
          name="objective"
          type="textarea"
          value={formData.objective}
          onChange={handleChange}
          placeholder="ELIMINATE HOSTILE COMMANDER IN SECTOR B. INTEL RETRIEVAL PRIORITY 1."
        />

        <InputField
          label="DETAILED BRIEFING"
          name="description"
          type="textarea"
          value={formData.description}
          onChange={handleChange}
          placeholder="Intel suggests heavy resistance. Terrain is mountainous."
        />

        <InputField
          label="REQUIRED ASSETS (CSV)"
          name="assets"
          type="textarea"
          value={formData.assets}
          onChange={handleChange}
          placeholder="M4A1, UAV, 2X MEDICS, EXPLOSIVES"
        />

        <div className="flex justify-between mt-6 pt-4 border-t border-gray-800">
          <Button onClick={onCancel} icon={ArrowLeft} className="bg-gray-700 hover:bg-gray-600 border-gray-600 text-gray-300">
            ABORT
          </Button>
          <Button type="submit" icon={isSaving ? Loader2 : Save} disabled={isSaving}>
            {isSaving ? (
              <span className="flex items-center"><Loader2 className="w-4 h-4 mr-2 animate-spin" /> UPLOADING...</span>
            ) : (missionToEdit ? 'SAVE CHANGES' : 'LOG MISSION')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MissionCreator;