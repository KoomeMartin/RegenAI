'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'

const AVATARS = [
  { id: 'avatar1', color: 'bg-teal', icon: '🌿' },
  { id: 'avatar2', color: 'bg-softBlue', icon: '🌊' },
  { id: 'avatar3', color: 'bg-purple-400', icon: '🦋' },
  { id: 'avatar4', color: 'bg-pink-400', icon: '🌸' },
  { id: 'avatar5', color: 'bg-orange-400', icon: '🌅' },
  { id: 'avatar6', color: 'bg-green-400', icon: '🌱' },
  { id: 'avatar7', color: 'bg-indigo-400', icon: '✨' },
  { id: 'avatar8', color: 'bg-yellow-400', icon: '☀️' },
]

export function AvatarSelector({
  selected,
  onSelect,
}: {
  selected: string
  onSelect: (avatarId: string) => void
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Choose Your Anonymous Avatar
      </label>
      <div className="grid grid-cols-4 gap-3">
        {AVATARS.map((avatar) => (
          <button
            key={avatar.id}
            type="button"
            onClick={() => onSelect(avatar.id)}
            className={`relative h-16 w-16 rounded-full ${avatar.color} flex items-center justify-center text-2xl transition-all hover:scale-110 ${
              selected === avatar.id ? 'ring-4 ring-darkTeal ring-offset-2' : ''
            }`}
          >
            {avatar.icon}
            {selected === avatar.id && (
              <div className="absolute -top-1 -right-1 bg-darkTeal rounded-full p-1">
                <Check className="h-3 w-3 text-white" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

export function Avatar({
  avatarId,
  size = 'md',
}: {
  avatarId: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const avatar = AVATARS.find((a) => a.id === avatarId) ?? AVATARS[0]
  const sizeClasses = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-12 w-12 text-xl',
    lg: 'h-16 w-16 text-3xl',
  }

  return (
    <div
      className={`${avatar.color} ${sizeClasses[size]} rounded-full flex items-center justify-center shadow-md`}
    >
      {avatar.icon}
    </div>
  )
}
