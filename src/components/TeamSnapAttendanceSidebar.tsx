'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Loader2, CheckCircle, AlertCircle, ExternalLink, Info } from 'lucide-react';
import { useTeamSnapAuth } from '@/hooks/useTeamSnapAuth';

interface TeamSnapAttendanceSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  groupId: number;
}

interface TeamSnapEventDetails {
  id: string;
  name: string;
  players: Array<{
    id: string;
    name: string;
    availability: 'yes' | 'no' | 'maybe' | null;
  }>;
}

type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export function TeamSnapAttendanceSidebar({
  open,
  onOpenChange,
  eventId,
  groupId,
}: TeamSnapAttendanceSidebarProps) {
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

  const renderContent = () => {
    if (!isAuthenticated) {
      return (
        <div className="text-center space-y-4 flex flex-col items-center justify-center h-full">
          <p className="text-gray-600">
            Connect your TeamSnap account to view event attendance.
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
          <div className="flex flex-col items-center justify-center h-full space-y-2">
            <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
            <p className="text-lg font-medium">Loading Attendance...</p>
            <p className="text-sm text-gray-500">Fetching data from TeamSnap.</p>
          </div>
        );
      
      case 'error':
        return (
          <div className="flex flex-col items-center justify-center h-full space-y-2 text-center">
            <AlertCircle className="h-10 w-10 text-red-500" />
            <p className="text-lg font-medium">Failed to Load Event</p>
            <p className="text-sm text-red-600 bg-red-100 p-2 rounded-md">
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
        const noResponsePlayers = eventDetails.players.filter(p => !['yes', 'no', 'maybe'].includes(p.availability!));

        return (
          <div className="space-y-4 pt-4">
            {eventDetails.players.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                No players found for this event in TeamSnap.
              </div>
            ) : (
              <>
                {confirmedPlayers.length > 0 && (
                  <div>
                    <h4 className="text-base font-semibold text-gray-800 mb-2">✅ Confirmed ({confirmedPlayers.length})</h4>
                    <div className="space-y-1 max-h-48 overflow-y-auto rounded-md border bg-gray-50 p-2">
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
                 {noResponsePlayers.length > 0 && (
                   <div>
                    <h4 className="text-base font-semibold text-gray-800 mb-2">⚪️ No Response ({noResponsePlayers.length})</h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto rounded-md border bg-gray-50 p-2">
                      {noResponsePlayers.map((player) => (
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        className="w-[350px] sm:w-[400px] overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle>TeamSnap Attendance</SheetTitle>
          <SheetDescription>
            Live attendance data from TeamSnap for &quot;{eventDetails?.name || 'the selected event'}&quot;.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4 h-[calc(100%-100px)]">
          {renderContent()}
        </div>
      </SheetContent>
    </Sheet>
  );
}
