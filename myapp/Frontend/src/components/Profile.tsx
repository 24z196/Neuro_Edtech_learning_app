import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { UserProfile, ThemeMode } from '../App';
import { Avatar3D } from './Avatar3D';
import { ShoppingBag, Check } from 'lucide-react';

interface ProfileProps {
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile) => void;
  onNavigateToStore: () => void;
  themeMode: ThemeMode;
}

const categories = ['hair', 'eyes', 'skinTone', 'top', 'accessories'] as const;

const inventory = {
  hair: [
    { id: 'short-modern', name: 'Short Modern', owned: true },
    { id: 'long-wavy', name: 'Long Wavy', owned: true },
    { id: 'curly', name: 'Curly', owned: false },
    { id: 'buzz', name: 'Buzz Cut', owned: false },
  ],
  eyes: [
    { id: 'friendly', name: 'Friendly', owned: true },
    { id: 'focused', name: 'Focused', owned: false },
    { id: 'sparkle', name: 'Sparkle', owned: false },
  ],
  skinTone: [
    { id: 'light', name: 'Light', owned: true },
    { id: 'medium', name: 'Medium', owned: true },
    { id: 'dark', name: 'Dark', owned: true },
  ],
  top: [
    { id: 'hoodie', name: 'Hoodie', owned: true },
    { id: 't-shirt', name: 'T-Shirt', owned: true },
    { id: 'jacket', name: 'Jacket', owned: false },
  ],
  accessories: [
    { id: 'glasses', name: 'Glasses', owned: true },
    { id: 'headphones', name: 'Headphones', owned: true },
    { id: 'hat', name: 'Hat', owned: false },
    { id: 'necklace', name: 'Necklace', owned: false },
  ],
};

const categoryIcons = {
  hair: '💇',
  eyes: '👁️',
  skinTone: '🎨',
  top: '👕',
  accessories: '👓',
};

