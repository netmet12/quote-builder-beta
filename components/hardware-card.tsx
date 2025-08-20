import { Card, CardContent } from "@/components/ui/card"

interface HardwareCardProps {
  title: string
  image: string
  description?: string
}

export function HardwareCard({ title, image, description }: HardwareCardProps) {
  return (
    <Card className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
      <CardContent className="p-6 text-center">
        <div className="mb-4 flex justify-center">
          <img src={image || "/placeholder.svg"} alt={title} className="h-24 w-24 object-contain" />
        </div>
        <h3 className="text-lg font-semibold text-card-foreground">{title}</h3>
        {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  )
}
