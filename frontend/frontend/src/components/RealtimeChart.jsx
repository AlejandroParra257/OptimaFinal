import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function RealtimeChart({ summaryByS }) {
  const data = Object.values(summaryByS).map((s) => ({
  name: s.label.split(" ")[0],
  ok: Number(s.ok), // 👈 CLAVE
}));
  return (
    <div style={{ width: "100%", height: 220 }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="ok" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}



