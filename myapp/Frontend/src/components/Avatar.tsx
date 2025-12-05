import React, { useEffect, useState } from 'react';
import Avatar3D from './Avatar3D';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export type AvatarState = {
  dress: string;
  shoes: string;
  accessories: string;
  skinColor: string;
};

const DEFAULT_AVATAR: AvatarState = {
  dress: 'hoodie',
  shoes: 'sneakers',
  accessories: 'none',
  skinColor: '#8d5524',
};

export default function Avatar() {
  const [avatar, setAvatar] = useState<AvatarState>(() => {
    try {
      const saved = localStorage.getItem('avatar-state');
      return saved ? JSON.parse(saved) : DEFAULT_AVATAR;
    } catch {
      return DEFAULT_AVATAR;
    }
  });

  useEffect(() => {
    // Optionally sync live changes
  }, [avatar]);

  const saveAvatar = () => {
    localStorage.setItem('avatar-state', JSON.stringify(avatar));
  };

  return (
    <div className="flex h-full">
      <div className="flex-1 min-h-[400px]">
        {/* Render the 3D avatar with current customization */}
        <Avatar3D avatar={avatar} />
      </div>
      <div className="w-80 p-4 space-y-4 border-l border-white/10">
        <div>
          <Label>Dress</Label>
          <Select value={avatar.dress} onValueChange={(v: string) => setAvatar(a => ({ ...a, dress: v }))}>
            <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="hoodie">Hoodie</SelectItem>
              <SelectItem value="t-shirt">T-Shirt</SelectItem>
              <SelectItem value="jacket">Jacket</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Shoes</Label>
          <Select value={avatar.shoes} onValueChange={(v: string) => setAvatar(a => ({ ...a, shoes: v }))}>
            <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="sneakers">Sneakers</SelectItem>
              <SelectItem value="boots">Boots</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Accessories</Label>
          <Select value={avatar.accessories} onValueChange={(v: string) => setAvatar(a => ({ ...a, accessories: v }))}>
            <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="glasses">Glasses</SelectItem>
              <SelectItem value="headband">Headband</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Skin Color</Label>
          <input
            type="color"
            className="mt-2 w-full h-10 rounded"
            value={avatar.skinColor}
            onChange={(e) => setAvatar(a => ({ ...a, skinColor: e.target.value }))}
          />
        </div>
        <Button onClick={saveAvatar} className="w-full">Save Avatar</Button>
      </div>
    </div>
  );
}
