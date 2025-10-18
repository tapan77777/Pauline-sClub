'use client';
import { Bell, ChevronRight, Edit2, History, Save, Trophy, Users, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const PaulinesHomepage = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [editingJersey, setEditingJersey] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(false);
  const [jerseyUrl, setJerseyUrl] = useState('/tshirt.png');
  const [tempJerseyUrl, setTempJerseyUrl] = useState('');
  
  const ADMIN_PASSWORD = 'admin123';

  const [clubInfo] = useState({
    name: "Paulines Club",
    founded: 2015,
    location: "Rourkela, Odisha",
    ranking: 12,
    tagline: "Excellence in Every Game"
  });

  const [recentMatches] = useState([
    { id: 1, opponent: 'Thunder Squad', score: '87-82', result: 'W', date: '2025-10-10', image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400' },
    { id: 2, opponent: 'Eagles United', score: '76-79', result: 'L', date: '2025-10-05', image: 'https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?w=400' },
    { id: 3, opponent: 'Phoenix Risers', score: '92-88', result: 'W', date: '2025-09-28', image: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=400' },
  ]);

  const [announcements, setAnnouncements] = useState([
     { id: 1, title: 'Paulines VS Sports Arena,BPR match 11:30am', date: '18th October 2025', content: 'You can check live scores and match updates directly on our Qucik Acess' },
    { id: 3, title: 'Season Opening Next Week', date: '2025-10-15', content: 'Get ready for an exciting new season!' },
    { id: 2, title: 'New Tournament', date: '2025-10-18', content: 'Check out our Match updates.' },
   ,
  ]);

  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '' });

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

  const saveJersey = () => {
    if (tempJerseyUrl) {
      setJerseyUrl(tempJerseyUrl);
      setEditingJersey(false);
      setTempJerseyUrl('');
    }
  };

  const addAnnouncement = () => {
    if (newAnnouncement.title && newAnnouncement.content) {
      const announcement = {
        id: announcements.length + 1,
        title: newAnnouncement.title,
        date: new Date().toISOString().split('T')[0],
        content: newAnnouncement.content
      };
      setAnnouncements([announcement, ...announcements]);
      setNewAnnouncement({ title: '', content: '' });
      setEditingAnnouncement(false);
    }
  };

  const deleteAnnouncement = (id) => {
    setAnnouncements(announcements.filter(a => a.id !== id));
  };

  const navigateTo = (page) => {
    // In real implementation, this would navigate to the basketball app
    alert(`Navigate to ${page} page (integrate with your BasketballClubApp)`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
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

      {/* Jersey Edit Modal */}
      {editingJersey && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Update Jersey</h2>
              <button onClick={() => { setEditingJersey(false); setTempJerseyUrl(''); }} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                value={tempJerseyUrl}
                onChange={(e) => setTempJerseyUrl(e.target.value)}
                placeholder="Paste jersey image URL"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              {tempJerseyUrl && (
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">Preview:</p>
                  <img src={tempJerseyUrl} alt="Preview" className="w-full h-48 object-contain" onError={(e) => e.target.src = 'https://via.placeholder.com/400x300?text=Invalid+URL'} />
                </div>
              )}
              <button onClick={saveJersey} className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2">
                <Save className="w-5 h-5" />
                Save Jersey
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Announcement Edit Modal */}
      {editingAnnouncement && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">New Announcement</h2>
              <button onClick={() => { setEditingAnnouncement(false); setNewAnnouncement({ title: '', content: '' }); }} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                value={newAnnouncement.title}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                placeholder="Announcement title"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <textarea
                value={newAnnouncement.content}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                placeholder="Announcement content"
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button onClick={addAnnouncement} className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-semibold transition">
                Post Announcement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 to-blue-600/20"></div>
        
        {/* Header */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-4 sm:py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-orange-600 rounded-full flex items-center justify-center text-2xl sm:text-3xl shadow-lg">
                🏀
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">{clubInfo.name}</h1>
                <p className="text-xs sm:text-sm text-orange-300">{clubInfo.tagline}</p>
              </div>
            </div>
            {!isAdmin ? (
              <button onClick={() => setShowLogin(true)} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm backdrop-blur-sm transition">
                Admin
              </button>
            ) : (
              <button onClick={() => setIsAdmin(false)} className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm transition">
                Logout
              </button>
            )}
          </div>
        </div>

        {/* Jersey Showcase */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 sm:py-16">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left Side - Jersey */}
            <div className="relative">
              <div className="relative bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl p-8 sm:p-12 shadow-2xl">
                <div className="absolute top-4 left-4 text-white/30 text-6xl sm:text-8xl font-bold">
                  {clubInfo.name.split(' ')[0].toUpperCase()}
                </div>
                <img 
                  src={jerseyUrl} 
                  alt="Team Jersey" 
                  className="relative z-10 w-full h-64 sm:h-96 object-contain drop-shadow-2xl transform hover:scale-105 transition-transform duration-300"
                />
                {isAdmin && (
                  <button 
                    onClick={() => { setEditingJersey(true); setTempJerseyUrl(jerseyUrl); }}
                    className="absolute bottom-4 right-4 bg-white text-orange-600 p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                )}
                <div className="absolute bottom-4 left-4 text-white text-sm sm:text-base font-bold">
                  2024-25 HOME KIT
                </div>
              </div>
            </div>

            {/* Right Side - Club Info */}
            <div className="space-y-6 text-white">
              <div>
                <div className="text-orange-400 text-sm sm:text-base font-semibold mb-2">TEAM MEMBERS</div>
                <div className="text-5xl sm:text-7xl font-bold mb-2">{clubInfo.ranking}</div>
                <div className="text-gray-300 text-sm sm:text-base">Best Position: 1 (2022)</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-orange-400 text-xs sm:text-sm mb-1">CLUB FOUNDED</div>
                  <div className="text-2xl sm:text-3xl font-bold">{clubInfo.founded}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-orange-400 text-xs sm:text-sm mb-1">LOCATION</div>
                  <div className="text-base sm:text-lg font-bold">{clubInfo.location}</div>
                </div>
              </div>

              <div className="pt-4">
                <h3 className="text-xl sm:text-2xl font-bold mb-4">Quick Access</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/live-score" className="bg-orange-600 hover:bg-orange-700 text-white p-4 rounded-xl font-semibold transition flex flex-col items-center gap-2">
                    <Trophy className="w-6 h-6" />
                    <span className="text-sm">Live Score</span>
                  </Link>
                  <button onClick={() => navigateTo('Team')} className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl font-semibold transition flex flex-col items-center gap-2">
                    <Users className="w-6 h-6" />
                    <span className="text-sm">Team</span>
                  </button>
                  <button onClick={() => navigateTo('History')} className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-xl font-semibold transition flex flex-col items-center gap-2">
                    <History className="w-6 h-6" />
                    <span className="text-sm">History</span>
                  </button>
                  <Link href="/tournament" className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-xl font-semibold transition flex flex-col items-center gap-2">
                    <Trophy className="w-6 h-6" />
                    <span className="text-sm">Schedule</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Matches Section */}
      <div className="bg-white/5 backdrop-blur-sm py-8 sm:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Recent Matches</h2>
            <button onClick={() => navigateTo('History')} className="text-orange-400 hover:text-orange-300 flex items-center gap-2 text-sm sm:text-base">
              View All
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {recentMatches.map(match => (
              <div key={match.id} className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden hover:bg-white/15 transition group">
                <div className="relative h-32 sm:h-40 overflow-hidden">
                  <img src={match.image} alt={match.opponent} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                  <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-white font-bold text-xs sm:text-sm ${match.result === 'W' ? 'bg-green-500' : 'bg-red-500'}`}>
                    {match.result === 'W' ? 'Victory' : 'Defeat'}
                  </div>
                </div>
                <div className="p-4">
                  <div className="text-white font-bold text-base sm:text-lg mb-2">vs {match.opponent}</div>
                  <div className="flex justify-between items-center">
                    <div className="text-orange-400 text-2xl sm:text-3xl font-bold">{match.score}</div>
                    <div className="text-gray-400 text-xs sm:text-sm">{match.date}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* News & Announcements Section */}
      <div className="py-8 sm:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
              <Bell className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" />
              News & Announcements
            </h2>
            {isAdmin && (
              <button onClick={() => setEditingAnnouncement(true)} className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm transition">
                Add New
              </button>
            )}
          </div>

          <div className="grid gap-4 sm:gap-6">
            {announcements.map(announcement => (
              <div key={announcement.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 hover:bg-white/15 transition group">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg sm:text-xl font-bold text-white">{announcement.title}</h3>
                      <span className="text-xs sm:text-sm text-orange-400">{announcement.date}</span>
                    </div>
                    <p className="text-gray-300 text-sm sm:text-base">{announcement.content}</p>
                  </div>
                  {isAdmin && (
                    <button onClick={() => deleteAnnouncement(announcement.id)} className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition">
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-black/30 backdrop-blur-sm py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
          <p>© 2025 {clubInfo.name}. All rights reserved.</p>
          <p className="mt-2">Built with passion for basketball excellence 🏀</p>
        </div>
      </div>
    </div>
  );
};

export default PaulinesHomepage;