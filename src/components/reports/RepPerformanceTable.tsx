import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RepPerformanceTableProps {
  data: { name: string; sales: number; revenue: number; commission: number }[];
}

export function RepPerformanceTable({ data }: RepPerformanceTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Sales Rep Performance</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No sales data.</p>
        ) : (
          <div className="space-y-3">
            {data.map((rep, i) => (
              <div key={rep.name} className="flex items-center justify-between gap-4 p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                    i === 0 ? "bg-yellow-500" : i === 1 ? "bg-gray-400" : "bg-orange-400"
                  }`}>
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{rep.name}</p>
                    <p className="text-xs text-muted-foreground">{rep.sales} sale{rep.sales !== 1 ? "s" : ""}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm">${rep.revenue.toLocaleString()}</p>
                  <Badge variant="outline" className="text-xs">
                    ${rep.commission.toLocaleString()} commission
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
