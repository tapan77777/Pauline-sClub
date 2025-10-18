'use client';

import { onValue, push, ref, remove, set, update } from 'firebase/database';
import { Calendar, Clock, Edit2, MapPin, Plus, Save, Target, Trash2, Trophy, Users, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { database } from '../firebase';

const TournamentPage = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  const ADMIN_PASSWORD = 'admin123';

  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [activeTab, setActiveTab] = useState('table');
  
  const [selectedGroup, setSelectedGroup] = useState('A');
  const [showAddTournament, setShowAddTournament] = useState(false);
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [showAddFixture, setShowAddFixture] = useState(false);
  const [editingMatch, setEditingMatch] = useState(null);
  
  const [newTournament, setNewTournament] = useState({
    name: '',
    season: '',
    format: 'League',
    startDate: '',
    endDate: ''
  });
  
 const [newTeam, setNewTeam] = useState({
  name: '',
  logo: '⚽',
  group: 'A'  // ADD THIS
});
  
  const [newFixture, setNewFixture] = useState({
    homeTeam: '',
    awayTeam: '',
    date: '',
    time: '',
    venue: ''
  });

  // Firebase: Listen to tournaments
  useEffect(() => {
    const tournamentsRef = ref(database, 'tournaments');
    const unsubscribe = onValue(tournamentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const tournamentsArray = Object.entries(data).map(([id, tournament]) => ({
          id,
          ...tournament,
          teams: tournament.teams || {},
          fixtures: tournament.fixtures || {},
          standings: tournament.standings || {}
        }));
        setTournaments(tournamentsArray);
        if (!selectedTournament && tournamentsArray.length > 0) {
          setSelectedTournament(tournamentsArray[0]);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Update selected tournament when tournaments change
  useEffect(() => {
    if (selectedTournament) {
      const updated = tournaments.find(t => t.id === selectedTournament.id);
      if (updated) {
        setSelectedTournament(updated);
      }
    }
  }, [tournaments]);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setShowLogin(false);
      setPassword('');
      setLoginError('');
    } else {
      setLoginError('Invalid password');
    }
  };

  const addTournament = () => {
    if (!isAdmin || !newTournament.name) return;
    
    const tournamentsRef = ref(database, 'tournaments');
    const newTournamentRef = push(tournamentsRef);
    
    set(newTournamentRef, {
      ...newTournament,
      createdAt: new Date().toISOString(),
      teams: {},
      fixtures: {},
      standings: {}
    });
    
    setNewTournament({ name: '', season: '', format: 'League', startDate: '', endDate: '' });
    setShowAddTournament(false);
  };

  const deleteTournament = (tournamentId) => {
    if (!isAdmin) return;
    if (window.confirm('Are you sure you want to delete this tournament?')) {
      const tournamentRef = ref(database, `tournaments/${tournamentId}`);
      remove(tournamentRef);
      if (selectedTournament?.id === tournamentId) {
        setSelectedTournament(null);
      }
    }
  };

const addTeamToTournament = () => {
  if (!isAdmin || !newTeam.name || !selectedTournament) return;
  
  const teamRef = ref(database, `tournaments/${selectedTournament.id}/teams`);
  const newTeamRef = push(teamRef);
  
  set(newTeamRef, {
    name: newTeam.name,
    logo: newTeam.logo,
    group: selectedTournament.format === 'Group Stage' ? newTeam.group : null  // ADD THIS
  });

  const standingsRef = ref(database, `tournaments/${selectedTournament.id}/standings/${newTeamRef.key}`);
  set(standingsRef, {
    teamId: newTeamRef.key,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
    group: selectedTournament.format === 'Group Stage' ? newTeam.group : null  // ADD THIS
  });
  
  setNewTeam({ name: '', logo: '⚽', group: 'A' });
  setShowAddTeam(false);
};

  const deleteTeam = (teamId) => {
    if (!isAdmin || !selectedTournament) return;
    if (window.confirm('Delete this team? This will also remove related fixtures.')) {
      const teamRef = ref(database, `tournaments/${selectedTournament.id}/teams/${teamId}`);
      remove(teamRef);
      
      const standingsRef = ref(database, `tournaments/${selectedTournament.id}/standings/${teamId}`);
      remove(standingsRef);
    }
  };

  const addFixture = () => {
    if (!isAdmin || !newFixture.homeTeam || !newFixture.awayTeam || !selectedTournament) return;
    
    const fixtureRef = ref(database, `tournaments/${selectedTournament.id}/fixtures`);
    const newFixtureRef = push(fixtureRef);
    
    set(newFixtureRef, {
      ...newFixture,
      status: 'scheduled',
      homeScore: null,
      awayScore: null
    });
    
    setNewFixture({ homeTeam: '', awayTeam: '', date: '', time: '', venue: '' });
    setShowAddFixture(false);
  };

  const updateMatchResult = () => {
    if (!isAdmin || !editingMatch || !selectedTournament) return;
    
    const fixtureRef = ref(database, `tournaments/${selectedTournament.id}/fixtures/${editingMatch.id}`);
    update(fixtureRef, {
      homeScore: editingMatch.homeScore,
      awayScore: editingMatch.awayScore,
      status: 'completed'
    });

    // Update standings
    updateStandings(editingMatch);
    
    setEditingMatch(null);
  };

  const updateStandings = (match) => {
    const homeTeamId = match.homeTeam;
    const awayTeamId = match.awayTeam;
    const homeScore = parseInt(match.homeScore) || 0;
    const awayScore = parseInt(match.awayScore) || 0;

    // Get current standings
    const homeStanding = selectedTournament.standings[homeTeamId] || {
      played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0
    };
    const awayStanding = selectedTournament.standings[awayTeamId] || {
      played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0
    };

    // Update home team
    homeStanding.played += 1;
    homeStanding.goalsFor += homeScore;
    homeStanding.goalsAgainst += awayScore;
    homeStanding.goalDifference = homeStanding.goalsFor - homeStanding.goalsAgainst;

    // Update away team
    awayStanding.played += 1;
    awayStanding.goalsFor += awayScore;
    awayStanding.goalsAgainst += homeScore;
    awayStanding.goalDifference = awayStanding.goalsFor - awayStanding.goalsAgainst;

    // Determine result
    if (homeScore > awayScore) {
      homeStanding.won += 1;
      homeStanding.points += 3;
      awayStanding.lost += 1;
    } else if (awayScore > homeScore) {
      awayStanding.won += 1;
      awayStanding.points += 3;
      homeStanding.lost += 1;
    } else {
      homeStanding.drawn += 1;
      homeStanding.points += 1;
      awayStanding.drawn += 1;
      awayStanding.points += 1;
    }

    // Save to Firebase
    const homeStandingRef = ref(database, `tournaments/${selectedTournament.id}/standings/${homeTeamId}`);
    update(homeStandingRef, homeStanding);

    const awayStandingRef = ref(database, `tournaments/${selectedTournament.id}/standings/${awayTeamId}`);
    update(awayStandingRef, awayStanding);
  };

  const deleteFixture = (fixtureId) => {
    if (!isAdmin || !selectedTournament) return;
    if (window.confirm('Delete this fixture?')) {
      const fixtureRef = ref(database, `tournaments/${selectedTournament.id}/fixtures/${fixtureId}`);
      remove(fixtureRef);
    }
  };

  const getTeamName = (teamId) => {
    if (!selectedTournament?.teams) return 'Unknown';
    const team = selectedTournament.teams[teamId];
    return team ? team.name : 'Unknown';
  };

  const getTeamLogo = (teamId) => {
    if (!selectedTournament?.teams) return '⚽';
    const team = selectedTournament.teams[teamId];
    return team ? team.logo : '⚽';
  };

const getSortedStandings = (group = null) => {
  if (!selectedTournament?.standings) return [];
  
  return Object.entries(selectedTournament.standings)
    .map(([teamId, standing]) => ({
      teamId,
      ...standing,
      teamName: getTeamName(teamId),
      teamLogo: getTeamLogo(teamId)
    }))
    .filter(s => group ? s.group === group : true)  // ADD THIS FILTER
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    });
};

  const getFixturesByStatus = (status) => {
    if (!selectedTournament?.fixtures) return [];
    
    return Object.entries(selectedTournament.fixtures)
      .map(([id, fixture]) => ({ id, ...fixture }))
      .filter(f => f.status === status)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Admin Login</h2>
              <button onClick={() => { setShowLogin(false); setPassword(''); setLoginError(''); }} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setLoginError(''); }}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="Enter admin password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
              <button onClick={handleLogin} className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-semibold transition">
                Login
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Tournament Modal */}
      {showAddTournament && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">New Tournament</h2>
              <button onClick={() => setShowAddTournament(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Tournament Name"
                value={newTournament.name}
                onChange={(e) => setNewTournament({ ...newTournament, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <input
                type="text"
                placeholder="Season (e.g., 2025)"
                value={newTournament.season}
                onChange={(e) => setNewTournament({ ...newTournament, season: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <select
                value={newTournament.format}
                onChange={(e) => setNewTournament({ ...newTournament, format: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="League">League</option>
                <option value="Knockout">Knockout</option>
                <option value="Group Stage">Group Stage</option>
              </select>
              <input
                type="date"
                placeholder="Start Date"
                value={newTournament.startDate}
                onChange={(e) => setNewTournament({ ...newTournament, startDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <input
                type="date"
                placeholder="End Date"
                value={newTournament.endDate}
                onChange={(e) => setNewTournament({ ...newTournament, endDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button onClick={addTournament} className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-semibold transition">
                Create Tournament
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Team Modal */}
{showAddTeam && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Add Team</h2>
        <button onClick={() => setShowAddTeam(false)} className="text-gray-500 hover:text-gray-700">
          <X className="w-6 h-6" />
        </button>
      </div>
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Team Logo (emoji)"
          value={newTeam.logo}
          onChange={(e) => setNewTeam({ ...newTeam, logo: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <input
          type="text"
          placeholder="Team Name"
          value={newTeam.name}
          onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        {selectedTournament?.format === 'Group Stage' && (
          <select
            value={newTeam.group}
            onChange={(e) => setNewTeam({ ...newTeam, group: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="A">Group A</option>
            <option value="B">Group B</option>
            <option value="C">Group C</option>
            <option value="D">Group D</option>
          </select>
        )}
        <button onClick={addTeamToTournament} className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-semibold transition">
          Add Team
        </button>
      </div>
    </div>
  </div>
)}

      {/* Add Fixture Modal */}
      {showAddFixture && selectedTournament && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Schedule Match</h2>
              <button onClick={() => setShowAddFixture(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <select
                value={newFixture.homeTeam}
                onChange={(e) => setNewFixture({ ...newFixture, homeTeam: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Select Home Team</option>
                {selectedTournament.teams && Object.entries(selectedTournament.teams).map(([id, team]) => (
                  <option key={id} value={id}>{team.logo} {team.name}</option>
                ))}
              </select>
              <select
                value={newFixture.awayTeam}
                onChange={(e) => setNewFixture({ ...newFixture, awayTeam: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Select Away Team</option>
                {selectedTournament.teams && Object.entries(selectedTournament.teams).map(([id, team]) => (
                  <option key={id} value={id}>{team.logo} {team.name}</option>
                ))}
              </select>
              <input
                type="date"
                value={newFixture.date}
                onChange={(e) => setNewFixture({ ...newFixture, date: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <input
                type="time"
                value={newFixture.time}
                onChange={(e) => setNewFixture({ ...newFixture, time: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <input
                type="text"
                placeholder="Venue"
                value={newFixture.venue}
                onChange={(e) => setNewFixture({ ...newFixture, venue: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button onClick={addFixture} className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-semibold transition">
                Schedule Match
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Match Result Modal */}
      {editingMatch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Update Result</h2>
              <button onClick={() => setEditingMatch(null)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="text-center mb-4">
                <p className="text-gray-600 text-sm mb-2">{editingMatch.date} at {editingMatch.time}</p>
                <p className="text-gray-600 text-sm">{editingMatch.venue}</p>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="text-center">
                  <div className="text-3xl mb-2">{getTeamLogo(editingMatch.homeTeam)}</div>
                  <p className="font-bold text-sm">{getTeamName(editingMatch.homeTeam)}</p>
                  <input
                    type="number"
                    min="0"
                    value={editingMatch.homeScore || ''}
                    onChange={(e) => setEditingMatch({ ...editingMatch, homeScore: e.target.value })}
                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="0"
                  />
                </div>
                <div className="text-center text-2xl font-bold text-gray-400">VS</div>
                <div className="text-center">
                  <div className="text-3xl mb-2">{getTeamLogo(editingMatch.awayTeam)}</div>
                  <p className="font-bold text-sm">{getTeamName(editingMatch.awayTeam)}</p>
                  <input
                    type="number"
                    min="0"
                    value={editingMatch.awayScore || ''}
                    onChange={(e) => setEditingMatch({ ...editingMatch, awayScore: e.target.value })}
                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="0"
                  />
                </div>
              </div>
              <button onClick={updateMatchResult} className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2">
                <Save className="w-5 h-5" />
                Save Result
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 sm:w-10 sm:h-10" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Tournaments</h1>
                <p className="text-orange-100 text-xs sm:text-sm">Manage competitions & standings</p>
              </div>
            </div>
            {!isAdmin ? (
              <button onClick={() => setShowLogin(true)} className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm transition">
                Admin
              </button>
            ) : (
              <button onClick={() => setIsAdmin(false)} className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm transition">
                Logout
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        {/* Tournament Selector */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Select Tournament</h2>
            {isAdmin && (
              <button onClick={() => setShowAddTournament(true)} className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition">
                <Plus className="w-4 h-4" />
                New Tournament
              </button>
            )}
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tournaments.map(tournament => (
              <div
                key={tournament.id}
                onClick={() => setSelectedTournament(tournament)}
                className={`p-4 rounded-xl cursor-pointer transition ${
                  selectedTournament?.id === tournament.id
                    ? 'bg-orange-600 text-white shadow-lg'
                    : 'bg-white text-gray-800 hover:shadow-lg'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{tournament.name}</h3>
                    <p className={`text-sm ${selectedTournament?.id === tournament.id ? 'text-orange-100' : 'text-gray-600'}`}>
                      {tournament.season} • {tournament.format}
                    </p>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteTournament(tournament.id); }}
                      className={`p-2 rounded-lg transition ${
                        selectedTournament?.id === tournament.id
                          ? 'hover:bg-orange-700'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="flex gap-2 text-xs">
                  <span className={`px-2 py-1 rounded ${selectedTournament?.id === tournament.id ? 'bg-white/20' : 'bg-gray-100'}`}>
                    {Object.keys(tournament.teams || {}).length} Teams
                  </span>
                  <span className={`px-2 py-1 rounded ${selectedTournament?.id === tournament.id ? 'bg-white/20' : 'bg-gray-100'}`}>
                    {Object.keys(tournament.fixtures || {}).length} Matches
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedTournament && (
          <>
            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-lg mb-6 overflow-hidden">
              <div className="flex overflow-x-auto">
                {[
                  { id: 'table', label: 'Standings', icon: Target },
                  { id: 'fixtures', label: 'Fixtures', icon: Calendar },
                  { id: 'results', label: 'Results', icon: Trophy },
                  { id: 'teams', label: 'Teams', icon: Users }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 font-medium transition whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
                        : 'text-gray-600 hover:text-orange-600 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {activeTab === 'table' && (
  <div className="p-4 sm:p-6">
    {selectedTournament.format === 'Knockout' ? (
      // KNOCKOUT BRACKET VIEW
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Knockout Bracket</h2>
        <div className="text-center py-12 text-gray-500">
          <Trophy className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>Knockout bracket view coming soon!</p>
          <p className="text-sm mt-2">Use Fixtures tab to manage knockout matches</p>
        </div>
      </div>
    ) : selectedTournament.format === 'Group Stage' ? (
      // GROUP STAGE TABLES
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Group Stage Standings</h2>
        
        {/* Group Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {['A', 'B', 'C', 'D'].map(group => {
            const groupTeams = getSortedStandings(group);
            if (groupTeams.length === 0) return null;
            return (
              <button
                key={group}
                onClick={() => setSelectedGroup(group)}
                className={`px-6 py-3 rounded-lg font-semibold transition whitespace-nowrap ${
                  selectedGroup === group
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Group {group}
              </button>
            );
          })}
        </div>

        {/* Group Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-2 text-sm font-bold text-gray-600">#</th>
                <th className="text-left py-3 px-2 text-sm font-bold text-gray-600">Team</th>
                <th className="text-center py-3 px-2 text-sm font-bold text-gray-600">P</th>
                <th className="text-center py-3 px-2 text-sm font-bold text-gray-600">W</th>
                <th className="text-center py-3 px-2 text-sm font-bold text-gray-600">D</th>
                <th className="text-center py-3 px-2 text-sm font-bold text-gray-600">L</th>
                <th className="text-center py-3 px-2 text-sm font-bold text-gray-600">GF</th>
                <th className="text-center py-3 px-2 text-sm font-bold text-gray-600">GA</th>
                <th className="text-center py-3 px-2 text-sm font-bold text-gray-600">GD</th>
                <th className="text-center py-3 px-2 text-sm font-bold text-gray-600 bg-orange-50">Pts</th>
              </tr>
            </thead>
            <tbody>
              {getSortedStandings(selectedGroup).map((standing, index) => (
                <tr key={standing.teamId} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="py-3 px-2 text-sm font-bold text-gray-600">{index + 1}</td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{standing.teamLogo}</span>
                      <span className="font-semibold text-gray-800">{standing.teamName}</span>
                    </div>
                  </td>
                  <td className="text-center py-3 px-2 text-sm text-gray-600">{standing.played}</td>
                  <td className="text-center py-3 px-2 text-sm text-gray-600">{standing.won}</td>
                  <td className="text-center py-3 px-2 text-sm text-gray-600">{standing.drawn}</td>
                  <td className="text-center py-3 px-2 text-sm text-gray-600">{standing.lost}</td>
                  <td className="text-center py-3 px-2 text-sm text-gray-600">{standing.goalsFor}</td>
                  <td className="text-center py-3 px-2 text-sm text-gray-600">{standing.goalsAgainst}</td>
                  <td className="text-center py-3 px-2 text-sm font-semibold text-gray-800">{standing.goalDifference}</td>
                  <td className="text-center py-3 px-2 text-lg font-bold text-orange-600 bg-orange-50">{standing.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    ) : (
      // LEAGUE TABLE (existing code)
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">League Table</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-2 text-sm font-bold text-gray-600">#</th>
                <th className="text-left py-3 px-2 text-sm font-bold text-gray-600">Team</th>
                <th className="text-center py-3 px-2 text-sm font-bold text-gray-600">P</th>
                <th className="text-center py-3 px-2 text-sm font-bold text-gray-600">W</th>
                <th className="text-center py-3 px-2 text-sm font-bold text-gray-600">D</th>
                <th className="text-center py-3 px-2 text-sm font-bold text-gray-600">L</th>
                <th className="text-center py-3 px-2 text-sm font-bold text-gray-600">GF</th>
                <th className="text-center py-3 px-2 text-sm font-bold text-gray-600">GA</th>
                <th className="text-center py-3 px-2 text-sm font-bold text-gray-600">GD</th>
                <th className="text-center py-3 px-2 text-sm font-bold text-gray-600 bg-orange-50">Pts</th>
              </tr>
            </thead>
            <tbody>
              {getSortedStandings().map((standing, index) => (
                <tr key={standing.teamId} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="py-3 px-2 text-sm font-bold text-gray-600">{index + 1}</td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{standing.teamLogo}</span>
                      <span className="font-semibold text-gray-800">{standing.teamName}</span>
                    </div>
                  </td>
                  <td className="text-center py-3 px-2 text-sm text-gray-600">{standing.played}</td>
                  <td className="text-center py-3 px-2 text-sm text-gray-600">{standing.won}</td>
                  <td className="text-center py-3 px-2 text-sm text-gray-600">{standing.drawn}</td>
                  <td className="text-center py-3 px-2 text-sm text-gray-600">{standing.lost}</td>
                  <td className="text-center py-3 px-2 text-sm text-gray-600">{standing.goalsFor}</td>
                  <td className="text-center py-3 px-2 text-sm text-gray-600">{standing.goalsAgainst}</td>
                  <td className="text-center py-3 px-2 text-sm font-semibold text-gray-800">{standing.goalDifference}</td>
                  <td className="text-center py-3 px-2 text-lg font-bold text-orange-600 bg-orange-50">{standing.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {getSortedStandings().length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Trophy className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No standings data yet. Add teams and fixtures to get started!</p>
          </div>
        )}
      </div>
    )}
  </div>
)}

              {activeTab === 'fixtures' && (
                <div className="p-4 sm:p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Upcoming Fixtures</h2>
                    {isAdmin && (
                      <button onClick={() => setShowAddFixture(true)} className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition">
                        <Plus className="w-4 h-4" />
                        Add Fixture
                      </button>
                    )}
                  </div>
                  <div className="space-y-4">
                    {getFixturesByStatus('scheduled').map(fixture => (
                      <div key={fixture.id} className="bg-gray-50 rounded-xl p-4 hover:shadow-md transition">
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>{fixture.date} at {fixture.time}</span>
                          </div>
                          {isAdmin && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => setEditingMatch({ ...fixture })}
                                className="text-blue-600 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteFixture(fixture.id)}
                                className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-4 items-center">
                          <div className="text-center">
                            <div className="text-3xl mb-2">{getTeamLogo(fixture.homeTeam)}</div>
                            <p className="font-bold text-sm">{getTeamName(fixture.homeTeam)}</p>
                          </div>
                          <div className="text-center text-xl font-bold text-gray-400">VS</div>
                          <div className="text-center">
                            <div className="text-3xl mb-2">{getTeamLogo(fixture.awayTeam)}</div>
                            <p className="font-bold text-sm">{getTeamName(fixture.awayTeam)}</p>
                          </div>
                        </div>
                        {fixture.venue && (
                          <div className="flex items-center gap-2 justify-center mt-3 text-sm text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span>{fixture.venue}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {getFixturesByStatus('scheduled').length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <Calendar className="w-12 h-12 mx-auto mb-4 opacity-30" />
                      <p>No upcoming fixtures scheduled</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'results' && (
                <div className="p-4 sm:p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Match Results</h2>
                  <div className="space-y-4">
                    {getFixturesByStatus('completed').map(fixture => (
                      <div key={fixture.id} className="bg-gray-50 rounded-xl p-4 hover:shadow-md transition">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                          <Calendar className="w-4 h-4" />
                          <span>{fixture.date}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 items-center">
                          <div className="text-center">
                            <div className="text-3xl mb-2">{getTeamLogo(fixture.homeTeam)}</div>
                            <p className="font-bold text-sm mb-2">{getTeamName(fixture.homeTeam)}</p>
                            <div className={`text-3xl font-bold ${parseInt(fixture.homeScore) > parseInt(fixture.awayScore) ? 'text-green-600' : 'text-gray-400'}`}>
                              {fixture.homeScore}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-gray-500 mb-2">Final</div>
                            <div className="text-xl font-bold text-gray-400">-</div>
                          </div>
                          <div className="text-center">
                            <div className="text-3xl mb-2">{getTeamLogo(fixture.awayTeam)}</div>
                            <p className="font-bold text-sm mb-2">{getTeamName(fixture.awayTeam)}</p>
                            <div className={`text-3xl font-bold ${parseInt(fixture.awayScore) > parseInt(fixture.homeScore) ? 'text-green-600' : 'text-gray-400'}`}>
                              {fixture.awayScore}
                            </div>
                          </div>
                        </div>
                        {fixture.venue && (
                          <div className="flex items-center gap-2 justify-center mt-3 text-sm text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span>{fixture.venue}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {getFixturesByStatus('completed').length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <Trophy className="w-12 h-12 mx-auto mb-4 opacity-30" />
                      <p>No completed matches yet</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'teams' && (
                <div className="p-4 sm:p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Tournament Teams</h2>
                    {isAdmin && (
                      <button onClick={() => setShowAddTeam(true)} className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition">
                        <Plus className="w-4 h-4" />
                        Add Team
                      </button>
                    )}
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedTournament.teams && Object.entries(selectedTournament.teams).map(([id, team]) => (
                      <div key={id} className="bg-gray-50 rounded-xl p-4 hover:shadow-md transition group">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="text-4xl">{team.logo}</div>
                            <div>
                              <h3 className="font-bold text-lg text-gray-800">{team.name}</h3>
                              <p className="text-sm text-gray-600">
                                {selectedTournament.standings[id]?.played || 0} matches played
                              </p>
                            </div>
                          </div>
                          {isAdmin && (
                            <button
                              onClick={() => deleteTeam(id)}
                              className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {(!selectedTournament.teams || Object.keys(selectedTournament.teams).length === 0) && (
                    <div className="text-center py-12 text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
                      <p>No teams added yet</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {!selectedTournament && tournaments.length === 0 && (
          <div className="text-center py-20">
            <Trophy className="w-20 h-20 mx-auto mb-6 text-gray-300" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Tournaments Yet</h3>
            <p className="text-gray-600 mb-6">Create your first tournament to get started</p>
            {isAdmin && (
              <button onClick={() => setShowAddTournament(true)} className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition">
                Create Tournament
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TournamentPage;