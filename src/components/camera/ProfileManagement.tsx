import type React from "react"
import { useState } from "react"

export interface ProfileManagementData {
  type: 'normal' | 'full-time' | 'schedule';
  fullTimeMode?: 'day' | 'night';
  scheduleDay?: {
    start: string; // HH:mm format
    end: string;
  };
  scheduleNight?: {
    start: string;
    end: string;
  };
}

interface ProfileManagementProps {
  settings: ProfileManagementData;
  onSettingsChange: (settings: ProfileManagementData) => void;
}

const ProfileManagement: React.FC<ProfileManagementProps> = ({ settings, onSettingsChange }) => {
  const [dayStart, setDayStart] = useState(settings.scheduleDay?.start || '07:00');
  const [dayEnd, setDayEnd] = useState(settings.scheduleDay?.end || '17:00');
  const [nightStart, setNightStart] = useState(settings.scheduleNight?.start || '17:00');
  const [nightEnd, setNightEnd] = useState(settings.scheduleNight?.end || '07:00');

  const handleTypeChange = (type: ProfileManagementData['type']) => {
    const newSettings: ProfileManagementData = { type };
    
    if (type === 'full-time') {
      newSettings.fullTimeMode = settings.fullTimeMode || 'day';
    } else if (type === 'schedule') {
      newSettings.scheduleDay = { start: dayStart, end: dayEnd };
      newSettings.scheduleNight = { start: nightStart, end: nightEnd };
    }
    
    onSettingsChange(newSettings);
  };

  const handleFullTimeModeChange = (mode: 'day' | 'night') => {
    onSettingsChange({ ...settings, fullTimeMode: mode });
  };

  const handleScheduleUpdate = () => {
    onSettingsChange({
      ...settings,
      scheduleDay: { start: dayStart, end: dayEnd },
      scheduleNight: { start: nightStart, end: nightEnd }
    });
  };

  const getTypeDescription = (type: ProfileManagementData['type']) => {
    const descriptions = {
      'normal': "La vidéo effectue la surveillance selon la configuration normale de la caméra. Aucun profil spécifique jour/nuit n'est appliqué.",
      'full-time': "Applique en permanence soit la configuration jour, soit la configuration nuit, indépendamment de l'heure réelle.",
      'schedule': "Permet de définir des plages horaires spécifiques pour les configurations jour et nuit. Par exemple, configuration jour de 7h00 à 17h00, et configuration nuit de 17h00 à 7h00."
    };
    return descriptions[type];
  };

  return (
    <div className="space-y-6">
      {/* Type Selection */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Type de Gestion de Profil</h2>
        <p className="text-gray-400 text-sm mb-6">
          Sélectionnez le mode de gestion des profils de configuration. Le type "Normal" est utilisé par défaut.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Normal Type */}
          <button
            onClick={() => handleTypeChange('normal')}
            className={`group relative py-6 px-5 rounded-lg font-medium transition-all text-left ${
              settings.type === 'normal'
                ? 'bg-red-600 text-white shadow-lg shadow-red-500/25'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                settings.type === 'normal' ? 'bg-white/20' : 'bg-gray-600'
              }`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-lg">Normal</div>
                <div className="text-xs mt-1 opacity-90">Configuration standard</div>
              </div>
            </div>
            {settings.type === 'normal' && (
              <div className="absolute top-2 right-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            )}
          </button>

          {/* Full Time Type */}
          <button
            onClick={() => handleTypeChange('full-time')}
            className={`group relative py-6 px-5 rounded-lg font-medium transition-all text-left ${
              settings.type === 'full-time'
                ? 'bg-red-600 text-white shadow-lg shadow-red-500/25'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                settings.type === 'full-time' ? 'bg-white/20' : 'bg-gray-600'
              }`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-lg">Full Time</div>
                <div className="text-xs mt-1 opacity-90">Jour ou Nuit permanent</div>
              </div>
            </div>
            {settings.type === 'full-time' && (
              <div className="absolute top-2 right-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            )}
          </button>

          {/* Schedule Type */}
          <button
            onClick={() => handleTypeChange('schedule')}
            className={`group relative py-6 px-5 rounded-lg font-medium transition-all text-left ${
              settings.type === 'schedule'
                ? 'bg-red-600 text-white shadow-lg shadow-red-500/25'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                settings.type === 'schedule' ? 'bg-white/20' : 'bg-gray-600'
              }`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-lg">Schedule</div>
                <div className="text-xs mt-1 opacity-90">Plages horaires</div>
              </div>
            </div>
            {settings.type === 'schedule' && (
              <div className="absolute top-2 right-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            )}
          </button>
        </div>

        {/* Type Description */}
        <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-600">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-300 text-sm leading-relaxed">
              {getTypeDescription(settings.type)}
            </p>
          </div>
        </div>
      </div>

      {/* Full Time Mode Selection - Only shown when type is full-time */}
      {settings.type === 'full-time' && (
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">Mode Full Time</h2>
          <p className="text-gray-400 text-sm mb-6">
            Sélectionnez si vous souhaitez appliquer en permanence la configuration jour ou la configuration nuit.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Day Mode */}
            <button
              onClick={() => handleFullTimeModeChange('day')}
              className={`group relative py-8 px-6 rounded-lg font-medium transition-all text-left ${
                settings.fullTimeMode === 'day'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-500/25'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <div className="flex flex-col items-center text-center gap-3">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  settings.fullTimeMode === 'day' ? 'bg-white/20' : 'bg-gray-600'
                }`}>
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-xl">Jour</div>
                  <div className="text-sm mt-2 opacity-90">Configuration jour en permanence</div>
                </div>
              </div>
              {settings.fullTimeMode === 'day' && (
                <div className="absolute top-3 right-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                </div>
              )}
            </button>

            {/* Night Mode */}
            <button
              onClick={() => handleFullTimeModeChange('night')}
              className={`group relative py-8 px-6 rounded-lg font-medium transition-all text-left ${
                settings.fullTimeMode === 'night'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-500/25'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <div className="flex flex-col items-center text-center gap-3">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  settings.fullTimeMode === 'night' ? 'bg-white/20' : 'bg-gray-600'
                }`}>
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-xl">Nuit</div>
                  <div className="text-sm mt-2 opacity-90">Configuration nuit en permanence</div>
                </div>
              </div>
              {settings.fullTimeMode === 'night' && (
                <div className="absolute top-3 right-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                </div>
              )}
            </button>
          </div>

          <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <div className="text-sm text-blue-300">
                <p className="font-semibold mb-1">Note :</p>
                <p className="text-xs">
                  En mode "Jour", la caméra utilisera toujours les paramètres optimisés pour un éclairage fort.
                  En mode "Nuit", elle utilisera les paramètres pour faible luminosité avec IR si disponible.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Configuration - Only shown when type is schedule */}
      {settings.type === 'schedule' && (
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">Configuration Planifiée</h2>
          <p className="text-gray-400 text-sm mb-6">
            Définissez les plages horaires pour les configurations jour et nuit. Par exemple, configuration jour de 7h00 à 17h00, et configuration nuit de 17h00 à 7h00.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Day Schedule */}
            <div className="p-5 bg-gradient-to-br from-yellow-900/20 to-orange-900/10 rounded-lg border border-yellow-700/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-yellow-600/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Configuration Jour</h3>
                  <p className="text-xs text-gray-400">Période d'éclairage fort</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Heure de Début
                  </label>
                  <input
                    type="time"
                    value={dayStart}
                    onChange={(e) => setDayStart(e.target.value)}
                    onBlur={handleScheduleUpdate}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Heure de Fin
                  </label>
                  <input
                    type="time"
                    value={dayEnd}
                    onChange={(e) => setDayEnd(e.target.value)}
                    onBlur={handleScheduleUpdate}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Night Schedule */}
            <div className="p-5 bg-gradient-to-br from-blue-900/20 to-indigo-900/10 rounded-lg border border-blue-700/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Configuration Nuit</h3>
                  <p className="text-xs text-gray-400">Période de faible luminosité</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Heure de Début
                  </label>
                  <input
                    type="time"
                    value={nightStart}
                    onChange={(e) => setNightStart(e.target.value)}
                    onBlur={handleScheduleUpdate}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Heure de Fin
                  </label>
                  <input
                    type="time"
                    value={nightEnd}
                    onChange={(e) => setNightEnd(e.target.value)}
                    onBlur={handleScheduleUpdate}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Preview */}
          <div className="mt-6 p-4 bg-gray-900/50 rounded-lg border border-gray-600">
            <h4 className="text-sm font-semibold text-white mb-3">Aperçu de la Planification</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                <span className="text-gray-300">Jour: {dayStart} → {dayEnd}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                <span className="text-gray-300">Nuit: {nightStart} → {nightEnd}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-green-900/20 border border-green-700/30 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-green-300">
                <p className="font-semibold mb-1">Exemple d'utilisation :</p>
                <p className="text-xs">
                  Configuration Jour: 07:00 - 17:00 (10 heures d'éclairage fort)<br />
                  Configuration Nuit: 17:00 - 07:00 (14 heures de faible luminosité)
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Summary */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">État Actuel</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-900/30 rounded-lg">
            <div className="text-gray-400 text-xs mb-2">Type de Gestion</div>
            <div className="text-white font-bold text-lg">
              {settings.type === 'normal' ? 'Normal' : 
               settings.type === 'full-time' ? 'Full Time' : 
               'Schedule'}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-xs text-gray-400">Actif</span>
            </div>
          </div>
          
          <div className="p-4 bg-gray-900/30 rounded-lg">
            <div className="text-gray-400 text-xs mb-2">Configuration Appliquée</div>
            <div className="text-white font-bold text-lg">
              {settings.type === 'normal' ? 'Standard' :
               settings.type === 'full-time' ? (settings.fullTimeMode === 'day' ? 'Jour Permanent' : 'Nuit Permanente') :
               'Planification Automatique'}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                settings.type === 'normal' ? 'bg-blue-400' :
                settings.type === 'full-time' && settings.fullTimeMode === 'day' ? 'bg-yellow-400' :
                settings.type === 'full-time' && settings.fullTimeMode === 'night' ? 'bg-indigo-400' :
                'bg-purple-400'
              }`}></div>
              <span className="text-xs text-gray-400">
                {settings.type === 'schedule' ? `Jour: ${dayStart}-${dayEnd}` : 'Actif'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileManagement;
