import { AnnouncementBarProps } from '../../types'

export function AnnouncementBar({ message = "Free shipping on orders over $50!" }: AnnouncementBarProps) {
  return (
    <div className="bg-blue-600 text-white text-center py-2 text-sm">
      {message}
    </div>
  )
}