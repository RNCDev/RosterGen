'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Loader2, CheckCircle, AlertCircle, X, RefreshCw } from 'lucide-react';
import { useTeamSnapAuth } from '@/hooks/useTeamSnapAuth';

interface TeamSnapInlineViewProps {
  eventId: string;
  groupId: number;
  onClose: () => void;
}

interface TeamSnapEventDetails {
  id: string;
  name: string;
  start_date: string;
  location?: string;
  notes?: string;
  players: Array<{
    id: string;
    name: string;
    availability?: string;
  }>;
}

type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export function TeamSnapInlineView({
  eventId,
  groupId,
  onClose,
}: TeamSnapInlineViewProps) {
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [eventDetails, setEventDetails] = useState<TeamSnapEventDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, login } = useTeamSnapAuth();

  useEffect(() => {
    if (isAuthenticated && eventId) {
      fetchEventDetails();
    }
  }, [isAuthenticated, eventId]);

  const fetchEventDetails = async () => {
    if (!eventId) return;
    
    setLoadingState('loading');
    setError(null);
    
    try {
      const response = await fetch(`/api/teamsnap/events/details?eventId=${eventId}&groupId=${groupId}`);
      const data = await response.json();
      
      if (data.success) {
        setEventDetails(data.event);
        setLoadingState('success');
      } else {
        setError(data.error || 'Failed to fetch event details');
        setLoadingState('error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
      setLoadingState('error');
    }
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'No date specified';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const renderContent = () => {
    if (!isAuthenticated) {
      return (
        <div className="text-center py-6">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Authentication Required</h4>
          <p className="text-gray-600 mb-4">
            You need to connect your TeamSnap account to view event details.
          </p>
          <Button onClick={() => login()} className="btn-primary">
            Connect TeamSnap
          </Button>
        </div>
      );
    }

    switch (loadingState) {
      case 'loading':
        return (
          <div className="text-center py-6">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading TeamSnap event details...</p>
          </div>
        );

      case 'error':
        return (
          <div className="text-center py-6">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Event</h4>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchEventDetails} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        );
      
      case 'success':
        if (!eventDetails) return null;

        const confirmedPlayers = eventDetails.players.filter(p => p.availability === 'yes');
        const maybePlayers = eventDetails.players.filter(p => p.availability === 'maybe');
        const declinedPlayers = eventDetails.players.filter(p => p.availability === 'no');
        const noResponsePlayers = eventDetails.players.filter(p => !['yes', 'no', 'maybe'].includes(p.availability!));

        return (
          <div className="space-y-4">
            {/* Event Details Header */}
            <div className="border-b border-gray-200 pb-3">
              <h4 className="text-lg font-semibold text-gray-900">{eventDetails.name}</h4>
              <p className="text-sm text-gray-600">{formatDateTime(eventDetails.start_date)}</p>
              {eventDetails.location && (
                <p className="text-sm text-gray-600">{eventDetails.location}</p>
              )}
            </div>

            {/* Attendance Lists */}
            {eventDetails.players.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                No players found for this event.
              </div>
            ) : (
              <div className="space-y-4">
                {confirmedPlayers.length > 0 && (
                  <div>
                    <h5 className="text-sm font-semibold text-green-800 mb-2">
                      ✅ Confirmed ({confirmedPlayers.length})
                    </h5>
                    <div className="space-y-1 max-h-32 overflow-y-auto rounded-md border border-green-200 bg-green-50 p-3">
                      {confirmedPlayers.map((player) => (
                        <p key={player.id} className="text-sm text-green-800">{player.name}</p>
                      ))}
                    </div>
                  </div>
                )}

                {maybePlayers.length > 0 && (
                  <div>
                    <h5 className="text-sm font-semibold text-amber-800 mb-2">
                      ❓ Maybe ({maybePlayers.length})
                    </h5>
                    <div className="space-y-1 max-h-32 overflow-y-auto rounded-md border border-amber-200 bg-amber-50 p-3">
                      {maybePlayers.map((player) => (
                        <p key={player.id} className="text-sm text-amber-800">{player.name}</p>
                      ))}
                    </div>
                  </div>
                )}

                {declinedPlayers.length > 0 && (
                  <div>
                    <h5 className="text-sm font-semibold text-red-800 mb-2">
                      ❌ Declined ({declinedPlayers.length})
                    </h5>
                    <div className="space-y-1 max-h-32 overflow-y-auto rounded-md border border-red-200 bg-red-50 p-3">
                      {declinedPlayers.map((player) => (
                        <p key={player.id} className="text-sm text-red-800">{player.name}</p>
                      ))}
                    </div>
                  </div>
                )}

                {noResponsePlayers.length > 0 && (
                  <div>
                    <h5 className="text-sm font-semibold text-gray-800 mb-2">
                      ⏳ No Response ({noResponsePlayers.length})
                    </h5>
                    <div className="space-y-1 max-h-32 overflow-y-auto rounded-md border border-gray-200 bg-gray-50 p-3">
                      {noResponsePlayers.map((player) => (
                        <p key={player.id} className="text-sm text-gray-800">{player.name}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Header with close button */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">TeamSnap Attendance</h3>
        <Button
          onClick={onClose}
          variant="outline"
          size="sm"
          className="p-1"
        >
          <X className="w-4 h-4" />
          <span className="sr-only">Close</span>
        </Button>
      </div>

      {/* Content */}
      <div className="p-4">
        {renderContent()}
      </div>
    </div>
  );
}
