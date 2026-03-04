import { Card, CardContent } from "@/components/ui/card";

const colorMap = {
  blue: "bg-blue-100 text-blue-600",
  green: "bg-green-100 text-green-600",
  purple: "bg-purple-100 text-purple-600",
  orange: "bg-orange-100 text-orange-600",
  yellow: "bg-yellow-100 text-yellow-600",
  pink: "bg-pink-100 text-pink-600",
};

interface KpiCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: keyof typeof colorMap;
}

export function KpiCard({ title, value, icon, color }: KpiCardProps) {
  return (
    <Card>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full shrink-0 ${colorMap[color]}`}>{icon}</div>
          <div className="min-w-0">
            <p className="text-xl font-bold truncate">{value}</p>
            <p className="text-xs text-muted-foreground truncate">{title}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
