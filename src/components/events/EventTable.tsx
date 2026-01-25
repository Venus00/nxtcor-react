import React, { useState, useEffect } from 'react';
import axios from 'axios';

export interface EventRecord {
  id: string;
  timestamp: string;
  eventType: string;
  classification: string;
  snapshotUrl: string;
  confidence?: number;
  details?: string;
  objectId?: number | null;
  dateFolder?: string;
  filename?: string;
}

interface DetectionPhoto {
  filename: string;
  dateFolder: string;
  classification: string;
  timestamp: string;
  score: number;
  objectId: number | null;
  path: string;
  size: number;
}

const API_BASE_URL = `http://${window.location.hostname}:3000`;

const EventTable: React.FC = () => {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventRecord | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchDate, setSearchDate] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      // Fetch detection photos from the API
      const response = await axios.get(`${API_BASE_URL}/detection/photos`, {
        params: {
          limit: 100,
          // Add filters if needed
          ...(filterType !== 'all' && { classification: filterType.toLowerCase() }),
          ...(searchDate && { startDate: new Date(searchDate).toISOString() })
        }
      });

      if (response.data.success && response.data.photos) {
        // Convert detection photos to event records
        const eventRecords: EventRecord[] = response.data.photos.map((photo: DetectionPhoto, index: number) => ({
          id: `${photo.timestamp}-${index}`,
          timestamp: photo.timestamp,
          eventType: 'Object Detection',
          classification: photo.classification.charAt(0).toUpperCase() + photo.classification.slice(1),
          snapshotUrl: `${API_BASE_URL}${photo.path}`,
          confidence: photo.score,
          objectId: photo.objectId,
          dateFolder: photo.dateFolder,
          filename: photo.filename,
          details: `Object ID: ${photo.objectId || 'N/A'} | Score: ${photo.score}%`
        }));

        setEvents(eventRecords);
      } else {
        setEvents([]);
      }
    } catch (error) {
      console.error('Error fetching detection photos:', error);
      // Set empty array if API fails
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement?')) return;

    try {
      // await axios.post('/cgi-bin/deleteEvent.cgi', { eventId });
      setEvents(events.filter(e => e.id !== eventId));
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const handleClearAll = async () => {

    if (!confirm('Êtes-vous sûr de vouloir effacer tous les événements?')) return;

    try {
      const response = await axios.delete(`${API_BASE_URL}/detection/photos`);

      if (response.data.success) {
        setEvents([]);
        alert(`${response.data.deleted} photos supprimées avec succès`);
      } else {
        alert('Erreur lors de la suppression des photos');
      }
    } catch (error) {
      console.error('Error clearing events:', error);
      alert('Erreur lors de la suppression des événements');
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getEventTypeColor = (eventType: string) => {
    const colors: { [key: string]: string } = {
      'Détection de Mouvement': 'bg-red-500/20 text-red-400 border-red-500/30',
      'Détection d\'Effraction': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'Changement de Scène': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'Intrusion Régionale': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'Objet Abandonné': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'Mouvement Rapide': 'bg-green-500/20 text-green-400 border-green-500/30',
      'Détection de Foule': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      'Détection d\'Objet': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      // Keep English versions for backward compatibility
      'Motion Detection': 'bg-red-500/20 text-red-400 border-red-500/30',
      'Tamper Detection': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'Scene Changing': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'Regional Intrusion': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'Abandoned Object': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'Fast-Moving': 'bg-green-500/20 text-green-400 border-green-500/30',
      'Crowd Detection': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      'Object Detection': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    };
    return colors[eventType] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const filteredEvents = events.filter(event => {
    const matchesType = filterType === 'all' || event.eventType === filterType;
    const matchesDate = !searchDate || event.timestamp.includes(searchDate);
    return matchesType && matchesDate;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredEvents.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, searchDate]);

  return (
    <div className="mt-6 bg-gray-800/30 rounded-lg border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800/50 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Historique des Événements</h2>
            <p className="text-sm text-gray-400">Événements détectés avec captures d'écran et classifications</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchEvents}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualiser
            </button>

            <button
              onClick={handleClearAll}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Tout Effacer
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4 flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-400 mb-2">Filtrer par Type d'Événement</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les Événements</option>
              <option value="Motion Detection">Détection de Mouvement</option>
              <option value="Tamper Detection">Détection d'Effraction</option>
              <option value="Scene Changing">Changement de Scène</option>
              <option value="Regional Intrusion">Intrusion Régionale</option>
              <option value="Abandoned Object">Objet Abandonné</option>
              <option value="Fast-Moving">Mouvement Rapide</option>
              <option value="Crowd Detection">Détection de Foule</option>
              <option value="Object Detection">Détection d'Objet</option>
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-400 mb-2">Rechercher par Date</label>
            <input
              type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Event Count */}
      <div className="px-4 py-2 bg-gray-800/30 border-b border-gray-700">
        <p className="text-sm text-gray-400">
          Affichage de <span className="font-semibold text-white">{startIndex + 1}-{Math.min(endIndex, filteredEvents.length)}</span> sur <span className="font-semibold text-white">{filteredEvents.length}</span> événements
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-400">Chargement des événements...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="mt-2 text-gray-400">Aucun événement trouvé</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-800/50 border-b border-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Crop</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date et Heure</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Classification</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Object ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Score</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {paginatedEvents.map((event) => (
                <tr
                  key={event.id}
                  className="hover:bg-gray-800/30 transition-colors cursor-pointer"
                  onClick={() => setSelectedEvent(event)}
                >
                  <td className="px-4 py-3">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-700 flex items-center justify-center">
                      {event.snapshotUrl ? (
                        <img
                          src={event.snapshotUrl}
                          alt="Event crop"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect fill="%23374151" width="80" height="80"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239CA3AF" font-size="12"%3ENo Image%3C/text%3E%3C/svg%3E';
                          }}
                        />
                      ) : (
                        <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-white font-medium">{formatDate(event.timestamp).split(',')[0]}</div>
                    <div className="text-xs text-gray-400">{formatDate(event.timestamp).split(',')[1]}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-white font-medium">{event.classification}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-white font-medium">
                      {event.objectId !== null && event.objectId !== undefined ? `#${event.objectId}` : 'N/A'}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {event.confidence !== undefined && (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-700 rounded-full h-2 max-w-[60px]">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${event.confidence}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-400">{event.confidence}%</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEvent(event.id);
                      }}
                      className="text-red-400 hover:text-red-300 transition-colors"
                      title="Delete Event"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Controls */}
      {!loading && filteredEvents.length > 0 && (
        <div className="px-4 py-3 bg-gray-800/30 border-t border-gray-700 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Page <span className="font-semibold text-white">{currentPage}</span> sur <span className="font-semibold text-white">{totalPages}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded text-sm font-medium transition-colors disabled:cursor-not-allowed"
            >
              ««
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded text-sm font-medium transition-colors disabled:cursor-not-allowed"
            >
              «
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  // Show first page, last page, current page, and adjacent pages
                  return page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1);
                })
                .map((page, index, array) => (
                  <React.Fragment key={page}>
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="px-2 text-gray-500">...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-white'
                        }`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                ))}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded text-sm font-medium transition-colors disabled:cursor-not-allowed"
            >
              »
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded text-sm font-medium transition-colors disabled:cursor-not-allowed"
            >
              »»
            </button>
          </div>

          <div className="text-sm text-gray-400">
            {rowsPerPage} lignes par page
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Détails de l'Événement</h3>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Images Side by Side */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Full Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Full Image</label>
                    <div className="w-full rounded-lg overflow-hidden bg-gray-900">
                      <img
                        src={selectedEvent.filename ? `${API_BASE_URL}/detection/photos/${selectedEvent.dateFolder}/${selectedEvent.filename.replace('crop_ther', 'full').replace('crop_full', 'full')}` : selectedEvent.snapshotUrl}
                        alt="Full image"
                        className="w-full h-auto"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23374151" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239CA3AF" font-size="16"%3EFull Image Not Available%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    </div>
                  </div>

                  {/* Crop Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Cropped Detection</label>
                    <div className="w-full rounded-lg overflow-hidden bg-gray-900">
                      <img
                        src={selectedEvent.snapshotUrl}
                        alt="Cropped detection"
                        className="w-full h-auto"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23374151" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239CA3AF" font-size="16"%3ECrop Not Available%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Event Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Classification</label>
                    <p className="text-white font-medium">{selectedEvent.classification}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Object ID</label>
                    <p className="text-white font-medium">
                      {selectedEvent.objectId !== null && selectedEvent.objectId !== undefined ? `#${selectedEvent.objectId}` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Date et Heure</label>
                    <p className="text-white">{formatDate(selectedEvent.timestamp)}</p>
                  </div>
                  {selectedEvent.confidence !== undefined && (
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Score</label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-700 rounded-full h-2 max-w-[120px]">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${selectedEvent.confidence}%` }}
                          ></div>
                        </div>
                        <span className="text-white font-medium">{selectedEvent.confidence}%</span>
                      </div>
                    </div>
                  )}
                </div>

                {selectedEvent.details && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Détails</label>
                    <p className="text-white">{selectedEvent.details}</p>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4 border-t border-gray-700">
                  <button
                    onClick={() => {
                      handleDeleteEvent(selectedEvent.id);
                      setSelectedEvent(null);
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Supprimer l'Événement
                  </button>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventTable;
