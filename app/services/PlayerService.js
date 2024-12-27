// app/services/PlayerService.js
import Papa from 'papaparse';

export class PlayerService {
  static async fetchPlayers() {
    const response = await fetch('/api/players');
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch players: ${errorText}`);
    }
    return await response.json();
  }

  static async updatePlayer(id, updatedData) {
    const response = await fetch('/api/players', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updatedData }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update player: ${errorText}`);
    }
    return await response.json();
  }

  static async uploadPlayersFromCsv(file) {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        transformHeader: header => header.trim().toLowerCase().replace(/\s+/g, '_'),
        complete: async (results) => {
          try {
            if (results.errors.length > 0) {
              throw new Error(`CSV parsing errors: ${results.errors.map(e => e.message).join(', ')}`);
            }

            const players = [];
            for (const row of results.data) {
              const playerData = this.normalizePlayerData(row);
              const response = await fetch('/api/players', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(playerData),
              });

              if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to add player ${playerData.first_name} ${playerData.last_name}: ${errorText}`);
              }

              const savedPlayer = await response.json();
              players.push(savedPlayer);
            }
            resolve(players);
          } catch (error) {
            reject(error);
          }
        },
        error: (error) => reject(new Error(`Failed to parse CSV: ${error.message}`))
      });
    });
  }

  static normalizePlayerData(row) {
    const playerData = {
      first_name: (row.first_name || row.firstName || row.firstname || '')?.trim(),
      last_name: (row.last_name || row.lastName || row.lastname || '')?.trim(),
      skill: parseInt(row.skill || row.skill_level || '0'),
      is_defense: (row.defense || row.is_defense || row.isDefense || '0')?.toString().toLowerCase() === 'true' || 
                 (row.defense || row.is_defense || row.isDefense || '0')?.toString() === '1',
      is_attending: (row.attending || row.is_attending || row.isAttending || '1')?.toString().toLowerCase() === 'true' || 
                   (row.attending || row.is_attending || row.isAttending || '1')?.toString() === '1'
    };

    if (!playerData.first_name || !playerData.last_name) {
      throw new Error(`Missing required fields for player: ${JSON.stringify(row)}`);
    }

    return playerData;
  }
}
