import { formatCompactNumber } from "@/lib/utils"
import { formatCurrency } from "@/lib/utils"

export function PrettyAmount({ value }: { value: number }) {
  return (
    <div className="relative inline-block">
      <span className="font-semibold">{formatCompactNumber(value)}</span>
      <span className="absolute left-0 -bottom-3 text-[7px] text-gray-600">
        ({formatCurrency(value)})
      </span>
    </div>
  )
}
