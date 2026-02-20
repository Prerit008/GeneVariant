// components/DrugInput.jsx
import React, { useState } from 'react';

const SUGGESTED_DRUGS = [
  'CODEINE',
  'WARFARIN',
  'CLOPIDOGREL',
  'SIMVASTATIN',
  'AZATHIOPRINE',
  'FLUOROURACIL'
];

const DRUG_COLORS = {
  'CODEINE': 'from-blue-50 to-blue-100 border-blue-200 text-blue-700',
  'WARFARIN': 'from-purple-50 to-purple-100 border-purple-200 text-purple-700',
  'CLOPIDOGREL': 'from-green-50 to-green-100 border-green-200 text-green-700',
  'SIMVASTATIN': 'from-amber-50 to-amber-100 border-amber-200 text-amber-700',
  'AZATHIOPRINE': 'from-rose-50 to-rose-100 border-rose-200 text-rose-700',
  'FLUOROURACIL': 'from-indigo-50 to-indigo-100 border-indigo-200 text-indigo-700'
};

const DrugInput = ({ selectedDrug, onDrugsChange }) => {
  const [inputValue, setInputValue] = useState(selectedDrug || '');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleInputChange = (e) => {
    setInputValue(e.target.value.toUpperCase());
    setShowSuggestions(true);
  };

  const handleSelect = (drug) => {
    onDrugsChange(drug);       // send single value to parent
    setInputValue(drug);
    setShowSuggestions(false);
  };

  const filteredSuggestions = SUGGESTED_DRUGS.filter(
    drug => drug.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <div className="w-1 h-6 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full"></div>
        <label className="text-sm font-semibold text-slate-700 tracking-wide">
          Medication
        </label>
      </div>

      <div className="relative">
        <div className="relative group">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-200">
            <i className="fas fa-search text-sm"></i>
          </div>

          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Search or select drug"
            className="w-full pl-9 pr-4 py-2.5 bg-white border-2 border-slate-100 
                     rounded-xl focus:outline-none focus:border-blue-400 
                     transition-all duration-200 placeholder:text-slate-400
                     text-slate-700 font-medium " 
          />

          {selectedDrug && (
            <button
              onClick={() => {
                onDrugsChange(null);
                setInputValue('');
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 
                       text-slate-400 hover:text-slate-600 transition-colors"
            >
              <i className="fas fa-times-circle"></i>
            </button>
          )}
        </div>

        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 sticky top-24 max-h-[80vh] overflow-y-auto">
            <div className="py-1">
              {filteredSuggestions.map((drug, index) => (
                <button
                  key={drug}
                  onClick={() => handleSelect(drug)}
                  className={`w-full text-left px-4 py-2.5 hover:bg-gradient-to-r 
                           ${DRUG_COLORS[drug]} transition-all duration-150
                           ${index !== filteredSuggestions.length - 1 ? 'border-b border-slate-50' : ''}`}
                >
                  {drug}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DrugInput;