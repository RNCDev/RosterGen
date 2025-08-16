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
          hour12: true
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
        return (
          <div className="space-y-6">
            {/* Event Header */}
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900">{eventDetails.name}</h3>
              {eventDetails.description && (
                <p className="text-gray-600 mt-1">{eventDetails.description}</p>
              )}
            </div>

            {/* Event Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date & Time */}
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Date & Time</p>
                  <p className="text-sm text-gray-600">
                    {formatDateTime(eventDetails.start_date)}
                  </p>
                  {eventDetails.end_date && eventDetails.end_date !== eventDetails.start_date && (
                    <p className="text-sm text-gray-600">
                      to {formatDateTime(eventDetails.end_date)}
                    </p>
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Location</p>
                  {eventDetails.location && (
                    <p className="text-sm text-gray-600">{eventDetails.location}</p>
                  )}
                  {eventDetails.address && (
                    <p className="text-sm text-gray-600">{eventDetails.address}</p>
                  )}
                  {eventDetails.location_details && (
                    <p className="text-sm text-gray-500 italic">{eventDetails.location_details}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Notes */}
            {eventDetails.notes && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-700">{eventDetails.notes}</p>
              </div>
            )}

            {/* External Link */}
            {eventDetails.link && (
              <div className="text-center">
                <a
                  href={eventDetails.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Venue Website
                </a>
              </div>
            )}

            {/* Players List */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-5 w-5 text-purple-500" />
                <h4 className="font-medium text-gray-900">Players ({eventDetails.players.length})</h4>
              </div>
              
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {eventDetails.players.map((player) => (
                  <div key={player.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium text-gray-900">{player.name}</span>
                    <div className="flex items-center gap-2">
                      {getAvailabilityIcon(player.availability)}
                      <span className="text-xs text-gray-600">
                        {getAvailabilityText(player.availability)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5 text-blue-500" />
            TeamSnap Event Details
          </DialogTitle>
          <DialogDescription>
            View detailed event information from TeamSnap
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
