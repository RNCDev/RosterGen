'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { useTeamSnapAuth } from '@/hooks/useTeamSnapAuth';

interface TeamSnapSyncDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: number;
  teamSnapTeamId?: string;
  onSyncComplete?: () => void;
  onSync?: (teamId: string, eventId: string) => void;
}

export function TeamSnapSyncDialog({
  open,
  onOpenChange,
  eventId,
  teamSnapTeamId,
  onSyncComplete,
  onSync
}: TeamSnapSyncDialogProps) {
  const { isAuthenticated, isLoading: authLoading, login } = useTeamSnapAuth();
  const [syncState, setSyncState] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [syncDetails, setSyncDetails] = useState<{
    totalPlayers?: number;
    syncedPlayers?: number;
    unmatchedPlayers?: string[];
  }>({});
  const [teamSnapUrl, setTeamSnapUrl] = useState('');
  const [teamId, setTeamId] = useState(teamSnapTeamId || '');
  const [teamSnapEventId, setTeamSnapEventId] = useState('');

  const handleSync = async () => {
    // Use the stored team ID if available, otherwise use the manually entered one
    const finalTeamId = teamId || teamSnapTeamId || '';
    
    // If using the new onSync callback for interim display
    if (onSync && finalTeamId && teamSnapEventId) {
      setSyncState('syncing');
      setError(null);
      
      try {
        await onSync(finalTeamId, teamSnapEventId);
        // The parent component handles the sync and display
        // We just close the dialog
        onOpenChange(false);
      } catch (err) {
        setSyncState('error');
        setError(err instanceof Error ? err.message : 'An error occurred during sync');
      }
      return;
    }

    // Original sync logic (for future use)
    setSyncState('syncing');
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
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-amber-600">
            <AlertCircle className="h-5 w-5" />
            <p>You need to connect your TeamSnap account first.</p>
          </div>
          <Button 
            onClick={() => login(`/?sync_event=${eventId}`)}
            className="w-full"
          >
            Connect TeamSnap Account
          </Button>
        </div>
      );
    }

    switch (syncState) {
      case 'idle':
        // If we have a stored team ID, show simplified UI
        if (teamSnapTeamId) {
          return (
            <div className="space-y-4">
              <p>
                Enter the TeamSnap event ID to sync attendance data.
                Players will be matched by name.
              </p>
              
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-md p-3 text-sm">
                  <p className="font-medium text-gray-700">TeamSnap Team ID: {teamSnapTeamId}</p>
                </div>
                
                <div>
                  <label htmlFor="teamsnap-url" className="block text-sm font-medium text-gray-700 mb-1">
                    TeamSnap Event URL
                  </label>
                  <input
                    id="teamsnap-url"
                    type="text"
                    value={teamSnapUrl}
                    onChange={(e) => {
                      setTeamSnapUrl(e.target.value);
                      parseTeamSnapUrl(e.target.value);
                      // Auto-set team ID from stored value
                      if (!teamId && teamSnapTeamId) {
                        setTeamId(teamSnapTeamId);
                      }
                    }}
                    placeholder="https://go.teamsnap.com/1234567/events/8901234"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Paste the URL from your TeamSnap event page
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1 h-px bg-gray-200"></div>
                  <span className="text-sm text-gray-500">or enter event ID manually</span>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>

                <div>
                  <label htmlFor="event-id" className="block text-sm font-medium text-gray-700 mb-1">
                    TeamSnap Event ID
                  </label>
                  <input
                    id="event-id"
                    type="text"
                    value={teamSnapEventId}
                    onChange={(e) => setTeamSnapEventId(e.target.value)}
                    placeholder="8901234"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                <p className="text-sm text-amber-800">
                  <strong>Note:</strong> This is a preview that will show attendance data in a notification. 
                  Database updates will be implemented in the next phase.
                </p>
              </div>
            </div>
          );
        }
        
        // Show full UI if no team ID is stored
        return (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
              <p className="text-sm text-amber-800">
                <strong>TeamSnap Team ID not set!</strong> Please set your TeamSnap Team ID in the Roster tab first.
              </p>
            </div>
            
            <p>
              Enter the TeamSnap event URL or the team and event IDs to sync attendance data.
              Players will be matched by name.
            </p>
            
            <div className="space-y-3">
              <div>
                <label htmlFor="teamsnap-url" className="block text-sm font-medium text-gray-700 mb-1">
                  TeamSnap Event URL (optional)
                </label>
                <input
                  id="teamsnap-url"
                  type="text"
                  value={teamSnapUrl}
                  onChange={(e) => {
                    setTeamSnapUrl(e.target.value);
                    parseTeamSnapUrl(e.target.value);
                  }}
                  placeholder="https://go.teamsnap.com/1234567/events/8901234"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Paste the URL from your TeamSnap event page
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-sm text-gray-500">or enter IDs manually</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="team-id" className="block text-sm font-medium text-gray-700 mb-1">
                    Team ID
                  </label>
                  <input
                    id="team-id"
                    type="text"
                    value={teamId}
                    onChange={(e) => setTeamId(e.target.value)}
                    placeholder="1234567"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="event-id" className="block text-sm font-medium text-gray-700 mb-1">
                    TeamSnap Event ID
                  </label>
                  <input
                    id="event-id"
                    type="text"
                    value={teamSnapEventId}
                    onChange={(e) => setTeamSnapEventId(e.target.value)}
                    placeholder="8901234"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'syncing':
        return (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-gray-600">Syncing attendance data...</p>
          </div>
        );

      case 'success':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <p className="font-medium">Sync completed successfully!</p>
            </div>
            {syncDetails.totalPlayers && (
              <div className="bg-gray-50 rounded-md p-3 space-y-1">
                <p className="text-sm">
                  <strong>Total players synced:</strong> {syncDetails.syncedPlayers} / {syncDetails.totalPlayers}
                </p>
                {syncDetails.unmatchedPlayers && syncDetails.unmatchedPlayers.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-amber-600 font-medium">
                      Unmatched players from TeamSnap:
                    </p>
                    <ul className="text-sm text-gray-600 mt-1">
                      {syncDetails.unmatchedPlayers.map((player, index) => (
                        <li key={index}>• {player}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'error':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <p className="font-medium">Sync failed</p>
            </div>
            <p className="text-sm text-gray-600">{error}</p>
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sync from TeamSnap</DialogTitle>
          <DialogDescription>
            Import attendance data from TeamSnap for this event
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
                onClick={handleSync}
                disabled={!teamSnapEventId || (!teamId && !teamSnapTeamId)}
              >
                Preview Sync
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
