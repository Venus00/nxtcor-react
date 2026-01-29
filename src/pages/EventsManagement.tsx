"use client"

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import MotionDetection, { type MotionDetectionConfig } from '../components/events/MotionDetection';
import TamperDetection, { type TamperDetectionConfig } from '../components/events/TamperDetection';
import SceneChanging, { type SceneChangingConfig } from '../components/events/SceneChanging';
import RegionalIntrusion, { type RegionalIntrusionConfig } from '../components/events/RegionalIntrusion';
import AbandonedObject, { type AbandonedObjectConfig } from '../components/events/AbandonedObject';
import FastMoving, { type FastMovingConfig } from '../components/events/FastMoving';
import CrowdDetection, { type CrowdDetectionConfig } from '../components/events/CrowdDetection';
import EventTable from '../components/events/EventTable';

const EventsManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'motion' | 'tamper' | 'scene' | 'intrusion' | 'abandoned' | 'fastmoving' | 'crowd' | 'detection-events' | 'intrusion-events'>('motion');
  const [isConfigurationOpen, setIsConfigurationOpen] = useState(false);
  const [motionDetection, setMotionDetection] = useState<MotionDetectionConfig>({
    enabled: false,
    antiDither: 5,
    record: false,
    recordDelay: 30,
    sendEmail: false,
    ptz: {
      enabled: false,
      actionType: 'preset',
      actionNumber: 0,
    },
    snapshot: false,
    scheduledPeriods: [],
    detectionAreas: [],
  });

  const [tamperDetection, setTamperDetection] = useState<TamperDetectionConfig>({
    enabled: false,
    antiDither: 5,
    record: false,
    recordDelay: 30,
    sendEmail: false,
    ptz: {
      enabled: false,
      actionType: 'preset',
      actionNumber: 0,
    },
    snapshot: false,
    scheduledPeriods: [],
    detectionAreas: [],
  });

  const [sceneChanging, setSceneChanging] = useState<SceneChangingConfig>({
    enabled: false,
    antiDither: 5,
    record: false,
    recordDelay: 30,
    sendEmail: false,
    ptz: {
      enabled: false,
      actionType: 'preset',
      actionNumber: 0,
    },
    snapshot: false,
    scheduledPeriods: [],
    detectionAreas: [],
  });

  const [regionalIntrusion, setRegionalIntrusion] = useState<RegionalIntrusionConfig>({
    enabled: false,
    antiDither: 5,
    record: false,
    recordDelay: 30,
    sendEmail: false,
    ptz: {
      enabled: false,
      actionType: 'preset',
      actionNumber: 0,
    },
    snapshot: false,
    scheduledPeriods: [],
    intrusionRules: [],
  });

  const [abandonedObject, setAbandonedObject] = useState<AbandonedObjectConfig>({
    enabled: false,
    antiDither: 5,
    record: false,
    recordDelay: 30,
    sendEmail: false,
    ptz: {
      enabled: false,
      actionType: 'preset',
      actionNumber: 0,
    },
    snapshot: false,
    scheduledPeriods: [],
    abandonedObjectRules: [],
  });

  const [fastMoving, setFastMoving] = useState<FastMovingConfig>({
    enabled: false,
    antiDither: 5,
    record: false,
    recordDelay: 30,
    sendEmail: false,
    ptz: {
      enabled: false,
      actionType: 'preset',
      actionNumber: 0,
    },
    snapshot: false,
    scheduledPeriods: [],
    fastMovingRules: [],
  });

  const [crowdDetection, setCrowdDetection] = useState<CrowdDetectionConfig>({
    enabled: false,
    antiDither: 5,
    record: false,
    recordDelay: 30,
    sendEmail: false,
    ptz: {
      enabled: false,
      actionType: 'preset',
      actionNumber: 0,
    },
    snapshot: false,
    scheduledPeriods: [],
    crowdDetectionRules: [],
  });

  const handleSaveMotionDetection = () => {
    console.log('Saving motion detection configuration:', motionDetection);
    alert('Configuration de la détection de mouvement enregistrée avec succès!');
  };

  const handleSaveTamperDetection = () => {
    console.log('Saving tamper detection configuration:', tamperDetection);
    alert('Configuration de la détection d\'effraction enregistrée avec succès!');
  };

  const handleSaveSceneChanging = () => {
    console.log('Saving scene changing configuration:', sceneChanging);
    alert('Configuration du changement de scène enregistrée avec succès!');
  };

  const handleSaveRegionalIntrusion = () => {
    console.log('Saving regional intrusion configuration:', regionalIntrusion);
    alert('Configuration de l\'intrusion régionale enregistrée avec succès!');
  };

  const handleSaveAbandonedObject = () => {
    console.log('Saving abandoned object configuration:', abandonedObject);
    alert('Configuration de l\'objet abandonné enregistrée avec succès!');
  };

  const handleSaveFastMoving = () => {
    console.log('Saving fast-moving configuration:', fastMoving);
    alert('Configuration du mouvement rapide enregistrée avec succès!');
  };

  const handleSaveCrowdDetection = () => {
    console.log('Saving crowd detection configuration:', crowdDetection);
    alert('Configuration de la détection de foule enregistrée avec succès!');
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Gestion des Événements</h1>
          <p className="text-gray-400">
            Configurer la détection d'événements et les paramètres d'alarme
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-gray-800/30 rounded-lg border border-gray-700 overflow-hidden mb-6">
          {/* Collapsible Configuration Header */}
          <button
            onClick={() => setIsConfigurationOpen(!isConfigurationOpen)}
            className="w-full flex items-center justify-between p-4 bg-gray-800/70 hover:bg-gray-800 transition-colors border-b border-gray-700"
          >
            <div>
              <h2 className="text-xl font-semibold text-white">Configuration des Événements</h2>
              <p className="text-gray-400 text-sm mt-1">
                Configurer la détection d'événements et les paramètres d'alarme
              </p>
            </div>
            {isConfigurationOpen ? (
              <ChevronUp className="w-6 h-6 text-gray-400" />
            ) : (
              <ChevronDown className="w-6 h-6 text-gray-400" />
            )}
          </button>

          {/* Collapsible Content */}
          {isConfigurationOpen && (
            <>
              {/* Tab Navigation */}
              <div className="bg-gray-800/50 border-b border-gray-700">
                <div className="px-4">
                  <div className="flex gap-2 overflow-x-auto">
                    {/* General Events Section Header */}
                    <div className="flex items-center px-3 py-4 text-gray-500 text-xs font-medium border-r border-gray-700">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      Événements Généraux
                    </div>

                    {/* Motion Detection Tab */}
                    <button
                      onClick={() => setActiveTab('motion')}
                      className={`flex-shrink-0 py-3 px-4 rounded-t-lg font-medium text-sm transition-all ${activeTab === 'motion'
                        ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Détection de Mouvement
                      </div>
                    </button>

                    {/* Tamper Detection Tab */}
                    <button
                      onClick={() => setActiveTab('tamper')}
                      className={`flex-shrink-0 py-3 px-4 rounded-t-lg font-medium text-sm transition-all ${activeTab === 'tamper'
                        ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Détection d'Effraction
                      </div>
                    </button>

                    {/* Scene Changing Tab */}
                    <button
                      onClick={() => setActiveTab('scene')}
                      className={`flex-shrink-0 py-3 px-4 rounded-t-lg font-medium text-sm transition-all ${activeTab === 'scene'
                        ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Changement de Scène
                      </div>
                    </button>

                    {/* Regional Intrusion Tab */}
                    <button
                      onClick={() => setActiveTab('intrusion')}
                      className={`flex-shrink-0 py-3 px-4 rounded-t-lg font-medium text-sm transition-all ${activeTab === 'intrusion'
                        ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.040A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Intrusion Régionale
                      </div>
                    </button>

                    {/* Abandoned Object Tab */}
                    <button
                      onClick={() => setActiveTab('abandoned')}
                      className={`flex-shrink-0 py-3 px-4 rounded-t-lg font-medium text-sm transition-all ${activeTab === 'abandoned'
                        ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        Objet Abandonné
                      </div>
                    </button>

                    {/* Fast-Moving Tab */}
                    <button
                      onClick={() => setActiveTab('fastmoving')}
                      className={`flex-shrink-0 py-3 px-4 rounded-t-lg font-medium text-sm transition-all ${activeTab === 'fastmoving'
                        ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Mouvement Rapide
                      </div>
                    </button>

                    {/* Crowd Detection Tab */}
                    <button
                      onClick={() => setActiveTab('crowd')}
                      className={`flex-shrink-0 py-3 px-4 rounded-t-lg font-medium text-sm transition-all ${activeTab === 'crowd'
                        ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Détection de Foule
                      </div>
                    </button>

                    {/* Events History Section Header */}
                    <div className="flex items-center px-3 py-4 text-gray-500 text-xs font-medium border-r border-l border-gray-700 ml-2">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Historique des Événements
                    </div>

                    {/* Detection Events Tab */}
                    <button
                      onClick={() => setActiveTab('detection-events')}
                      className={`flex-shrink-0 py-3 px-4 rounded-t-lg font-medium text-sm transition-all ${activeTab === 'detection-events'
                        ? 'bg-gradient-to-r from-cyan-600 to-cyan-700 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Événements de Détection
                      </div>
                    </button>

                    {/* Intrusion Events Tab */}
                    <button
                      onClick={() => setActiveTab('intrusion-events')}
                      className={`flex-shrink-0 py-3 px-4 rounded-t-lg font-medium text-sm transition-all ${activeTab === 'intrusion-events'
                        ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Événements d'Intrusion
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'motion' && (
                  <MotionDetection
                    config={motionDetection}
                    onConfigChange={setMotionDetection}
                    onSave={handleSaveMotionDetection}
                  />
                )}

                {activeTab === 'tamper' && (
                  <TamperDetection
                    config={tamperDetection}
                    onConfigChange={setTamperDetection}
                    onSave={handleSaveTamperDetection}
                  />
                )}

                {activeTab === 'scene' && (
                  <SceneChanging
                    config={sceneChanging}
                    onConfigChange={setSceneChanging}
                    onSave={handleSaveSceneChanging}
                  />
                )}

                {activeTab === 'intrusion' && (
                  <RegionalIntrusion
                    config={regionalIntrusion}
                    onConfigChange={setRegionalIntrusion}
                    onSave={handleSaveRegionalIntrusion}
                  />
                )}

                {activeTab === 'abandoned' && (
                  <AbandonedObject
                    config={abandonedObject}
                    onConfigChange={setAbandonedObject}
                    onSave={handleSaveAbandonedObject}
                  />
                )}

                {activeTab === 'fastmoving' && (
                  <FastMoving
                    config={fastMoving}
                    onConfigChange={setFastMoving}
                    onSave={handleSaveFastMoving}
                  />
                )}

                {activeTab === 'crowd' && (
                  <CrowdDetection
                    config={crowdDetection}
                    onConfigChange={setCrowdDetection}
                    onSave={handleSaveCrowdDetection}
                  />
                )}
              </div>
            </>
          )}
        </div>

        {/* Event History Tables - Always Visible */}
        {activeTab === 'detection-events' && (
          <EventTable eventType="detection" />
        )}

        {activeTab === 'intrusion-events' && (
          <EventTable eventType="intrusion" />
        )}
      </div>
    </div>
  );
};

export default EventsManagement;
