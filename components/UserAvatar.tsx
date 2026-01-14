interface UserAvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function UserAvatar({ name, size = 'md', className = '' }: UserAvatarProps) {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
  ]

  const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
  const bgColor = colors[colorIndex]

  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  }

  return (
    <div className={`${sizes[size]} ${bgColor} rounded-full flex items-center justify-center text-white font-semibold ${className}`}>
      {initials}
    </div>
  )
}
