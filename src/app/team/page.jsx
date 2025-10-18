'use client';
import { Activity, Award, Target, TrendingUp, X } from 'lucide-react';
import { useState } from 'react';

const TeamPage = () => {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [flippedCard, setFlippedCard] = useState(null);

  const players = [
    {
      id: 1,
      name: "Pauline Davis",
      nickname: "PD",
      number: 7,
      position: "Point Guard",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
      height: "5'10\"",
      age: 24,
      nationality: "🇺🇸",
      rating: 92,
      stats: {
        points: 18.5,
        assists: 7.2,
        rebounds: 4.1,
        steals: 2.3,
        fieldGoal: "45%",
        threePoint: "38%"
      },
      bio: "Quick on the break, sharp shooter, team leader with amazing court vision.",
      achievements: ["MVP 2024", "All-Star 2023", "Best PG"]
    },
    {
      id: 2,
      name: "Alex Rodriguez",
      nickname: "AR",
      number: 12,
      position: "Forward",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
      height: "6'2\"",
      age: 26,
      nationality: "🇪🇸",
      rating: 88,
      stats: {
        points: 15.8,
        assists: 3.5,
        rebounds: 8.9,
        steals: 1.7,
        fieldGoal: "52%",
        threePoint: "35%"
      },
      bio: "Strong rebounder, great mid-range game and defensive instincts.",
      achievements: ["Defensive Player 2024", "All-Star 2024"]
    },
    {
      id: 3,
      name: "Nina Kumar",
      nickname: "NK",
      number: 3,
      position: "Shooting Guard",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
      height: "5'9\"",
      age: 23,
      nationality: "🇮🇳",
      rating: 90,
      stats: {
        points: 21.3,
        assists: 4.1,
        rebounds: 3.8,
        steals: 1.9,
        fieldGoal: "48%",
        threePoint: "42%"
      },
      bio: "Explosive scorer with high energy, known for clutch 3-pointers.",
      achievements: ["Top Scorer 2024", "Rookie of Year 2023"]
    },
    {
      id: 4,
      name: "Jason Parker",
      nickname: "JP",
      number: 11,
      position: "Center",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
      height: "6'5\"",
      age: 27,
      nationality: "🇬🇧",
      rating: 85,
      stats: {
        points: 14.2,
        assists: 2.1,
        rebounds: 11.5,
        steals: 0.9,
        fieldGoal: "58%",
        threePoint: "28%"
      },
      bio: "Dominant paint presence with great footwork and rim protection.",
      achievements: ["Best Rebounder 2024", "All-Defense 2023"]
    },
    {
      id: 5,
      name: "Maria Santos",
      nickname: "MS",
      number: 23,
      position: "Small Forward",
      image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400",
      height: "6'0\"",
      age: 25,
      nationality: "🇧🇷",
      rating: 87,
      stats: {
        points: 16.7,
        assists: 5.3,
        rebounds: 6.2,
        steals: 2.1,
        fieldGoal: "49%",
        threePoint: "37%"
      },
      bio: "Versatile player with excellent court awareness and clutch performance.",
      achievements: ["6th Woman Award 2024"]
    },
    {
      id: 6,
      name: "David Chen",
      nickname: "DC",
      number: 5,
      position: "Power Forward",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400",
      height: "6'4\"",
      age: 28,
      nationality: "🇨🇳",
      rating: 86,
      stats: {
        points: 13.9,
        assists: 2.8,
        rebounds: 9.7,
        steals: 1.3,
        fieldGoal: "54%",
        threePoint: "33%"
      },
      bio: "Physical presence in the paint with strong post moves and shot blocking ability.",
      achievements: ["All-Star 2023", "Best Blocker"]
    }
  ];

  const getRatingColor = (rating) => {
    if (rating >= 90) return 'from-yellow-600 to-yellow-800';
    if (rating >= 85) return 'from-purple-600 to-purple-800';
    if (rating >= 80) return 'from-blue-600 to-blue-800';
    return 'from-gray-600 to-gray-800';
  };

  const getPositionColor = (position) => {
    const colors = {
      'Point Guard': 'bg-blue-500',
      'Shooting Guard': 'bg-green-500',
      'Small Forward': 'bg-yellow-500',
      'Power Forward': 'bg-orange-500',
      'Center': 'bg-red-500',
      'Forward': 'bg-purple-500'
    };
    return colors[position] || 'bg-gray-500';
  };

  const toggleFlip = (playerId) => {
    setFlippedCard(flippedCard === playerId ? null : playerId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-12 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
          Pauline's Club
          <span className="block text-2xl sm:text-3xl text-orange-400 mt-2">Team Roster 2025</span>
        </h1>
        <p className="text-gray-300 text-lg">Meet our elite athletes 🏀</p>
      </div>

      {/* Player Cards Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
        {players.map((player) => (
          <div
            key={player.id}
            className="perspective-1000"
            onMouseEnter={() => setFlippedCard(player.id)}
            onMouseLeave={() => setFlippedCard(null)}
            onClick={() => setSelectedPlayer(player)}
          >
            <div
              className={`relative w-full h-[480px] transition-transform duration-700 transform-style-3d cursor-pointer ${
                flippedCard === player.id ? 'rotate-y-180' : ''
              }`}
              style={{
                transformStyle: 'preserve-3d',
                transform: flippedCard === player.id ? 'rotateY(180deg)' : 'rotateY(0deg)'
              }}
            >
              {/* Front of Card */}
              <div
                className="absolute inset-0 backface-hidden"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <div className={`relative w-full h-full bg-gradient-to-br ${getRatingColor(player.rating)} rounded-3xl overflow-hidden shadow-2xl hover:shadow-orange-500/50 transition-all duration-300`}>
                  {/* Card Header */}
                  <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-10">
                    <div className="bg-black/50 backdrop-blur-sm rounded-xl px-4 py-2">
                      <div className="text-xs text-gray-300">2024-25</div>
                      <div className="text-sm font-bold text-white">ELITE</div>
                    </div>
                    <div className="bg-black/50 backdrop-blur-sm rounded-full w-14 h-14 flex items-center justify-center">
                      <span className="text-2xl">{player.nationality}</span>
                    </div>
                  </div>

                  {/* Jersey Number */}
                  <div className="absolute top-4 right-4 text-white/20 text-8xl font-bold z-0">
                    {player.number}
                  </div>

                  {/* Player Image */}
                  <div className="absolute top-20 left-0 right-0 flex justify-center z-10">
                    <div className="relative">
                      <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white/30 shadow-2xl">
                        <img
                          src={player.image}
                          alt={player.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {/* <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-white text-gray-900 font-bold text-xl px-6 py-2 rounded-full shadow-lg">
                        #{player.number}
                      </div> */}
                    </div>
                  </div>

                  {/* Player Info */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6 pt-24">
                    <div className="text-center mb-4">
                      <h3 className="text-3xl font-bold text-white mb-1">{player.name.split(' ')[0]}</h3>
                      <h4 className="text-2xl font-bold text-orange-400">{player.name.split(' ')[1]}</h4>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
                        <div className="text-xs text-gray-300">AGE</div>
                        <div className="text-xl font-bold text-white">{player.age}</div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
                        <div className="text-xs text-gray-300">RATING</div>
                        <div className="text-xl font-bold text-yellow-400">{player.rating}</div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
                        <div className="text-xs text-gray-300">HEIGHT</div>
                        <div className="text-xl font-bold text-white">{player.height}</div>
                      </div>
                    </div>

                    <div className={`${getPositionColor(player.position)} text-white text-center py-2 rounded-full font-bold text-sm`}>
                      {player.position}
                    </div>
                  </div>
                </div>
              </div>

              {/* Back of Card */}
              <div
                className="absolute inset-0 backface-hidden"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)'
                }}
              >
                <div className="relative w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl overflow-hidden shadow-2xl p-6">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold text-white">{player.nickname}</h3>
                      <div className="text-4xl">{player.nationality}</div>
                    </div>

                    <div className="space-y-3 flex-1">
                      <h4 className="text-orange-400 font-bold text-lg mb-3 flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        Season Stats
                      </h4>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/5 rounded-lg p-3">
                          <div className="text-xs text-gray-400">PPG</div>
                          <div className="text-2xl font-bold text-white">{player.stats.points}</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                          <div className="text-xs text-gray-400">RPG</div>
                          <div className="text-2xl font-bold text-white">{player.stats.rebounds}</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                          <div className="text-xs text-gray-400">APG</div>
                          <div className="text-2xl font-bold text-white">{player.stats.assists}</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                          <div className="text-xs text-gray-400">SPG</div>
                          <div className="text-2xl font-bold text-white">{player.stats.steals}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-3">
                        <div className="bg-white/5 rounded-lg p-2 text-center">
                          <div className="text-xs text-gray-400">FG%</div>
                          <div className="text-lg font-bold text-green-400">{player.stats.fieldGoal}</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-2 text-center">
                          <div className="text-xs text-gray-400">3P%</div>
                          <div className="text-lg font-bold text-blue-400">{player.stats.threePoint}</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h4 className="text-orange-400 font-bold text-sm mb-2 flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        Achievements
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {player.achievements.map((achievement, idx) => (
                          <span key={idx} className="bg-yellow-600/20 text-yellow-400 text-xs px-3 py-1 rounded-full border border-yellow-600/30">
                            {achievement}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button className="mt-4 w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl font-bold transition">
                      View Full Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Modal */}
      {selectedPlayer && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPlayer(null)}
        >
          <div
            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPlayer(null)}
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 rounded-full p-2 z-10 transition"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Header with Image */}
            <div className={`relative h-64 bg-gradient-to-br ${getRatingColor(selectedPlayer.rating)} overflow-hidden`}>
              <div className="absolute inset-0 opacity-20 text-white text-9xl font-bold flex items-center justify-center">
                {selectedPlayer.number}
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent">
                <div className="flex items-end gap-4">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/30 shadow-xl">
                    <img
                      src={selectedPlayer.image}
                      alt={selectedPlayer.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 mb-2">
                    <h2 className="text-3xl font-bold text-white">{selectedPlayer.name}</h2>
                    <p className="text-orange-400 font-semibold text-lg">{selectedPlayer.position}</p>
                  </div>
                  <div className="bg-white text-gray-900 font-bold text-2xl px-4 py-2 rounded-full mb-2">
                    #{selectedPlayer.number}
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <div className="text-gray-400 text-sm mb-1">Age</div>
                  <div className="text-2xl font-bold text-white">{selectedPlayer.age}</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <div className="text-gray-400 text-sm mb-1">Height</div>
                  <div className="text-2xl font-bold text-white">{selectedPlayer.height}</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <div className="text-gray-400 text-sm mb-1">Rating</div>
                  <div className="text-2xl font-bold text-yellow-400">{selectedPlayer.rating}</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <div className="text-gray-400 text-sm mb-1">Nation</div>
                  <div className="text-3xl">{selectedPlayer.nationality}</div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <h3 className="text-orange-400 font-bold text-lg mb-2 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  About
                </h3>
                <p className="text-gray-300 leading-relaxed">{selectedPlayer.bio}</p>
              </div>

              {/* Season Statistics */}
              <div>
                <h3 className="text-orange-400 font-bold text-lg mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Season Statistics
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="text-gray-400 text-sm mb-1">Points Per Game</div>
                    <div className="text-3xl font-bold text-white">{selectedPlayer.stats.points}</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="text-gray-400 text-sm mb-1">Rebounds Per Game</div>
                    <div className="text-3xl font-bold text-white">{selectedPlayer.stats.rebounds}</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="text-gray-400 text-sm mb-1">Assists Per Game</div>
                    <div className="text-3xl font-bold text-white">{selectedPlayer.stats.assists}</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="text-gray-400 text-sm mb-1">Steals Per Game</div>
                    <div className="text-3xl font-bold text-white">{selectedPlayer.stats.steals}</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="text-gray-400 text-sm mb-1">Field Goal %</div>
                    <div className="text-3xl font-bold text-green-400">{selectedPlayer.stats.fieldGoal}</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="text-gray-400 text-sm mb-1">3-Point %</div>
                    <div className="text-3xl font-bold text-blue-400">{selectedPlayer.stats.threePoint}</div>
                  </div>
                </div>
              </div>

              {/* Achievements */}
              <div>
                <h3 className="text-orange-400 font-bold text-lg mb-3 flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Achievements & Awards
                </h3>
                <div className="flex flex-wrap gap-3">
                  {selectedPlayer.achievements.map((achievement, idx) => (
                    <div key={idx} className="bg-gradient-to-r from-yellow-600 to-yellow-700 text-white px-4 py-2 rounded-full font-semibold text-sm shadow-lg">
                      🏆 {achievement}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
};

export default TeamPage;