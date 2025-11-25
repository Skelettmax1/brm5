import React, { useState, useRef } from 'react';
import { LogIn, Loader2, UserPlus } from 'lucide-react';
import { db } from '../services/localDb';
import { User, Platoon } from '../types';
import { Header, InputField, Button, SelectField } from './UIComponents';
import { PLATOON_OPTIONS } from '../constants';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [credentials, setCredentials] = useState({ 
    username: '', 
    password: '',
    name: '',
    platoon: 'GENERAL' as Platoon
  });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);

    try {
      let user: User;
      if (isRegistering) {
        if (!credentials.name || !credentials.platoon) {
            throw new Error("All fields are required for registration.");
        }
        // Force checking platoon assignment validity
        if (credentials.platoon === 'GENERAL') {
             throw new Error("Invalid Unit Assignment. Please select a specific Platoon.");
        }

        user = await db.register(
            credentials.username, 
            credentials.password, 
            credentials.name, 
            credentials.platoon
        );
        setMessage('REGISTRATION SUCCESSFUL. INITIALIZING...');
      } else {
        user = await db.login(credentials.username, credentials.password);
        setMessage('ACCESS GRANTED. INITIALIZING...');
      }
      
      setTimeout(() => onLoginSuccess(user), 800);
    } catch (error: any) {
      console.error(error);
      setMessage(`ERROR: ${error.message || 'AUTHENTICATION FAILED'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    const nextMode = !isRegistering;
    setIsRegistering(nextMode);
    setMessage('');
    // BUG FIX: When switching to register, default to RDPL because GENERAL is not allowed
    setCredentials({ 
        username: '', 
        password: '', 
        name: '', 
        platoon: nextMode ? 'RDPL' : 'GENERAL' 
    });
  };

  // Filter out the general/hidden options for registration to force a specific role
  const registrationPlatoonOptions = PLATOON_OPTIONS.filter(p => !p.hidden && p.value !== 'GENERAL');

  return (
    <div className="flex justify-center items-center h-[calc(100vh-8rem)] p-4">
      <div className="w-full max-w-md bg-gray-900 p-8 rounded-sm shadow-xl border border-gray-700 relative overflow-hidden transition-all duration-300">
        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-red-500"></div>
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-red-500"></div>
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-red-500"></div>
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-red-500"></div>

        <Header title={isRegistering ? "NEW OPERATOR ENTRY" : "ACCESS PROTOCOL"} Icon={isRegistering ? UserPlus : LogIn} />

        {message && (
          <div className={`p-3 mb-4 rounded-sm text-sm font-mono font-medium border ${message.startsWith('ERROR') ? 'bg-red-900/50 text-red-300 border-red-700' : 'bg-green-900/50 text-green-300 border-green-700'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <InputField
            label="OPERATOR ID"
            name="username"
            value={credentials.username}
            onChange={handleChange}
            placeholder={isRegistering ? "Create unique ID" : "ID required"}
            required
          />
          
          {isRegistering && (
            <>
                <InputField
                    label="DISPLAY NAME"
                    name="name"
                    value={credentials.name}
                    onChange={handleChange}
                    placeholder="e.g. Cpt. Price"
                    required
                />
                <SelectField
                    label="UNIT ASSIGNMENT"
                    name="platoon"
                    value={credentials.platoon}
                    onChange={handleChange}
                    options={registrationPlatoonOptions}
                    required
                />
            </>
          )}

          <InputField
            label="ACCESS KEY"
            name="password"
            type="password"
            value={credentials.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />

          <Button type="submit" icon={isLoading ? Loader2 : (isRegistering ? UserPlus : LogIn)} disabled={isLoading} className="w-full mt-4">
            {isLoading ? (
              <span className="flex items-center"><Loader2 className="w-5 h-5 mr-2 animate-spin" /> PROCESSING...</span>
            ) : (
              isRegistering ? 'INITIALIZE RECORD' : 'CONFIRM LOGIN'
            )}
          </Button>
        </form>

        <div className="mt-4 text-center">
            <button 
                type="button" 
                onClick={toggleMode}
                className="text-xs text-green-500 hover:text-green-400 font-mono underline decoration-dotted underline-offset-4"
            >
                {isRegistering ? "[ RETURN TO LOGIN ]" : "[ CREATE NEW OPERATOR PROFILE ]"}
            </button>
        </div>
        
        <div className="mt-6 text-center text-[10px] text-gray-600 font-mono">
            SECURE SERVER CONNECTION ACTIVE
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
