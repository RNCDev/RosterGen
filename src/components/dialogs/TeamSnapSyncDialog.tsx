'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/Input';
import { Loader2, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { useTeamSnapAuth } from '@/hooks/useTeamSnapAuth';

interface TeamSnapSyncDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: number;
  teamSnapTeamId: string | null;
  onSyncComplete?: () => void;
  onSync: (eventId: string) => void;
}

type SyncState = 'idle' | 'loading' | 'success' | 'error';

interface SyncDetails {
  added: string[];
  updated: string[];
  unchanged: string[];
  totalTeamSnap: number;
  totalRoster: number;
}

export function TeamSnapSyncDialog({
  open,
  onOpenChange,
  eventId,
  teamSnapTeamId,
  onSyncComplete,
  onSync
}: TeamSnapSyncDialogProps) {
  const [teamId, setTeamId] = useState(teamSnapTeamId || '');
  const [teamSnapEventId, setTeamSnapEventId] = useState('');
  const [syncState, setSyncState] = useState<SyncState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [syncDetails, setSyncDetails] = useState<SyncDetails | null>(null);
  const { isAuthenticated, login, loading: authLoading } = useTeamSnapAuth();

  useEffect(() => {
    // Reset state when dialog is opened/closed
    if (!open) {
      setSyncState('idle');
      setError(null);
      setSyncDetails(null);
    }
  }, [open]);

  const handleSync = async () => {
    // Use the stored team ID if available, otherwise use the manually entered one
    const finalTeamId = teamSnapTeamId || teamId;
    if (!finalTeamId) {
      setError('Team ID is required to sync.');
      return;
    }
    
    if (!teamSnapEventId) {
      setError('TeamSnap Event ID is required.');
      return;
    }

    setSyncState('loading');
    setError(null);

    try {
      const response = await fetch(`/api/teamsnap/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          eventId,
          teamSnapEventId: teamSnapEventId || undefined
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to sync attendance data');
      }

      const data = await response.json();
      setSyncDetails(data);
      setSyncState('success');
      
      // Notify parent component
      if (onSyncComplete) {
        setTimeout(() => {
          onSyncComplete();
          onOpenChange(false);
        }, 2000);
      }
    } catch (err) {
      setSyncState('error');
      setError(err instanceof Error ? err.message : 'An error occurred during sync');
    }
  };

  // Parse TeamSnap URL to extract IDs
  const parseTeamSnapUrl = (url: string) => {
    try {
      // Example URLs:
      // https://go.teamsnap.com/1234567/events/8901234
      // https://go.teamsnap.com/teams/1234567/events/8901234
      const urlParts = url.split('/');
      const teamIndex = urlParts.indexOf('teams') + 1 || urlParts.findIndex(p => /^\d+$/.test(p));
      const eventIndex = urlParts.indexOf('events') + 1;
      
      if (teamIndex > 0 && teamIndex < urlParts.length) {
        setTeamId(urlParts[teamIndex]);
      }
      if (eventIndex > 0 && eventIndex < urlParts.length) {
        setTeamSnapEventId(urlParts[eventIndex]);
      }
    } catch (e) {
      console.error('Failed to parse TeamSnap URL:', e);
    }
  };

  const renderContent = () => {
    if (authLoading) {
      return (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <div className="text-center space-y-4">
          <p>
            You need to connect your TeamSnap account to sync attendance data.
          </p>
          <Button onClick={() => login()}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Connect to TeamSnap
          </Button>
        </div>
      );
    }

    switch (syncState) {
      case 'loading':
        return (
          <div className="flex flex-col items-center justify-center h-40 space-y-2">
            <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
            <p className="text-lg font-medium">Syncing Attendance...</p>
            <p className="text-sm text-gray-500">Fetching data from TeamSnap, please wait.</p>
          </div>
        );
      case 'success':
        return (
          <div className="flex flex-col items-center justify-center h-40 space-y-2">
            <CheckCircle className="h-10 w-10 text-green-500" />
            <p className="text-lg font-medium">Sync Successful!</p>
            {syncDetails && (
              <p className="text-sm text-gray-500">
                {syncDetails.added.length} added, {syncDetails.updated.length} updated, {syncDetails.unchanged.length} unchanged.
              </p>
            )}
          </div>
        );
      case 'error':
        return (
          <div className="flex flex-col items-center justify-center h-40 space-y-2">
            <AlertCircle className="h-10 w-10 text-red-500" />
            <p className="text-lg font-medium">Sync Failed</p>
            <p className="text-sm text-red-600 bg-red-100 p-2 rounded-md">{error}</p>
          </div>
        );
      case 'idle':
      default:
        return (
          <div className="space-y-4">
            <p>
              Enter the full URL of your TeamSnap event page, and we'll extract the team and event IDs.
            </p>
            <Input
              type="text"
              placeholder="https://go.teamsnap.com/..."
              onChange={(e) => parseTeamSnapUrl(e.target.value)}
              className="w-full"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="text"
                placeholder="TeamSnap Team ID"
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                disabled={!!teamSnapTeamId}
                className="w-full"
              />
              <Input
                type="text"
                placeholder="TeamSnap Event ID"
                value={teamSnapEventId}
                onChange={(e) => setTeamSnapEventId(e.target.value)}
                className="w-full"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sync with TeamSnap</DialogTitle>
          <DialogDescription>
            Fetch attendance data directly from your TeamSnap event.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {renderContent()}
        </div>

        <DialogFooter>
          {syncState === 'idle' && isAuthenticated && (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => onSync(teamId, teamSnapEventId)}
                disabled={!teamSnapEventId || !teamId}
              >
                Sync Attendance
              </Button>
            </>
          )}
          {(syncState === 'success' || syncState === 'error') && (
            <Button onClick={() => onOpenChange(false)}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
