import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatUsd } from "@/lib/utils";

export type SavingsChartPoint = {
  month: string;
  kwh: number;
  currentBill: number;
  newBill: number;
};

export function SavingsChart({ data }: { data: SavingsChartPoint[] }) {
  return (
    <div className="h-52">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 2 }}>
          <CartesianGrid stroke="var(--color-border)" vertical={false} />
          <XAxis dataKey="month" interval={0} tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} />
          <YAxis
            yAxisId="kwh"
            width={42}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
            label={{ value: "kWh", angle: -90, position: "insideLeft", offset: 4, style: { fontSize: 10, fill: "var(--color-muted-foreground)", textAnchor: "middle" } }}
          />
          <YAxis yAxisId="bill" orientation="right" width={40} tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} tickFormatter={(v) => `$${v}`} />
          <Tooltip
            cursor={{ fill: "color-mix(in srgb, var(--color-primary) 10%, transparent)" }}
            contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }}
            formatter={(value, name) => {
              const n = typeof value === "number" ? value : Number(value);
              if (name === "Production") return [`${n} kWh`, name];
              return [formatUsd(n), String(name)];
            }}
          />
          <Legend verticalAlign="top" height={22} wrapperStyle={{ fontSize: 11, color: "var(--color-muted-foreground)" }} />
          <Bar yAxisId="kwh" dataKey="kwh" name="Production" fill="var(--color-primary)" radius={[3, 3, 0, 0]} />
          <Line yAxisId="bill" dataKey="currentBill" name="Today's bill" type="monotone" stroke="var(--color-muted-foreground)" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
          <Line yAxisId="bill" dataKey="newBill" name="New bill" type="monotone" stroke="var(--color-primary)" strokeWidth={2} dot={{ r: 3, fill: "var(--color-gold-fg)" }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
