'use client';
import { Check, Edit2, History, Lock, LogOut, Plus, Save, Trash2, Trophy, Users, X } from 'lucide-react';
import { useState } from 'react';

const BasketballClubApp = () => {
  const [activeTab, setActiveTab] = useState('scoreboard');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  const ADMIN_PASSWORD = 'admin123';

  const [members, setMembers] = useState([
    { id: 1, name: 'James Walker', position: 'Point Guard', number: 7, photo: '👤', stats: { points: 234, assists: 89, rebounds: 45 } },
    { id: 2, name: 'Sarah Chen', position: 'Shooting Guard', number: 23, photo: '👤', stats: { points: 189, assists: 56, rebounds: 67 } },
    { id: 3, name: 'Marcus Johnson', position: 'Center', number: 15, photo: '👤', stats: { points: 312, assists: 34, rebounds: 156 } },
    { id: 4, name: 'Emma Davis', position: 'Small Forward', number: 11, photo: '👤', stats: { points: 267, assists: 72, rebounds: 98 } },
  ]);

  const [currentMatch, setCurrentMatch] = useState({
    homeScore: 0,
    awayScore: 0,
    awayTeam: 'Opponent Team',
    quarter: 1,
    isLive: false,
    players: []
  });

  const [matchHistory, setMatchHistory] = useState([
    { id: 1, date: '2025-10-10', opponent: 'Thunder Squad', homeScore: 87, awayScore: 82, result: 'W', players: [1, 2, 3] },
    { id: 2, date: '2025-10-05', opponent: 'Eagles United', homeScore: 76, awayScore: 79, result: 'L', players: [1, 3, 4] },
    { id: 3, date: '2025-09-28', opponent: 'Phoenix Risers', homeScore: 92, awayScore: 88, result: 'W', players: [2, 3, 4] },
  ]);

  const [editingMatch, setEditingMatch] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [showPlayerSelect, setShowPlayerSelect] = useState(false);
  const [selectedMatchDetail, setSelectedMatchDetail] = useState(null);
  const [newMember, setNewMember] = useState({ name: '', position: '', number: '', photo: '' });

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

  const handleLogout = () => {
    setIsAdmin(false);
    setEditingMatch(false);
  };

  const updateScore = (team, delta) => {
    if (!currentMatch.isLive || !isAdmin) return;
    setCurrentMatch(prev => ({
      ...prev,
      [team]: Math.max(0, prev[team] + delta)
    }));
  };

  const changeQuarter = (delta) => {
    if (!isAdmin) return;
    setCurrentMatch(prev => ({
      ...prev,
      quarter: Math.max(1, Math.min(4, prev.quarter + delta))
    }));
  };

  const toggleMatchStatus = () => {
    if (!isAdmin) return;
    setCurrentMatch(prev => ({ ...prev, isLive: !prev.isLive }));
  };

  const togglePlayer = (playerId) => {
    if (!isAdmin) return;
    setCurrentMatch(prev => ({
      ...prev,
      players: prev.players.includes(playerId)
        ? prev.players.filter(id => id !== playerId)
        : [...prev.players, playerId]
    }));
  };

  const saveMatchToHistory = () => {
    if (!isAdmin) return;
    if (currentMatch.homeScore === 0 && currentMatch.awayScore === 0) return;
    
    const result = currentMatch.homeScore > currentMatch.awayScore ? 'W' : 'L';
    const newMatch = {
      id: matchHistory.length + 1,
      date: new Date().toISOString().split('T')[0],
      opponent: currentMatch.awayTeam,
      homeScore: currentMatch.homeScore,
      awayScore: currentMatch.awayScore,
      result,
      players: [...currentMatch.players]
    };
    
    setMatchHistory([newMatch, ...matchHistory]);
    setCurrentMatch({
      homeScore: 0,
      awayScore: 0,
      awayTeam: 'Opponent Team',
      quarter: 1,
      isLive: false,
      players: []
    });
    setEditingMatch(false);
  };

  const deleteMatch = (matchId) => {
    if (!isAdmin) return;
    setMatchHistory(matchHistory.filter(m => m.id !== matchId));
    setSelectedMatchDetail(null);
  };

  const addMember = () => {
    if (!isAdmin) return;
    if (newMember.name && newMember.position && newMember.number) {
      const member = {
        id: members.length + 1,
        name: newMember.name,
        position: newMember.position,
        number: parseInt(newMember.number),
        photo: newMember.photo || '👤',
        stats: { points: 0, assists: 0, rebounds: 0 }
      };
      setMembers([...members, member]);
      setNewMember({ name: '', position: '', number: '', photo: '' });
      setShowAddMember(false);
    }
  };

  const updateMember = () => {
    if (!isAdmin || !editingMember) return;
    setMembers(members.map(m => m.id === editingMember.id ? editingMember : m));
    setEditingMember(null);
  };

  const deleteMember = (memberId) => {
    if (!isAdmin) return;
    setMembers(members.filter(m => m.id !== memberId));
  };

  const getPlayersForMatch = (playerIds) => {
    return members.filter(m => playerIds.includes(m.id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
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
              <button
                onClick={handleLogin}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-semibold transition"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      )}

      {showPlayerSelect && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Select Players</h2>
              <button onClick={() => setShowPlayerSelect(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-3">
              {members.map(member => (
                <div
                  key={member.id}
                  onClick={() => togglePlayer(member.id)}
                  className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition ${
                    currentMatch.players.includes(member.id)
                      ? 'bg-orange-100 border-2 border-orange-500'
                      : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-2xl shadow">
                    {member.photo}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-800">{member.name}</div>
                    <div className="text-sm text-gray-600">#{member.number}</div>
                  </div>
                  {currentMatch.players.includes(member.id) && (
                    <Check className="w-6 h-6 text-orange-600" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedMatchDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Match Details</h2>
              <button onClick={() => setSelectedMatchDetail(null)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="mb-6 p-4 bg-gradient-to-r from-orange-100 to-blue-100 rounded-xl">
              <div className="text-center mb-4">
                <div className="text-sm text-gray-600 mb-2">{selectedMatchDetail.date}</div>
                <div className="text-2xl font-bold text-gray-800 mb-2">
                  Pauline's Club vs {selectedMatchDetail.opponent}
                </div>
                <div className="text-4xl font-bold text-gray-800">
                  {selectedMatchDetail.homeScore} - {selectedMatchDetail.awayScore}
                </div>
                <div className={`inline-block px-4 py-1 rounded-full text-white font-bold mt-3 ${
                  selectedMatchDetail.result === 'W' ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  {selectedMatchDetail.result === 'W' ? 'Victory' : 'Defeat'}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-bold text-gray-800 mb-3">Players in this match:</h3>
              <div className="space-y-2">
                {getPlayersForMatch(selectedMatchDetail.players).map(player => (
                  <div key={player.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl shadow">
                      {player.photo}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-800 text-sm">{player.name}</div>
                      <div className="text-xs text-gray-600">{player.position}</div>
                    </div>
                    <div className="bg-orange-600 text-white px-2 py-1 rounded text-xs font-bold">
                      #{player.number}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {isAdmin && (
              <button
                onClick={() => deleteMatch(selectedMatchDetail.id)}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
              >
                <Trash2 className="w-5 h-5" />
                Delete Match
              </button>
            )}
          </div>
        </div>
      )}

      {editingMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Edit Player</h2>
              <button onClick={() => setEditingMember(null)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Player Photo (emoji)"
                value={editingMember.photo}
                onChange={(e) => setEditingMember({ ...editingMember, photo: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <input
                type="text"
                placeholder="Full Name"
                value={editingMember.name}
                onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <input
                type="text"
                placeholder="Position"
                value={editingMember.position}
                onChange={(e) => setEditingMember({ ...editingMember, position: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <input
                type="number"
                placeholder="Jersey Number"
                value={editingMember.number}
                onChange={(e) => setEditingMember({ ...editingMember, number: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Points</label>
                  <input
                    type="number"
                    value={editingMember.stats.points}
                    onChange={(e) => setEditingMember({
                      ...editingMember,
                      stats: { ...editingMember.stats, points: parseInt(e.target.value) || 0 }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Assists</label>
                  <input
                    type="number"
                    value={editingMember.stats.assists}
                    onChange={(e) => setEditingMember({
                      ...editingMember,
                      stats: { ...editingMember.stats, assists: parseInt(e.target.value) || 0 }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Rebounds</label>
                  <input
                    type="number"
                    value={editingMember.stats.rebounds}
                    onChange={(e) => setEditingMember({
                      ...editingMember,
                      stats: { ...editingMember.stats, rebounds: parseInt(e.target.value) || 0 }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              <button
                onClick={updateMember}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-semibold transition"
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this player?')) {
                    deleteMember(editingMember.id);
                    setEditingMember(null);
                  }
                }}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
              >
                <Trash2 className="w-5 h-5" />
                Delete Player
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Pauline's Club</h1>
              <p className="text-orange-100 text-xs sm:text-sm mt-1">Basketball Excellence</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center text-3xl sm:text-4xl shadow-lg">
                🏀
              </div>
              {isAdmin ? (
                <button
                  onClick={handleLogout}
                  className="bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg flex items-center gap-2 transition text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowLogin(true)}
                  className="bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg flex items-center gap-2 transition text-sm"
                >
                  <Lock className="w-4 h-4" />
                  <span className="hidden sm:inline">Admin</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { id: 'scoreboard', icon: Trophy, label: 'Live' },
              { id: 'members', icon: Users, label: 'Team' },
              { id: 'history', icon: History, label: 'History' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 font-medium transition-all whitespace-nowrap text-sm ${
                  activeTab === tab.id
                    ? 'text-orange-600 border-b-2 border-orange-600'
                    : 'text-gray-600 hover:text-orange-600'
                }`}
              >
                <tab.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-8">
        {activeTab === 'scoreboard' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${currentMatch.isLive ? 'bg-red-400 animate-pulse' : 'bg-gray-400'}`} />
                  <span className="text-white font-semibold text-sm sm:text-base">
                    {currentMatch.isLive ? 'LIVE MATCH' : 'MATCH SETUP'}
                  </span>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => setEditingMatch(!editingMatch)}
                    className="text-white hover:bg-white/20 p-2 rounded-lg transition"
                  >
                    <Edit2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                )}
              </div>

              <div className="p-4 sm:p-8">
                {isAdmin && editingMatch && (
                  <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-orange-50 rounded-lg">
                    <input
                      type="text"
                      value={currentMatch.awayTeam}
                      onChange={(e) => setCurrentMatch({ ...currentMatch, awayTeam: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                      placeholder="Opponent team name"
                    />
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4 sm:gap-8 items-center mb-6 sm:mb-8">
                  <div className="text-center">
                    <div className="text-xs sm:text-sm font-semibold text-gray-600 mb-1 sm:mb-2">HOME</div>
                    <div className="text-sm sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">Pauline's Club</div>
                    <div className="text-4xl sm:text-6xl font-bold text-orange-600 mb-3 sm:mb-4">{currentMatch.homeScore}</div>
                    {isAdmin && currentMatch.isLive && (
                      <div className="flex gap-1 sm:gap-2 justify-center flex-wrap">
                        <button onClick={() => updateScore('homeScore', 1)} className="bg-green-500 hover:bg-green-600 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-lg font-semibold text-xs sm:text-base">+1</button>
                        <button onClick={() => updateScore('homeScore', 2)} className="bg-green-600 hover:bg-green-700 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-lg font-semibold text-xs sm:text-base">+2</button>
                        <button onClick={() => updateScore('homeScore', 3)} className="bg-green-700 hover:bg-green-800 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-lg font-semibold text-xs sm:text-base">+3</button>
                      </div>
                    )}
                  </div>

                  <div className="text-center">
                    <div className="text-2xl sm:text-4xl font-bold text-gray-300 mb-3 sm:mb-4">VS</div>
                    <div className="bg-gray-100 rounded-lg p-2 sm:p-3 inline-block">
                      <div className="text-xs sm:text-sm text-gray-600 mb-1">Quarter</div>
                      <div className="flex items-center gap-2 sm:gap-3 justify-center">
                        {isAdmin && (
                          <button onClick={() => changeQuarter(-1)} className="bg-gray-300 hover:bg-gray-400 text-gray-700 w-6 h-6 sm:w-8 sm:h-8 rounded-full font-bold text-sm sm:text-base" disabled={currentMatch.quarter === 1}>-</button>
                        )}
                        <div className="text-2xl sm:text-3xl font-bold text-gray-800 min-w-[1.5rem] sm:min-w-[2rem]">{currentMatch.quarter}</div>
                        {isAdmin && (
                          <button onClick={() => changeQuarter(1)} className="bg-gray-300 hover:bg-gray-400 text-gray-700 w-6 h-6 sm:w-8 sm:h-8 rounded-full font-bold text-sm sm:text-base" disabled={currentMatch.quarter === 4}>+</button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-xs sm:text-sm font-semibold text-gray-600 mb-1 sm:mb-2">AWAY</div>
                    <div className="text-sm sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">{currentMatch.awayTeam}</div>
                    <div className="text-4xl sm:text-6xl font-bold text-blue-600 mb-3 sm:mb-4">{currentMatch.awayScore}</div>
                    {isAdmin && currentMatch.isLive && (
                      <div className="flex gap-1 sm:gap-2 justify-center flex-wrap">
                        <button onClick={() => updateScore('awayScore', 1)} className="bg-blue-500 hover:bg-blue-600 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-lg font-semibold text-xs sm:text-base">+1</button>
                        <button onClick={() => updateScore('awayScore', 2)} className="bg-blue-600 hover:bg-blue-700 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-lg font-semibold text-xs sm:text-base">+2</button>
                        <button onClick={() => updateScore('awayScore', 3)} className="bg-blue-700 hover:bg-blue-800 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-lg font-semibold text-xs sm:text-base">+3</button>
                      </div>
                    )}
                  </div>
                </div>

                {currentMatch.players.length > 0 && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-blue-50 rounded-xl">
                    <div className="text-sm font-semibold text-gray-700 mb-3">Playing Now:</div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {getPlayersForMatch(currentMatch.players).map(player => (
                        <div key={player.id} className="flex items-center gap-2 bg-white rounded-full px-3 py-2 shadow">
                          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-lg">{player.photo}</div>
                          <span className="text-sm font-medium text-gray-800">{player.name.split(' ')[0]}</span>
                          <span className="text-xs bg-orange-600 text-white px-2 py-0.5 rounded-full">#{player.number}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {isAdmin && (
                  <div className="space-y-3">
                    <button onClick={() => setShowPlayerSelect(true)} className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2">
                      <Users className="w-5 h-5" />
                      Select Players ({currentMatch.players.length})
                    </button>
                    
                    <div className="flex gap-3 flex-wrap">
                      <button onClick={toggleMatchStatus} className={`flex-1 min-w-[140px] px-6 py-3 rounded-lg font-semibold transition shadow-lg ${currentMatch.isLive ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}>
                        {currentMatch.isLive ? 'End Match' : 'Start Match'}
                      </button>
                      {!currentMatch.isLive && (currentMatch.homeScore > 0 || currentMatch.awayScore > 0) && (
                        <button onClick={saveMatchToHistory} className="flex-1 min-w-[140px] bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition shadow-lg flex items-center justify-center gap-2">
                          <Save className="w-5 h-5" />
                          Save Match
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {!isAdmin && (
                  <div className="text-center text-gray-500 text-sm mt-4">
                    <Lock className="w-5 h-5 inline-block mr-2" />
                    Match controls are restricted to admin only
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Team Members</h2>
              {isAdmin && (
                <button onClick={() => setShowAddMember(true)} className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition shadow text-sm">
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Add Member</span>
                  <span className="sm:hidden">Add</span>
                </button>
              )}
            </div>

            {isAdmin && showAddMember && (
              <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">New Member</h3>
                  <button onClick={() => setShowAddMember(false)} className="text-gray-500 hover:text-gray-700">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Player Photo (emoji like 👤 🏀 ⭐)"
                    value={newMember.photo}
                    onChange={(e) => setNewMember({ ...newMember, photo: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <input
                    type="text"
                    placeholder="Position"
                    value={newMember.position}
                    onChange={(e) => setNewMember({ ...newMember, position: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <input
                    type="number"
                    placeholder="Jersey Number"
                    value={newMember.number}
                    onChange={(e) => setNewMember({ ...newMember, number: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <button onClick={addMember} className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-semibold transition">
                    Add Player
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {members.map(member => (
                <div key={member.id} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition">
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 h-20 sm:h-24" />
                  <div className="px-4 sm:px-6 pb-4 sm:pb-6 -mt-10 sm:-mt-12">
                    <div className="flex items-end gap-3 sm:gap-4 mb-3 sm:mb-4">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-full flex items-center justify-center text-4xl sm:text-5xl shadow-lg border-4 border-white">
                        {member.photo}
                      </div>
                      <div className="flex-1 mb-2">
                        <div className="bg-orange-600 text-white rounded-lg px-3 py-1 inline-block text-sm font-bold">
                          #{member.number}
                        </div>
                      </div>
                      {isAdmin && (
                        <button onClick={() => setEditingMember(member)} className="mb-2 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition">
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">{member.name}</h3>
                    <p className="text-orange-600 font-semibold mb-3 sm:mb-4 text-sm sm:text-base">{member.position}</p>
                    <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-3 sm:pt-4 border-t">
                      <div className="text-center">
                        <div className="text-xl sm:text-2xl font-bold text-gray-800">{member.stats.points}</div>
                        <div className="text-xs text-gray-600">Points</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl sm:text-2xl font-bold text-gray-800">{member.stats.assists}</div>
                        <div className="text-xs text-gray-600">Assists</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl sm:text-2xl font-bold text-gray-800">{member.stats.rebounds}</div>
                        <div className="text-xs text-gray-600">Rebounds</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Match History</h2>
            <div className="space-y-3 sm:space-y-4">
              {matchHistory.map(match => (
                <div key={match.id} onClick={() => setSelectedMatchDetail(match)} className="bg-white rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition cursor-pointer">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4 sm:gap-6">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-lg sm:text-xl ${
                        match.result === 'W' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {match.result}
                      </div>
                      <div>
                        <div className="text-base sm:text-lg font-bold text-gray-800">
                          Pauline's Club vs {match.opponent}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600">{match.date}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl sm:text-3xl font-bold text-gray-800">
                        {match.homeScore} - {match.awayScore}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">Final Score</div>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {getPlayersForMatch(match.players).slice(0, 3).map(player => (
                      <div key={player.id} className="flex items-center gap-1 bg-gray-100 rounded-full px-2 py-1">
                        <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-sm">{player.photo}</div>
                        <span className="text-xs text-gray-700">{player.name.split(' ')[0]}</span>
                      </div>
                    ))}
                    {match.players.length > 3 && (
                      <div className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-xs text-gray-600">
                        +{match.players.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BasketballClubApp;