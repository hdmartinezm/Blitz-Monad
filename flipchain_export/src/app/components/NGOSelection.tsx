import { motion } from 'motion/react';
import { NGOS, NGO } from '../data/ngos';
import { Heart, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface NGOSelectionProps {
  preferredNGOId: string;
  onSelect: (ngoId: string) => void;
}

export function NGOSelection({ preferredNGOId, onSelect }: NGOSelectionProps) {
  const [selectedNGO, setSelectedNGO] = useState<string | null>(null);

  const preferredNGO = NGOS.find(ngo => ngo.id === preferredNGOId);
  const otherNGOs = NGOS.filter(ngo => ngo.id !== preferredNGOId);

  const handleSelectNGO = (ngoId: string) => {
    setSelectedNGO(ngoId);
  };

  const handleConfirm = () => {
    if (selectedNGO) {
      onSelect(selectedNGO);
    }
  };

  const NGOCard = ({ ngo, isPreferred = false }: { ngo: NGO; isPreferred?: boolean }) => {
    const isSelected = selectedNGO === ngo.id;

    return (
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => handleSelectNGO(ngo.id)}
        className={`
          relative p-6 rounded-2xl border-3 transition-all text-left w-full
          ${isSelected
            ? 'border-4 shadow-2xl'
            : 'border-2 hover:border-opacity-80'
          }
        `}
        style={{
          backgroundColor: isSelected ? `${ngo.color}30` : `${ngo.color}10`,
          borderColor: isSelected ? ngo.color : `${ngo.color}60`,
          boxShadow: isSelected ? `0 0 30px ${ngo.color}40` : 'none',
        }}
      >
        {isPreferred && (
          <div className="absolute -top-3 -right-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full p-2 border-2 border-yellow-400 shadow-lg">
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>
        )}

        <div className="flex items-center gap-4">
          <div className="text-6xl">{ngo.icon}</div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-1">{ngo.name}</h3>
            <p className="text-sm text-zinc-400">{ngo.description}</p>
          </div>
          {isSelected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center"
            >
              <div className="w-5 h-5 rounded-full" style={{ backgroundColor: ngo.color }} />
            </motion.div>
          )}
        </div>
      </motion.button>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-4xl font-bold text-white mb-3">Selecciona una ONG</h2>
        <p className="text-zinc-400 text-lg">
          Un porcentaje del prize pool será donado a la organización que elijas
        </p>
      </motion.div>

      <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
        {/* Preferred NGO */}
        {preferredNGO && (
          <div className="mb-8">
            <div className="flex items-center gap-2 text-yellow-500 text-sm font-mono mb-3 tracking-widest">
              <Heart className="w-4 h-4 fill-yellow-500" />
              TU ONG PREFERIDA
            </div>
            <NGOCard ngo={preferredNGO} isPreferred />
          </div>
        )}

        {/* Other NGOs */}
        <div className="space-y-3">
          <div className="text-zinc-500 text-sm font-mono mb-3 tracking-widest">
            OTRAS ORGANIZACIONES
          </div>
          {otherNGOs.map((ngo) => (
            <NGOCard key={ngo.id} ngo={ngo} />
          ))}
        </div>
      </div>

      {/* Confirm Button */}
      {selectedNGO && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleConfirm}
          className="w-full mt-8 bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 text-white font-bold py-5 rounded-xl transition-all border-2 border-purple-400 shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2 text-lg"
        >
          CONFIRMAR Y CONTINUAR
          <ChevronRight className="w-6 h-6" />
        </motion.button>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(39, 39, 42, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(168, 85, 247, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(168, 85, 247, 0.7);
        }
      `}</style>
    </div>
  );
}