export function Profile({ userProfile, setUserProfile, onNavigateToStore, themeMode }: ProfileProps) {
  const [selectedCategory, setSelectedCategory] = useState<typeof categories[number]>('hair');
  const [rotation, setRotation] = useState(0);

  const handleItemSelect = (itemId: string) => {
    const item = inventory[selectedCategory].find(i => i.id === itemId);
    if (!item?.owned) return;

    if (selectedCategory === 'accessories') {
      const currentAccessories = userProfile.avatar.accessories;
      const newAccessories = currentAccessories.includes(itemId)
        ? currentAccessories.filter(a => a !== itemId)
        : [...currentAccessories, itemId];
      
      setUserProfile({
        ...userProfile,
        avatar: { ...userProfile.avatar, accessories: newAccessories }
      });
    } else {
      setUserProfile({
        ...userProfile,
        avatar: { ...userProfile.avatar, [selectedCategory]: itemId }
      });
    }
  };

  const isEquipped = (itemId: string) => {
    if (selectedCategory === 'accessories') {
      return userProfile.avatar.accessories.includes(itemId);
    }
    return userProfile.avatar[selectedCategory] === itemId;
  };

  return (
    <div className={`min-h-full p-6 ${
      themeMode === 'light'
        ? 'bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50'
        : 'bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950'
    }`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="mb-2 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Avatar Customization
          </h1>
          <p className={themeMode === 'light' ? 'text-gray-600' : 'text-gray-400'}>
            Personalize your 3D avatar
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 3D Avatar Display */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-2"
          >
            <div className={`p-8 rounded-2xl backdrop-blur-xl border shadow-2xl ${
              themeMode === 'light'
                ? 'bg-gradient-to-br from-white to-purple-50/50 border-purple-200'
                : 'bg-gradient-to-br from-white/5 to-white/10 border-white/10'
            }`}>
              <div className="flex flex-col items-center">
                <div className="mb-6">
                  <h3 className={`text-center mb-2 ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>
                    Preview
                  </h3>
                  <p className={`text-sm text-center ${themeMode === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                    Rotate to view from all angles
                  </p>
                </div>

                {/* Avatar Preview with Rotation Control */}
                <div className="relative mb-6 w-full h-96">
                  <Avatar3D avatar={userProfile.avatar} />
                </div>

                {/* Profile Info */}
                <div className={`w-full max-w-md p-6 rounded-xl border ${
                  themeMode === 'light'
                    ? 'bg-gray-50 border-gray-200'
                    : 'bg-white/5 border-white/10'
                }`}>
                  <div className="text-center mb-4">
                    <h3 className={`mb-1 ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>
                      {userProfile.name}
                    </h3>
                    <p className={`text-sm ${themeMode === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                      Level {userProfile.level} Learner
                    </p>
                  </div>
                  <div className="flex items-center justify-around text-center">
                    <div>
                      <div className={`text-xl ${themeMode === 'light' ? 'text-purple-600' : 'text-purple-400'}`}>
                        {userProfile.totalXP.toLocaleString()}
                      </div>
                      <div className={`text-xs ${themeMode === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                        Total XP
                      </div>
                    </div>
                    <div className={`w-px h-8 ${themeMode === 'light' ? 'bg-gray-300' : 'bg-white/10'}`} />
                    <div>
                      <div className={`text-xl ${themeMode === 'light' ? 'text-pink-600' : 'text-pink-400'}`}>
                        {userProfile.badges}
                      </div>
                      <div className={`text-xs ${themeMode === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                        Badges
                      </div>
                    </div>
                    <div className={`w-px h-8 ${themeMode === 'light' ? 'bg-gray-300' : 'bg-white/10'}`} />
                    <div>
                      <div className={`text-xl ${themeMode === 'light' ? 'text-blue-600' : 'text-blue-400'}`}>
                        {userProfile.level}
                      </div>
                      <div className={`text-xs ${themeMode === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                        Level
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Customization Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Category Navigation */}
            <div className={`p-6 rounded-2xl backdrop-blur-xl border shadow-xl ${
              themeMode === 'light'
                ? 'bg-white border-gray-200'
                : 'bg-white/5 border-white/10'
            }`}>
              <h3 className={`mb-4 ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>
                Categories
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {categories.map((category) => (
                  <motion.button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-3 rounded-xl border transition-all ${
                      selectedCategory === category
                        ? themeMode === 'light'
                          ? 'bg-purple-200 border-purple-400 shadow-md'
                          : 'bg-gradient-to-br from-purple-600/30 to-pink-600/30 border-purple-500/50'
                        : themeMode === 'light'
                        ? 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-2xl mb-1">{categoryIcons[category]}</div>
                    <div className={`text-xs capitalize ${
                      themeMode === 'light' ? 'text-gray-700' : 'text-gray-300'
                    }`}>
                      {category}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Item List */}
            <div className={`p-6 rounded-2xl backdrop-blur-xl border shadow-xl ${
              themeMode === 'light'
                ? 'bg-white border-gray-200'
                : 'bg-white/5 border-white/10'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`capitalize ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>
                  {selectedCategory}
                </h3>
                <Button
                  onClick={onNavigateToStore}
                  size="sm"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white"
                >
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Store
                </Button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {inventory[selectedCategory].map((item) => (
                  <motion.button
                    key={item.id}
                    onClick={() => handleItemSelect(item.id)}
                    disabled={!item.owned}
                    whileHover={item.owned ? { scale: 1.02 } : {}}
                    whileTap={item.owned ? { scale: 0.98 } : {}}
                    className={`w-full p-4 rounded-xl border text-left transition-all ${
                      !item.owned
                        ? themeMode === 'light'
                          ? 'bg-gray-100 border-gray-300 opacity-50 cursor-not-allowed'
                          : 'bg-gray-800/50 border-gray-700 opacity-50 cursor-not-allowed'
                        : isEquipped(item.id)
                        ? themeMode === 'light'
                          ? 'bg-purple-100 border-purple-400 shadow-md'
                          : 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/50 shadow-lg'
                        : themeMode === 'light'
                        ? 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`mb-1 ${themeMode === 'light' ? 'text-black' : 'text-white'}`}>
                          {item.name}
                        </div>
                        <div className={`text-xs ${themeMode === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                          {item.owned ? (isEquipped(item.id) ? 'Equipped' : 'Owned') : 'Locked - Visit Store'}
                        </div>
                      </div>
                      {item.owned && isEquipped(item.id) && (
                        <Check className="w-6 h-6 text-green-400" />
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}