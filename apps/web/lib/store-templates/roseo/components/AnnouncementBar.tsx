import { AnnouncementBarProps } from '../../types'

export default function AnnouncementBar({ message = "Free shipping on orders over $200" }: AnnouncementBarProps) {
  return (
    <div className="bg-amber-900 text-white text-center py-2 text-sm">
      {message}
    </div>
  )
}