import { motion, AnimatePresence } from 'motion/react';
import { User, Wallet, X, Heart } from 'lucide-react';
import { useState } from 'react';
import { NGOS } from '../data/ngos';

export interface UserData {
  avatar: string;
  name: string;
  wallet: string;
  preferredNGO: string;
}

interface UserProfileProps {
  user: UserData;
  onUpdate: (user: UserData) => void;
}

export function UserProfile({ user, onUpdate }: UserProfileProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user);

  const preferredNGO = NGOS.find(ngo => ngo.id === user.preferredNGO);

  const handleSave = () => {
    onUpdate(editedUser);
    setIsEditing(false);
  };

  const avatarOptions = ['👤', '🧑', '👨', '👩', '🧔', '👱', '🧑‍💼', '👨‍💻', '👩‍💻', '🦸', '🦹', '🧙'];

  return (
    <>
      {/* Profile Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed top-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-violet-600 to-purple-700 border-2 border-purple-400 shadow-lg shadow-purple-500/30 flex items-center justify-center text-3xl hover:shadow-purple-500/50 transition-shadow"
      >
        {user.avatar}
      </motion.button>

      {/* Profile Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
            >
              <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border-2 border-purple-900 rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-violet-700 p-6 relative">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                  <div className="flex items-center gap-4">
                    <div className="text-6xl">{user.avatar}</div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                      <p className="text-purple-200 text-sm font-mono">PERFIL DE JUGADOR</p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                  {!isEditing ? (
                    <>
                      {/* Wallet */}
                      <div>
                        <div className="flex items-center gap-2 text-zinc-500 text-xs font-mono mb-2">
                          <Wallet className="w-4 h-4" />
                          WALLET
                        </div>
                        <div className="bg-zinc-800 rounded-lg p-3 font-mono text-sm text-zinc-300 border border-zinc-700">
                          {user.wallet.slice(0, 6)}...{user.wallet.slice(-4)}
                        </div>
                      </div>

                      {/* Preferred NGO */}
                      <div>
                        <div className="flex items-center gap-2 text-zinc-500 text-xs font-mono mb-2">
                          <Heart className="w-4 h-4" />
                          ONG PREFERIDA
                        </div>
                        {preferredNGO && (
                          <div
                            className="rounded-lg p-4 border-2"
                            style={{
                              backgroundColor: `${preferredNGO.color}20`,
                              borderColor: preferredNGO.color,
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="text-4xl">{preferredNGO.icon}</div>
                              <div>
                                <div className="font-bold text-white">{preferredNGO.name}</div>
                                <div className="text-xs text-zinc-400">{preferredNGO.description}</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Edit Button */}
                      <button
                        onClick={() => setIsEditing(true)}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-colors"
                      >
                        Editar Perfil
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Edit Name */}
                      <div>
                        <label className="text-zinc-500 text-xs font-mono mb-2 block">NOMBRE</label>
                        <input
                          type="text"
                          value={editedUser.name}
                          onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      {/* Edit Avatar */}
                      <div>
                        <label className="text-zinc-500 text-xs font-mono mb-2 block">AVATAR</label>
                        <div className="grid grid-cols-6 gap-2">
                          {avatarOptions.map((avatar) => (
                            <button
                              key={avatar}
                              onClick={() => setEditedUser({ ...editedUser, avatar })}
                              className={`text-3xl p-2 rounded-lg border-2 transition-all ${
                                editedUser.avatar === avatar
                                  ? 'border-purple-500 bg-purple-900/30'
                                  : 'border-zinc-700 hover:border-zinc-600'
                              }`}
                            >
                              {avatar}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Edit Preferred NGO */}
                      <div>
                        <label className="text-zinc-500 text-xs font-mono mb-2 block">ONG PREFERIDA</label>
                        <div className="grid grid-cols-2 gap-2">
                          {NGOS.map((ngo) => (
                            <button
                              key={ngo.id}
                              onClick={() => setEditedUser({ ...editedUser, preferredNGO: ngo.id })}
                              className={`p-3 rounded-lg border-2 transition-all text-left ${
                                editedUser.preferredNGO === ngo.id
                                  ? 'border-purple-500 bg-purple-900/30'
                                  : 'border-zinc-700 hover:border-zinc-600'
                              }`}
                            >
                              <div className="text-2xl mb-1">{ngo.icon}</div>
                              <div className="text-xs font-bold text-white">{ngo.name}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Save Buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setEditedUser(user);
                            setIsEditing(false);
                          }}
                          className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-3 rounded-lg transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleSave}
                          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-colors"
                        >
                          Guardar
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
