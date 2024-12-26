'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeftRight, RotateCcw, Save, Upload, UserPlus, AlertCircle } from 'lucide-react';

const MAX_HISTORY = 20;
const SKILL_THRESHOLD = 2;

export default function RosterGenerator() {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [savedConfigs, setSavedConfigs] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rosterConfigs');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  useEffect(() => {
    if (teams && historyIndex === history.length - 1) {
      setHistory(prev => [...prev.slice(-MAX_HISTORY), teams]);
      setHistoryIndex(prev => prev + 1);
    }
  }, [teams]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const lines = text.split('\n');
        const playerData = lines.slice(1).filter(line => line.trim());
        
        const formattedPlayers = playerData.map(line => {
          const [firstName, lastName, skill, defense, attending] = line.split(',');
          return {
            name: `${firstName} ${lastName}`.trim(),
            skill: Number(skill) || 0,
            defense: Number(defense) === 1,
            attending: Number(attending) === 1
          };
        }).filter(player => player.attending);
        
        setPlayers(formattedPlayers);
      };
      reader.readAsText(file);
    }
  };

  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const assignPlayersToTeams = (players, redTeam, whiteTeam) => {
    const sortedPlayers = [...players].sort((a, b) => b.skill - a.skill);
    let redSkill = 0;
    let whiteSkill = 0;
    
    sortedPlayers.forEach(player => {
      const targetSize = Math.ceil(sortedPlayers.length / 2);
      if ((redSkill <= whiteSkill && redTeam.length < targetSize) || whiteTeam.length >= targetSize) {
        redTeam.push(player);
        redSkill += player.skill;
      } else {
        whiteTeam.push(player);
        whiteSkill += player.skill;
      }
    });
  };

  const generateRosters = () => {
    const forwards = shuffleArray(players.filter(player => !player.defense));
    const defensemen = shuffleArray(players.filter(player => player.defense));
    
    const redTeam = { forwards: [], defensemen: [] };
    const whiteTeam = { forwards: [], defensemen: [] };
    
    assignPlayersToTeams(forwards, redTeam.forwards, whiteTeam.forwards);
    assignPlayersToTeams(defensemen, redTeam.defensemen, whiteTeam.defensemen);
    
    setTeams({ red: redTeam, white: whiteTeam });
    setHistory([{ red: redTeam, white: whiteTeam }]);
    setHistoryIndex(0);
  };

  const calculateTeamStats = (team) => {
    const allPlayers = [...team.forwards, ...team.defensemen];
    return {
      total: allPlayers.length,
      forwards: team.forwards.length,
      defense: team.defensemen.length,
      totalSkill: allPlayers.reduce((sum, p) => sum + p.skill, 0),
      avgSkill: (allPlayers.reduce((sum, p) => sum + p.skill, 0) / allPlayers.length).toFixed(1)
    };
  };

  const swapPlayer = (player, fromTeam, toTeam, newPosition = null) => {
    const newTeams = JSON.parse(JSON.stringify(teams));
    const sourceTeam = newTeams[fromTeam];
    const targetTeam = newTeams[toTeam];
    
    const oldPosition = player.defense ? 'defensemen' : 'forwards';
    sourceTeam[oldPosition] = sourceTeam[oldPosition].filter(p => p.name !== player.name);
    
    const newPlayer = { ...player };
    if (newPosition !== null) {
      newPlayer.defense = newPosition === 'defensemen';
    }
    const targetPosition = newPlayer.defense ? 'defensemen' : 'forwards';
    targetTeam[targetPosition].push(newPlayer);
    
    setTeams(newTeams);
    setSelectedPlayer(null);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      setTeams(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setTeams(history[historyIndex + 1]);
    }
  };

  const saveConfig = () => {
    const name = `Config ${savedConfigs.length + 1}`;
    const newConfig = {
      name,
      teams,
      timestamp: new Date().toISOString()
    };
    const updatedConfigs = [...savedConfigs, newConfig];
    setSavedConfigs(updatedConfigs);
    localStorage.setItem('rosterConfigs', JSON.stringify(updatedConfigs));
  };

  const loadConfig = (config) => {
    setTeams(config.teams);
    setHistory(prev => [...prev, config.teams]);
    setHistoryIndex(prev => prev + 1);
  };

  const checkTeamBalance = () => {
    if (!teams) return null;
    const redStats = calculateTeamStats(teams.red);
    const whiteStats = calculateTeamStats(teams.white);
    const skillDiff = Math.abs(redStats.avgSkill - whiteStats.avgSkill);
    return skillDiff > SKILL_THRESHOLD;
  };

  const TeamRoster = ({ team, name, colorClass, teamKey }) => {
    const stats = calculateTeamStats(team);
    const isUnbalanced = checkTeamBalance();
    
    return (
      <div className="w-full border rounded-lg overflow-hidden">
        <div className={`p-4 ${colorClass}`}>
          <h2 className="text-xl font-bold">{name}</h2>
          <div className="text-sm mt-2">
            <div>Players: {stats.total} (F: {stats.forwards}, D: {stats.defense})</div>
            <div>Avg Skill: {stats.avgSkill}</div>
            {isUnbalanced && (
              <div className="text-yellow-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-4 h-4" />
                Teams may be unbalanced
              </div>
            )}
          </div>
        </div>
        <div className="divide-y">
          {[...team.forwards, ...team.defensemen].map((player, idx) => (
            <div 
              key={player.name}
              className={`flex items-center p-3 cursor-pointer
                ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                ${selectedPlayer?.name === player.name ? 'bg-blue-50' : ''}
                hover:bg-blue-50 transition-colors`}
              onClick={() => setSelectedPlayer(player === selectedPlayer ? null : {
                ...player,
                currentTeam: teamKey
              })}
            >
              <span className="flex-grow">{player.name}</span>
              <span className="w-12 text-center text-gray-600">{player.defense ? 'D' : 'F'}</span>
              <span className="w-12 text-center text-gray-600">{player.skill}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h1 className="text-2xl font-bold">Hockey Roster Generator</h1>
        
        <div>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </div>
        
        {players.length > 0 && (
          <button
            onClick={generateRosters}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md
              hover:bg-blue-700 transition-colors"
          >
            Generate Teams
          </button>
        )}
      </div>

      {teams && (
        <>
          <div className="flex gap-2 justify-center">
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className="bg-gray-100 p-2 rounded hover:bg-gray-200 disabled:opacity-50"
              title="Undo"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="bg-gray-100 p-2 rounded hover:bg-gray-200 disabled:opacity-50"
              title="Redo"
            >
              <RotateCcw className="w-5 h-5 transform scale-x-[-1]" />
            </button>
            <button
              onClick={saveConfig}
              className="bg-gray-100 p-2 rounded hover:bg-gray-200"
              title="Save Configuration"
            >
              <Save className="w-5 h-5" />
            </button>
          </div>

          {selectedPlayer && (
            <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 
              bg-white shadow-lg rounded-lg p-4 border border-gray-200 z-50 flex gap-2">
              <button
                onClick={() => swapPlayer(
                  selectedPlayer,
                  selectedPlayer.currentTeam,
                  selectedPlayer.currentTeam === 'red' ? 'white' : 'red'
                )}
                className="flex items-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-md
                  hover:bg-blue-700 transition-colors"
              >
                <ArrowLeftRight className="w-4 h-4" />
                Swap Teams
              </button>
              <button
                onClick={() => swapPlayer(
                  selectedPlayer,
                  selectedPlayer.currentTeam,
                  selectedPlayer.currentTeam,
                  selectedPlayer.defense ? 'forwards' : 'defensemen'
                )}
                className="flex items-center gap-2 bg-green-600 text-white py-2 px-4 rounded-md
                  hover:bg-green-700 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Change Position
              </button>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <TeamRoster 
              team={teams.red}
              name="Red Team"
              colorClass="bg-red-600 text-white"
              teamKey="red"
            />
            <TeamRoster 
              team={teams.white}
              name="White Team"
              colorClass="bg-gray-100"
              teamKey="white"
            />
          </div>
        </>
      )}
    </div>
  );
}
