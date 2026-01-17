'use client';

import { onValue, push, ref, remove, set, update } from 'firebase/database';
import { Check, Edit2, History, Lock, LogOut, Plus, Save, Trash2, Trophy, Users, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { database } from '../firebase'; // Adjust path based on your firebase.js location

const BasketballClubApp = () => {
  const [activeTab, setActiveTab] = useState('scoreboard');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  const ADMIN_PASSWORD = 'Basketball@123';

  const [members, setMembers] = useState([]);
  const [currentMatch, setCurrentMatch] = useState({
    homeScore: 0,
    awayScore: 0,
    awayTeam: 'Opponent Team',
    quarter: 1,
    isLive: false,
    players: [],
    startTime: '',
  matchDate: ''
  });
  const [matchHistory, setMatchHistory] = useState([]);
const [cheers, setCheers] = useState({
  total: 0,
  recent: []
});

  const [editingMatch, setEditingMatch] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [showPlayerSelect, setShowPlayerSelect] = useState(false);
  const [selectedMatchDetail, setSelectedMatchDetail] = useState(null);
  const [newMember, setNewMember] = useState({ name: '', position: '', number: '', photo: '' });

  const [liveStreamUrl, setLiveStreamUrl] = useState('');
const [comments, setComments] = useState([]);
const [newComment, setNewComment] = useState('');
const [userName, setUserName] = useState('');
const [showNameInput, setShowNameInput] = useState(true);

  // Firebase: Listen to members
  useEffect(() => {
    const membersRef = ref(database, 'members');
    const unsubscribe = onValue(membersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const membersArray = Object.entries(data).map(([id, member]) => ({
          id,
          ...member
        }));
        setMembers(membersArray);
      } else {
        setMembers([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Firebase: Listen to current match
  useEffect(() => {
    const matchRef = ref(database, 'currentMatch');
    const unsubscribe = onValue(matchRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setCurrentMatch({
          homeScore: data.homeScore || 0,
          awayScore: data.awayScore || 0,
          awayTeam: data.awayTeam || 'Opponent Team',
          quarter: data.quarter || 1,
          isLive: data.isLive || false,
          players: data.players || []
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // Firebase: Listen to match history
  useEffect(() => {
    const historyRef = ref(database, 'matchHistory');
    const unsubscribe = onValue(historyRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const historyArray = Object.entries(data).map(([id, match]) => ({
          id,
          ...match
        }));
        historyArray.sort((a, b) => new Date(b.date) - new Date(a.date));
        setMatchHistory(historyArray);
      } else {
        setMatchHistory([]);
      }
    });
    return () => unsubscribe();
  }, []);

  
// Firebase: Listen to cheers
useEffect(() => {
  const cheersRef = ref(database, 'currentMatch/cheers');
  const unsubscribe = onValue(cheersRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      setCheers(data);
      
      // Play sound for everyone when new cheer arrives
      if (data.lastCheer && data.lastCheer.soundUrl && data.lastCheer.playSound) {
        new Audio(data.lastCheer.soundUrl).play().catch(err => console.log('Audio play failed:', err));
      }
    } else {
      setCheers({ total: 0, recent: [] });
    }
  });
  return () => unsubscribe();
}, []);

// Firebase: Listen to live stream
useEffect(() => {
  const streamRef = ref(database, 'currentMatch/liveStream');
  const unsubscribe = onValue(streamRef, (snapshot) => {
    const data = snapshot.val();
    setLiveStreamUrl(data || '');
  });
  return () => unsubscribe();
}, []);

// Firebase: Listen to comments
useEffect(() => {
  const commentsRef = ref(database, 'currentMatch/comments');
  const unsubscribe = onValue(commentsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const commentsArray = Object.entries(data).map(([id, comment]) => ({
        id,
        ...comment
      })).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setComments(commentsArray);
    } else {
      setComments([]);
    }
  });
  return () => unsubscribe();
}, []);

// Load username from browser
useEffect(() => {
  const savedName = localStorage.getItem('userName');
  if (savedName) {
    setUserName(savedName);
    setShowNameInput(false);
  }
}, []);

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
    const matchRef = ref(database, 'currentMatch');
    update(matchRef, {
      [team]: Math.max(0, currentMatch[team] + delta)
    });
  };

  const changeQuarter = (delta) => {
    if (!isAdmin) return;
    const matchRef = ref(database, 'currentMatch');
    update(matchRef, {
      quarter: Math.max(1, Math.min(4, currentMatch.quarter + delta))
    });
  };

  const toggleMatchStatus = () => {
    if (!isAdmin) return;
    const matchRef = ref(database, 'currentMatch');
    update(matchRef, {
      isLive: !currentMatch.isLive
    });
  };

  const updateAwayTeam = (teamName) => {
    if (!isAdmin) return;
    const matchRef = ref(database, 'currentMatch');
    update(matchRef, {
      awayTeam: teamName
    });
  };
 
  const togglePlayer = (playerId) => {
    if (!isAdmin) return;
    const matchRef = ref(database, 'currentMatch');
    const newPlayers = currentMatch.players.includes(playerId)
      ? currentMatch.players.filter(id => id !== playerId)
      : [...currentMatch.players, playerId];
    update(matchRef, {
      players: newPlayers
    });
  };

const addCheer = (type, emoji, soundUrl) => {
  const matchRef = ref(database, 'currentMatch/cheers');
  const timestamp = new Date().toISOString();
  const newCheer = {
    type,
    emoji,
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    timestamp,
    soundUrl,  // ADD THIS
    playSound: true  // ADD THIS - trigger for others
  };
  
  const newTotal = (cheers.total || 0) + 1;
  const newRecent = [newCheer, ...(cheers.recent || [])].slice(0, 10);
  
  update(matchRef, {
    total: newTotal,
    recent: newRecent,
    lastCheer: newCheer  // ADD THIS - to trigger sound for everyone
  });
};
//live stream function
const updateLiveStream = (url) => {
  if (!isAdmin) return;
  const streamRef = ref(database, 'currentMatch/liveStream');
  set(streamRef, url);
};

const addComment = () => {
  if (!newComment.trim() || !userName.trim()) return;
  
  const commentsRef = ref(database, 'currentMatch/comments');
  const newCommentRef = push(commentsRef);
  
  set(newCommentRef, {
    text: newComment,
    userName: userName,
    timestamp: new Date().toISOString(),
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  });
  
  setNewComment('');
};

const deleteComment = (commentId) => {
  if (!isAdmin) return;
  const commentRef = ref(database, `currentMatch/comments/${commentId}`);
  remove(commentRef);
};

const saveName = () => {
  if (userName.trim()) {
    localStorage.setItem('userName', userName);
    setShowNameInput(false);
  }
};

const getYouTubeEmbedUrl = (url) => {
  if (!url) return '';
  const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  return videoId ? `https://www.youtube.com/embed/${videoId[1]}?autoplay=1` : '';
};

const getTwitchEmbedUrl = (url) => {
  if (!url) return '';
  const channelMatch = url.match(/twitch\.tv\/([a-zA-Z0-9_]+)/);
  return channelMatch ? `https://player.twitch.tv/?channel=${channelMatch[1]}&parent=${window.location.hostname}` : '';
};

  const saveMatchToHistory = () => {
    if (!isAdmin) return;
    if (currentMatch.homeScore === 0 && currentMatch.awayScore === 0) return;
    
    const result = currentMatch.homeScore > currentMatch.awayScore ? 'W' : 'L';
    const historyRef = ref(database, 'matchHistory');
    const newMatchRef = push(historyRef);
    
    set(newMatchRef, {
      date: new Date().toISOString().split('T')[0],
      opponent: currentMatch.awayTeam,
      homeScore: currentMatch.homeScore,
      awayScore: currentMatch.awayScore,
      result,
      players: currentMatch.players
    });

    const matchRef = ref(database, 'currentMatch');
    set(matchRef, {
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
    const matchRef = ref(database, `matchHistory/${matchId}`);
    remove(matchRef);
    setSelectedMatchDetail(null);
  };

  const addMember = () => {
    if (!isAdmin) return;
    if (newMember.name && newMember.position && newMember.number) {
      const membersRef = ref(database, 'members');
      const newMemberRef = push(membersRef);
      
      set(newMemberRef, {
        name: newMember.name,
        position: newMember.position,
        number: parseInt(newMember.number),
        photo: newMember.photo || '👤',
        stats: { points: 0, assists: 0, rebounds: 0 }
      });
      
      setNewMember({ name: '', position: '', number: '', photo: '' });
      setShowAddMember(false);
    }
  };

  const updateMember = () => {
    if (!isAdmin || !editingMember) return;
    const memberRef = ref(database, `members/${editingMember.id}`);
    update(memberRef, {
      name: editingMember.name,
      position: editingMember.position,
      number: editingMember.number,
      photo: editingMember.photo,
      stats: editingMember.stats
    });
    setEditingMember(null);
  };

  const deleteMember = (memberId) => {
    if (!isAdmin) return;
    const memberRef = ref(database, `members/${memberId}`);
    remove(memberRef);
  };

  const getPlayersForMatch = (playerIds) => {
    return members.filter(m => playerIds && playerIds.includes(m.id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Admin Login</h2>
              <button onClick={() => { setShowLogin(false); setPassword(''); setLoginError(''); }} className="text-black-500 hover:text-black-700">
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
                className="w-full px-4 py-3 border text-black-500 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
              <button onClick={handleLogin} className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-semibold transition">
                Login
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Player Selection Modal */}
      {showPlayerSelect && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Select Players</h2>
              <button onClick={() => setShowPlayerSelect(false)} className="text-black-500 hover:text-black-700">
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
                    <div className="font-bold text-black-800">{member.name}</div>
                    <div className="text-sm text-black-600">#{member.number}</div>
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

      {/* Match Detail Modal */}
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
                  OUTR  vs {selectedMatchDetail.opponent}
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
                {getPlayersForMatch(selectedMatchDetail.players || []).map(player => (
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

      {/* Edit Member Modal */}
      {editingMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Edit Player</h2>
              <button onClick={() => setEditingMember(null)} className="text-black-500 hover:text-black-700">
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
                className="w-full px-4 py-3 border border-black-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                  <label className="text-xs text-black-600 mb-1 block">Points</label>
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
              >isAdmin
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

      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">OUTR </h1>
              <p className="text-orange-100 text-xs sm:text-sm mt-1">Basketball Excellence</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center text-3xl sm:text-4xl shadow-lg">
                🏀
              </div>
              {isAdmin ? (
                <button onClick={handleLogout} className="bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg flex items-center gap-2 transition text-sm">
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              ) : (
                <button onClick={() => setShowLogin(true)} className="bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg flex items-center gap-2 transition text-sm">
                  <Lock className="w-4 h-4" />
                  <span className="hidden sm:inline">Admin</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
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



      {/* Live Stream & Comments Section */}
      
{(liveStreamUrl || isAdmin) && (
  <div className="mb-6 grid lg:grid-cols-3 gap-6">
    {/* Live Stream */}
    <div className="lg:col-span-2">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400 animate-pulse"></div>
            <span className="text-white font-semibold text-sm sm:text-base">LIVE STREAM</span>
          </div>
          {isAdmin && (
            <button
              onClick={() => {
                const url = prompt('Enter YouTube or Twitch stream URL:');
                if (url !== null) updateLiveStream(url);
              }}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {liveStreamUrl ? (
          <div className="relative pt-[56.25%] bg-black">
            <iframe
              src={getYouTubeEmbedUrl(liveStreamUrl) || getTwitchEmbedUrl(liveStreamUrl)}
              className="absolute top-0 left-0 w-full h-full"
              frameBorder="0"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500">
            <div className="text-6xl mb-4">📺</div>
            <p>No live stream active</p>
            {isAdmin && <p className="text-sm mt-2">Click edit to add stream URL</p>}
          </div>
        )}
      </div>
    </div>

    {/* Live Comments Chat */}
    <div className="lg:col-span-1">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden h-full flex flex-col">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3">
          <h3 className="text-white font-semibold text-sm sm:text-base flex items-center gap-2">
            💬 Live Chat
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">{comments.length}</span>
          </h3>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 max-h-[400px]">
          {comments.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p className="text-sm">No comments yet</p>
              <p className="text-xs mt-1">Be the first to comment! 💬</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition group">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-sm text-blue-600">{comment.userName}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{comment.time}</span>
                    {isAdmin && (
                      <button
                        onClick={() => deleteComment(comment.id)}
                        className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-700">{comment.text}</p>
              </div>
            ))
          )}
        </div>

        {/* Comment Input */}
        <div className="border-t p-4 bg-white">
          {showNameInput ? (
            <div className="space-y-2">
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && saveName()}
                placeholder="Enter your name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                onClick={saveName}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold text-sm transition"
              >
                Set Name
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-gray-600">Commenting as: <strong>{userName}</strong></span>
                <button
                  onClick={() => setShowNameInput(true)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Change
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addComment()}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button
                  onClick={addComment}
                  disabled={!newComment.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-semibold transition text-sm"
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
)}

      {/* Content */}
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
                  <button onClick={() => setEditingMatch(!editingMatch)} className="text-white hover:bg-white/20 p-2 rounded-lg transition">
                    <Edit2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                )}
              </div>

              <div className="p-4 sm:p-8">
                {isAdmin && editingMatch && (
  <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-orange-50 rounded-lg space-y-3">
    <input
      type="text"
      value={currentMatch.awayTeam}
      onChange={(e) => updateAwayTeam(e.target.value)}
      className="w-full px-3 sm:px-4 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
      placeholder="Opponent team name"
    />
    <div className="grid grid-cols-2 gap-3">
      <input
        type="date"
        value={currentMatch.matchDate}
        onChange={(e) => {
          const matchRef = ref(database, 'currentMatch');
          update(matchRef, { matchDate: e.target.value });
        }}
        className="w-full px-3 sm:px-4 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
      />
      <input
        type="time"
        value={currentMatch.startTime}
        onChange={(e) => {
          const matchRef = ref(database, 'currentMatch');
          update(matchRef, { startTime: e.target.value });
        }}
        className="w-full px-3 sm:px-4 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
      />
    </div>
  </div>
)}

                <div className="grid grid-cols-3 gap-4 sm:gap-8 items-center mb-6 sm:mb-8">
                  <div className="text-center">
                    <div className="text-xs sm:text-sm font-semibold text-gray-600 mb-1 sm:mb-2">HOME</div>
                    <div className="text-sm sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">OUTR </div>
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
  {currentMatch.matchDate && currentMatch.startTime && (
    <div className="mb-2 text-xs sm:text-sm text-gray-600 font-medium">
      📅 {new Date(currentMatch.matchDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} 
      {' '}⏰ {currentMatch.startTime}
    </div>
  )}
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

                {currentMatch.players && currentMatch.players.length > 0 && (
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

                {/* Cheer Section - Enhanced */}
<div className="mb-6 p-6 bg-gradient-to-r from-orange-50 via-yellow-50 to-orange-50 rounded-xl border-2 border-orange-200">
  <div className="flex justify-between items-center mb-4">
    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
      📣 Cheer for the Team!
    </h3>
    <div className="bg-orange-600 text-white px-4 py-2 rounded-full font-bold text-sm">
      {cheers.total || 0} Cheers 🎉
    </div>
  </div>
  
  {/* Cheer Buttons */}
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
    <button
     onClick={(e) => {
  addCheer('Cheer', '🎉', 'https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3');
        e.currentTarget.classList.add('animate-bounce');
        setTimeout(() => e.currentTarget.classList.remove('animate-bounce'), 500);
      }}
      className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition transform"
    >
      🎉 Cheer!
    </button>
    <button
      onClick={(e) => {
  addCheer('Applause', '👏', 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3');
        e.currentTarget.classList.add('animate-bounce');
        setTimeout(() => e.currentTarget.classList.remove('animate-bounce'), 500);
      }}
      className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition transform"
    >
      👏 Applause!
    </button>
    <button
      onClick={(e) => {
  addCheer('Fire', '🔥', 'https://assets.mixkit.co/active_storage/sfx/2021/2021-preview.mp3');
        e.currentTarget.classList.add('animate-bounce');
        setTimeout(() => e.currentTarget.classList.remove('animate-bounce'), 500);
      }}
      className="bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition transform"
    >
      🔥 Fire!
    </button>
    <button
      onClick={(e) => {
  addCheer('Lets Go', '🏀', 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3');
        e.currentTarget.classList.add('animate-bounce');
        setTimeout(() => e.currentTarget.classList.remove('animate-bounce'), 500);
      }}
      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition transform"
    >
      🏀 Let's Go!
    </button>
    <button
      onClick={(e) => {
  addCheer('Defense', '⚡', 'https://assets.mixkit.co/active_storage/sfx/2001/2001-preview.mp3');
        e.currentTarget.classList.add('animate-bounce');
        setTimeout(() => e.currentTarget.classList.remove('animate-bounce'), 500);
      }}
      className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition transform"
    >
      ⚡ Defense!
    </button>
    <button
     onClick={(e) => {
  addCheer('Shoot', '🎯', 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
        e.currentTarget.classList.add('animate-bounce');
        setTimeout(() => e.currentTarget.classList.remove('animate-bounce'), 500);
      }}
      className="bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition transform"
    >
      🎯 Shoot!
    </button>
  </div>

  {/* Recent Cheers Feed */}
  {cheers.recent && cheers.recent.length > 0 && (
    <div className="bg-white rounded-xl p-4 max-h-32 overflow-y-auto">
      <h4 className="text-sm font-bold text-gray-700 mb-2">Recent Cheers 🎊</h4>
      <div className="space-y-2">
        {cheers.recent.map((cheer, idx) => (
          <div key={idx} className="flex items-center justify-between text-sm animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{cheer.emoji}</span>
              <span className="font-semibold text-gray-700">{cheer.type}</span>
            </div>
            <span className="text-xs text-gray-500">{cheer.time}</span>
          </div>
        ))}
      </div>
    </div>
  )}
</div>

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
                          OUTR  vs {match.opponent}
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
                    {getPlayersForMatch(match.players || []).slice(0, 3).map(player => (
                      <div key={player.id} className="flex items-center gap-1 bg-gray-100 rounded-full px-2 py-1">
                        <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-sm">{player.photo}</div>
                        <span className="text-xs text-gray-700">{player.name.split(' ')[0]}</span>
                      </div>
                    ))}
                    {match.players && match.players.length > 3 && (
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
 {/* ADD THIS STYLE HERE */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
      
    </div>
    
  );
};

export default BasketballClubApp;