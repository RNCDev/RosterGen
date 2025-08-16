'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Loader2, CheckCircle, AlertCircle, ExternalLink, MapPin, Calendar, Clock, Users, Info } from 'lucide-react';
import { useTeamSnapAuth } from '@/hooks/useTeamSnapAuth';

interface TeamSnapEventInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  groupId: number;
}

interface TeamSnapEventDetails {
  id: string;
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  location?: string;
  location_details?: string;
  address?: string;
  notes?: string;
  link?: string;
  time_zone?: string;
  time_zone_iana_name?: string;
  players: Array<{
    id: string;
    name: string;
    availability: 'yes' | 'no' | 'maybe' | null;
    availability_code: number;
  }>;
}

type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export function TeamSnapEventInfoDialog({
  open,
  onOpenChange,
  eventId,
  groupId,
}: TeamSnapEventInfoDialogProps) {
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [eventDetails, setEventDetails] = useState<TeamSnapEventDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, login } = useTeamSnapAuth();

  useEffect(() => {
    if (open && isAuthenticated && eventId) {
      fetchEventDetails();
    }
  }, [open, isAuthenticated, eventId]);

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
    if (!dateString) return 'Not specified';
    
    try {
      const date = new Date(dateString);
      
      // Format the date in the user's local timezone
      const formattedDate = date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: '2-digit',
        year: 'numeric'
      });
      
      // Check if the date string includes time
      if (dateString.includes('T') && dateString.includes(':')) {
        const formattedTime = date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
          timeZoneName: 'short'
        });
        return `${formattedDate} - ${formattedTime}`;
      }
      
      return formattedDate;
    } catch {
      return dateString;
    }
  };

  const getAvailabilityIcon = (availability: string | null) => {
    switch (availability) {
      case 'yes':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'no':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'maybe':
        return <Info className="h-4 w-4 text-yellow-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-400" />;
    }
  };

  const getAvailabilityText = (availability: string | null) => {
    switch (availability) {
      case 'yes':
        return 'Attending';
      case 'no':
        return 'Not Attending';
      case 'maybe':
        return 'Maybe';
      default:
        return 'No Response';
    }
  };

  const renderContent = () => {
    if (!isAuthenticated) {
      return (
        <div className="text-center space-y-4">
          <p className="text-gray-600">
            You need to connect your TeamSnap account to view event details.
          </p>
          <Button onClick={() => login()}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Connect to TeamSnap
          </Button>
        </div>
      );
    }

    switch (loadingState) {
      case 'loading':
        return (
          <div className="flex flex-col items-center justify-center h-40 space-y-2">
            <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
            <p className="text-lg font-medium">Loading Event Details...</p>
            <p className="text-sm text-gray-500">Fetching data from TeamSnap, please wait.</p>
          </div>
        );
      
      case 'error':
        return (
          <div className="flex flex-col items-center justify-center h-40 space-y-2">
            <AlertCircle className="h-10 w-10 text-red-500" />
            <p className="text-lg font-medium">Failed to Load Event</p>
            <p className="text-sm text-red-600 bg-red-100 p-2 rounded-md text-center max-w-xs">
              {error}
            </p>
            <Button onClick={fetchEventDetails} variant="outline">
              Try Again
            </Button>
          </div>
        );
      
      case 'success':
        if (!eventDetails) return null;

        const confirmedPlayers = eventDetails.players.filter(p => p.availability === 'yes');
        const maybePlayers = eventDetails.players.filter(p => p.availability === 'maybe');
        const declinedPlayers = eventDetails.players.filter(p => p.availability === 'no');
        const totalResponses = confirmedPlayers.length + maybePlayers.length + declinedPlayers.length;

        return (
          <div className="space-y-4">
            {totalResponses === 0 ? (
              <div className="text-center text-gray-500 py-4">
                No players have responded to the event yet.
              </div>
            ) : (
              <>
                {confirmedPlayers.length > 0 && (
                  <div>
                    <h4 className="text-base font-semibold text-gray-800 mb-2">✅ Confirmed ({confirmedPlayers.length})</h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto rounded-md border bg-gray-50 p-2">
                      {confirmedPlayers.map((player) => (
                        <p key={player.id} className="text-sm text-gray-700">{player.name}</p>
                      ))}
                    </div>
                  </div>
                )}
                {maybePlayers.length > 0 && (
                   <div>
                    <h4 className="text-base font-semibold text-gray-800 mb-2">❓ Maybe ({maybePlayers.length})</h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto rounded-md border bg-gray-50 p-2">
                      {maybePlayers.map((player) => (
                        <p key={player.id} className="text-sm text-gray-700">{player.name}</p>
                      ))}
                    </div>
                  </div>
                )}
                {declinedPlayers.length > 0 && (
                   <div>
                    <h4 className="text-base font-semibold text-gray-800 mb-2">❌ Declined ({declinedPlayers.length})</h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto rounded-md border bg-gray-50 p-2">
                      {declinedPlayers.map((player) => (
                        <p key={player.id} className="text-sm text-gray-700">{player.name}</p>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            TeamSnap Attendance
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
