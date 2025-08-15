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
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useTeamSnapAuth } from '@/hooks/useTeamSnapAuth';

interface TeamSnapSyncDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: number;
  onSyncComplete?: () => void;
}

export function TeamSnapSyncDialog({
  open,
  onOpenChange,
  eventId,
  onSyncComplete
}: TeamSnapSyncDialogProps) {
  const { isAuthenticated, isLoading: authLoading, login } = useTeamSnapAuth();
  const [syncState, setSyncState] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [syncDetails, setSyncDetails] = useState<{
    totalPlayers?: number;
    syncedPlayers?: number;
    unmatchedPlayers?: string[];
  }>({});

  const handleSync = async () => {
    setSyncState('syncing');
    setError(null);

    try {
      // TODO: Implement actual sync logic
      // This will call the sync API endpoint once implemented
      const response = await fetch(`/api/teamsnap/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ eventId })
      });

      if (!response.ok) {
        throw new Error('Failed to sync attendance data');
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
        return (
          <div className="space-y-4">
            <p>
              This will sync attendance data from TeamSnap for this event. 
              Players will be matched by name.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> This will overwrite any existing attendance data for this event.
              </p>
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
              <Button onClick={handleSync}>
                Start Sync
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
