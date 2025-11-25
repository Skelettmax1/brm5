import React from 'react';
import { Loader2 } from 'lucide-react';

export const Header = ({ title, Icon }: { title: string; Icon: React.ElementType }) => (
  <h2 className="text-2xl font-bold mb-6 flex items-center text-gray-300 tracking-wider font-mono border-b border-gray-700 pb-2">
    <Icon className="w-6 h-6 mr-3 text-red-500" />
    {title}
  </h2>
);

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  type?: 'text' | 'password' | 'textarea';
  required?: boolean;
  name: string;
}

export const InputField: React.FC<InputFieldProps> = ({ label, value, onChange, placeholder, type = 'text', required = false, name }) => (
  <div className="mb-4">
    <label className="block text-gray-500 text-sm font-semibold mb-1 font-mono">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {type === 'textarea' ? (
      <textarea
        name={name}
        className="w-full p-2 border border-gray-700 bg-gray-800 text-gray-300 rounded-sm font-mono focus:border-green-500 focus:ring-1 focus:ring-green-500 transition duration-150 outline-none"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        rows={4}
      />
    ) : (
      <input
        name={name}
        type={type}
        className="w-full p-2 border border-gray-700 bg-gray-800 text-gray-300 rounded-sm font-mono focus:border-green-500 focus:ring-1 focus:ring-green-500 transition duration-150 outline-none"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
      />
    )}
  </div>
);

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string; disabled?: boolean; hidden?: boolean }[];
  required?: boolean;
  name: string;
  disabled?: boolean;
}

export const SelectField: React.FC<SelectFieldProps> = ({ label, value, onChange, options, required = false, name, disabled = false }) => (
  <div className="mb-4">
    <label className="block text-gray-500 text-sm font-semibold mb-1 font-mono">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      className={`w-full p-2 border border-gray-700 bg-gray-800 text-gray-300 rounded-sm font-mono focus:border-green-500 focus:ring-1 focus:ring-green-500 transition duration-150 outline-none ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
    >
      {options.map(option => (
        <option key={option.value} value={option.value} disabled={option.disabled} className="bg-gray-800 text-gray-300">
            {option.label} {option.disabled && '(Access Denied)'}
        </option>
      ))}
    </select>
  </div>
);

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  icon?: React.ElementType;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export const Button: React.FC<ButtonProps> = ({ children, onClick, icon: Icon, className = '', disabled = false, type = 'button' }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 rounded-sm font-semibold transition duration-200 font-mono text-sm tracking-wider flex items-center justify-center 
                ${disabled ? 'bg-gray-700 text-gray-500 cursor-not-allowed border border-gray-600' : 'bg-green-700 hover:bg-green-600 text-white border border-green-500'} ${className}`}
  >
    {Icon && <Icon className="w-4 h-4 mr-2" />}
    {children}
  </button>
);