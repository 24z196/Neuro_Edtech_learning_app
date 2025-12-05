import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Coins, ShoppingCart, Check } from 'lucide-react';
import { AvatarDisplay } from './AvatarDisplay';

type UserProfile = {
  name: string;
  xp: number;
  totalXP: number;
  inventory: string[];
  avatar: { top?: string; hair?: string; footwear?: string };
};

type Item = { id: string; name: string; slot: 'top'|'hair'|'footwear'; xpCost: number; modelPath: string };

export function Store({ themeMode, userProfile, setUserProfile }: { themeMode: 'light'|'dark'; userProfile: UserProfile; setUserProfile: (u: UserProfile) => void }) {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/items')
      .then(r => r.json())
      .then(setItems)
      .catch(() => setItems([]));
  }, []);

  const grouped = useMemo(() => {
    return {
      top: items.filter(i => i.slot === 'top'),
      hair: items.filter(i => i.slot === 'hair'),
      footwear: items.filter(i => i.slot === 'footwear'),
    };
  }, [items]);

  const isOwned = (id: string) => userProfile.inventory?.includes(id);
  const isEquipped = (id: string, slot: Item['slot']) => userProfile.avatar?.[slot] === id;

  const buy = async (item: Item) => {
    const res = await fetch('http://localhost:5000/api/avatar/buy', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: userProfile.name, itemId: item.id })
    });
    if (!res.ok) return;
    const updated = await res.json();
    setUserProfile(updated);
  };

  const equip = async (item: Item) => {
    const res = await fetch('http://localhost:5000/api/avatar/equip', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: userProfile.name, itemId: item.id, slot: item.slot })
    });
    if (!res.ok) return;
    const updated = await res.json();
    setUserProfile(updated);
  };

  const Section = ({ title, data }: { title: string; data: Item[] }) => (
    <div>
      <h2 className="mb-3">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {data.map((item, idx) => (
          <motion.div key={item.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}
            className={`rounded-xl border p-4 ${themeMode === 'light' ? 'bg-white border-gray-200' : 'bg-white/5 border-white/10'}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className={themeMode === 'light' ? 'text-gray-900' : 'text-white'}>{item.name}</div>
                <div className={themeMode === 'light' ? 'text-gray-500' : 'text-gray-400'}>{item.slot}</div>
              </div>
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-yellow-400" />
                <span className={themeMode === 'light' ? 'text-gray-800' : 'text-white'}>{item.xpCost}</span>
              </div>
            </div>
            <div className="mt-3 flex justify-between">
              {!isOwned(item.id) ? (
                <Button size="sm" onClick={() => buy(item)} disabled={(userProfile.xp ?? 0) < item.xpCost}>
                  <ShoppingCart className="w-4 h-4 mr-2" /> Buy
                </Button>
              ) : isEquipped(item.id, item.slot) ? (
                <Button size="sm" variant="ghost" disabled>
                  <Check className="w-4 h-4 mr-2" /> Equipped
                </Button>
              ) : (
                <Button size="sm" variant="outline" onClick={() => equip(item)}>Equip</Button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  return (
    <div className={`min-h-full p-6 ${themeMode === 'light' ? 'bg-gray-50' : 'bg-black'}`}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-8">
          <Section title="Tops" data={grouped.top} />
          <Section title="Hair" data={grouped.hair} />
          <Section title="Footwear" data={grouped.footwear} />
        </div>
        <div>
          <h2 className="mb-3">Preview</h2>
          <AvatarDisplay avatar={userProfile.avatar} />
        </div>
      </div>
    </div>
  );
}
