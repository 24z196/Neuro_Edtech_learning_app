import React from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { UserProfile } from '../App';
import { Coins, ShoppingCart, Check } from 'lucide-react';

interface StoreProps {
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile) => void;
  themeMode: 'light' | 'dark';
}

const storeItems = [
  // Hairstyles
  { id: 'wavy-long', name: 'Wavy Long', category: 'Hairstyles', price: 500, owned: false, icon: '🌊' },
  { id: 'slick-back', name: 'Slick Back', category: 'Hairstyles', price: 500, owned: false, icon: '✨' },
  { id: 'playful-pigtails', name: 'Playful Pigtails', category: 'Hairstyles', price: 750, owned: false, icon: '🎀' },
  // Tops
  { id: 'varsity-jacket', name: 'Varsity Jacket', category: 'Tops', price: 1000, owned: false, icon: '🧥' },
  { id: 'patterned-sweater', name: 'Patterned Sweater', category: 'Tops', price: 800, owned: false, icon: '🧶' },
  { id: 'bci-headset', name: 'BCI Headset', category: 'Accessories', price: 1500, owned: false, icon: '🧠' },
  { id: 'aviator-shades', name: 'Aviator Shades', category: 'Accessories', price: 400, owned: false, icon: '🕶️' },
  { id: 'beanie-hat', name: 'Beanie Hat', category: 'Accessories', price: 300, owned: false, icon: '🧢' },
  { id: 'silver-hoops', name: 'Silver Hoops', category: 'Accessories', price: 250, owned: false, icon: '👂' },
];

export function Store({ userProfile, setUserProfile, themeMode }: StoreProps) {
  const handlePurchase = (itemId: string) => {
    const item = storeItems.find(i => i.id === itemId);
    if (!item || userProfile.coins < item.price) return;

    // Deduct coins and add item to inventory
    const updatedProfile = {
      ...userProfile,
      coins: userProfile.coins - item.price,
      inventory: [...userProfile.inventory, itemId],
    };
    setUserProfile(updatedProfile);
  };

  const isOwned = (itemId: string) => userProfile.inventory.includes(itemId);

  return (
    <div className={`min-h-full p-6 ${
      themeMode === 'light'
        ? 'bg-gradient-to-br from-gray-50 via-blue-50 to-green-50'
        : 'bg-gradient-to-br from-gray-950 via-blue-950/20 to-gray-950'
    }`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8"
        >
          <div>
            <h1 className="mb-2 bg-gradient-to-r from-blue-400 via-green-400 to-teal-400 bg-clip-text text-transparent">
              Avatar Store
            </h1>
            <p className={themeMode === 'light' ? 'text-gray-600' : 'text-gray-400'}>
              Spend your coins on new items for your avatar.
            </p>
          </div>
          <div className={`mt-4 sm:mt-0 flex items-center gap-3 p-3 rounded-full border ${
            themeMode === 'light'
              ? 'bg-white border-gray-200'
              : 'bg-white/5 border-white/10'
          }`}>
            <Coins className="w-6 h-6 text-yellow-400" />
            <span className={`text-xl font-bold ${themeMode === 'light' ? 'text-gray-800' : 'text-white'}`}>
              {userProfile.coins.toLocaleString()}
            </span>
          </div>
        </motion.div>

        {/* Item Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {storeItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`rounded-2xl border shadow-lg overflow-hidden flex flex-col ${
                themeMode === 'light'
                  ? 'bg-white border-gray-200'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              <div className={`h-40 flex items-center justify-center text-6xl ${
                themeMode === 'light' ? 'bg-gray-100' : 'bg-gray-800/50'
              }`}>
                {item.icon}
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <h3 className={`text-lg font-bold mb-1 ${themeMode === 'light' ? 'text-gray-900' : 'text-white'}`}>
                  {item.name}
                </h3>
                <p className={`text-sm mb-4 ${themeMode === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                  {item.category}
                </p>
                
                <div className="flex-grow" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-yellow-400" />
                    <span className={`font-semibold ${themeMode === 'light' ? 'text-gray-800' : 'text-white'}`}>
                      {item.price}
                    </span>
                  </div>
                  
                  {isOwned(item.id) ? (
                    <Button variant="ghost" size="sm" disabled className="flex items-center gap-2 text-green-500">
                      <Check className="w-5 h-5" />
                      Owned
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handlePurchase(item.id)}
                      disabled={userProfile.coins < item.price}
                      className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white disabled:opacity-50"
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Buy
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
