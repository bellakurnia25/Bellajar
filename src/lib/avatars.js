export const AVATARS = [
  { id: 'default', emoji: null, label: 'Inisial', bg: 'bg-brand-100 text-brand-700' },
  { id: 'rocket', emoji: '🚀', label: 'Roket', bg: 'bg-sky-100 text-sky-700' },
  { id: 'star', emoji: '⭐', label: 'Bintang', bg: 'bg-amber-100 text-amber-700' },
  { id: 'robot', emoji: '🤖', label: 'Robot', bg: 'bg-purple-100 text-purple-700' },
  { id: 'dino', emoji: '🦕', label: 'Dino', bg: 'bg-lime-100 text-lime-700' },
  { id: 'owl', emoji: '🦉', label: 'Burung Hantu', bg: 'bg-indigo-100 text-indigo-700' },
];

export function getAvatar(avatarId) {
  return AVATARS.find((a) => a.id === avatarId) || AVATARS[0];
}
