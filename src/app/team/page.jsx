"use client";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";

const players = [
  {
    id: 1,
    name: "Pauline D.",
    number: 7,
    position: "Point Guard",
    image: "/players/pauline.jpg",
    height: "5'10\"",
    age: 24,
    bio: "Quick on the break, sharp shooter, team leader with amazing court vision.",
  },
  {
    id: 2,
    name: "Alex R.",
    number: 12,
    position: "Forward",
    image: "/players/alex.jpg",
    height: "6'2\"",
    age: 26,
    bio: "Strong rebounder, great mid-range game and defensive instincts.",
  },
  {
    id: 3,
    name: "Nina K.",
    number: 3,
    position: "Shooting Guard",
    image: "/players/nina.jpg",
    height: "5'9\"",
    age: 23,
    bio: "Explosive scorer with high energy, known for clutch 3-pointers.",
  },
  {
    id: 4,
    name: "Jason P.",
    number: 11,
    position: "Center",
    image: "/players/jason.jpg",
    height: "6'5\"",
    age: 27,
    bio: "Dominant paint presence with great footwork and rim protection.",
  },
];

export default function TeamPage() {
  const [selected, setSelected] = useState(null);

  return (
    <section className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white px-4 py-10">
      <div className="max-w-6xl mx-auto text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Pauline’s Club Team Roster 🏀
        </h1>
        <p className="text-gray-300 mt-2">
          Meet our talented athletes who bring the fire to every game.
        </p>
      </div>

      {/* Player Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {players.map((player) => (
          <motion.div
            key={player.id}
            layoutId={`card-${player.id}`}
            whileHover={{ scale: 1.05 }}
            className="bg-gray-800 rounded-2xl overflow-hidden shadow-lg cursor-pointer group"
            onClick={() => setSelected(player)}
          >
            <div className="relative">
              <img
                src={player.image}
                alt={player.name}
                className="w-full h-48 object-cover group-hover:opacity-90 transition"
              />
              <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                #{player.number}
              </div>
            </div>
            <div className="p-3 text-center">
              <h3 className="text-lg font-semibold">{player.name}</h3>
              <p className="text-sm text-gray-400">{player.position}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              layoutId={`card-${selected.id}`}
              className="bg-gray-900 rounded-3xl overflow-hidden max-w-md w-full relative shadow-2xl"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelected(null)}
                className="absolute top-3 right-3 bg-white/10 hover:bg-white/20 rounded-full p-2"
              >
                <X size={18} />
              </button>
              <img
                src={selected.image}
                alt={selected.name}
                className="w-full h-60 object-cover"
              />
              <div className="p-5">
                <h2 className="text-2xl font-bold mb-1">{selected.name}</h2>
                <p className="text-gray-400 mb-3">{selected.position}</p>
                <div className="grid grid-cols-2 text-sm text-gray-400 mb-3">
                  <div>Height: <span className="text-white">{selected.height}</span></div>
                  <div>Age: <span className="text-white">{selected.age}</span></div>
                </div>
                <p className="text-gray-300">{selected.bio}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
