interface NotificationItemProps {
    title: string
    description: string
    time: string
  }
  
  export function NotificationItem({ title, description, time }: NotificationItemProps) {
    return (
      <div className="px-2 py-2 hover:bg-slate-100 cursor-pointer">
        <div className="flex justify-between items-start mb-1">
          <h4 className="font-medium text-sm">{title}</h4>
          <span className="text-xs text-slate-500">{time}</span>
        </div>
        <p className="text-xs text-slate-600">{description}</p>
      </div>
    )
  }