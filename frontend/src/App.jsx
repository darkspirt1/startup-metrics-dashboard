import { useState, useEffect } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const API = "http://localhost:8000/api";

function MetricCard({ label, value, sub, subColor = "#888780" }) {
  return (
    <div style={{
      background: "#ffffff",
      borderRadius: 12,
      padding: "16px 18px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
      border: "1px solid #eeece8",
    }}>
      <div style={{ fontSize: 11, color: "#888780", marginBottom: 6, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-0.5px" }}>{value}</div>
      {sub && <div style={{ fontSize: 12, marginTop: 4, color: subColor, fontWeight: 500 }}>{sub}</div>}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div style={{
      fontSize: 11,
      fontWeight: 600,
      color: "#888780",
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      margin: "28px 0 12px",
    }}>
      {children}
    </div>
  );
}

function OverviewTab() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`${API}/metrics`)
      .then(res => res.json())
      .then(setData);
  }, []);

  if (!data) return <p style={{ color: "#888780" }}>Loading...</p>;

  return (
    <>
      <div style={{
        background: "linear-gradient(135deg, #f0effd 0%, #e8f4ff 100%)",
        border: "1px solid #d0ccf5",
        borderRadius: 14,
        padding: "20px 22px",
        marginBottom: 20,
        boxShadow: "0 2px 8px rgba(127,119,221,0.1)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <span style={{ fontSize: 16 }}>⭐</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: "#5048B8", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            North star metric
          </span>
        </div>
        <div style={{ fontSize: 40, fontWeight: 700, color: "#3C3489", letterSpacing: "-1px", lineHeight: 1 }}>
          {data.north_star_metric}%
        </div>
        <div style={{ fontSize: 13, color: "#5048B8", marginTop: 8, fontWeight: 500 }}>
          {data.north_star_label}
        </div>
        <div style={{ fontSize: 12, color: "#888780", marginTop: 4 }}>
          % of weekly active users who complete a core action
        </div>
      </div>

      <SectionTitle>Key metrics</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <MetricCard label="DAU today" value={data.dau.toLocaleString()} />
        <MetricCard label="MAU this month" value={data.mau.toLocaleString()} />
        <MetricCard
          label="DAU / MAU ratio"
          value={`${data.dau_mau_ratio}%`}
          sub={data.dau_mau_ratio < 20 ? "Below 20% target" : "Healthy"}
          subColor={data.dau_mau_ratio < 20 ? "#E24B4A" : "#1D9E75"}
        />
        <MetricCard label="Avg session" value={`${data.avg_session_min} min`} />
      </div>

      <SectionTitle>DAU last 7 days</SectionTitle>
      <div style={{
        background: "#ffffff",
        borderRadius: 14,
        padding: "20px 8px 12px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        border: "1px solid #eeece8",
      }}>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={data.dau_trend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <XAxis dataKey="date" tickFormatter={d => d.slice(5)} tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={v => [v.toLocaleString(), "DAU"]} />
            <Bar dataKey="dau" fill="#7F77DD" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}


function RetentionTab() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`${API}/retention`)
      .then(res => res.json())
      .then(setData);
  }, []);

  if (!data) return <p style={{ color: "#888780" }}>Loading...</p>;

  return (
    <>
      <SectionTitle>Cohort — {data.cohort_size.toLocaleString()} users</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {data.milestones.map(m => (
          <div key={m.day} style={{
            background: "#f5f4f0",
            borderRadius: 10,
            padding: "12px 14px",
            textAlign: "center",
          }}>
            <div style={{ fontSize: 11, color: "#888780" }}>Day {m.day}</div>
            <div style={{
              fontSize: 22,
              fontWeight: 500,
              color: m.retention_pct < 20 ? "#E24B4A"
                : m.retention_pct < 50 ? "#EF9F27" : "#1D9E75",
            }}>
              {m.retention_pct}%
            </div>
            <div style={{ fontSize: 11, color: "#888780" }}>
              {Math.round(data.cohort_size * m.retention_pct / 100).toLocaleString()} users
            </div>
          </div>
        ))}
      </div>

      <SectionTitle>Retention curve</SectionTitle>
      <div style={{
        background: "#ffffff",
        borderRadius: 14,
        padding: "20px 8px 12px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        border: "1px solid #eeece8",
      }}>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={data.curve} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <XAxis dataKey="day" tick={{ fontSize: 11 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
            <Tooltip formatter={v => [`${v}%`, "Retained"]} />
            <Line
              type="monotone"
              dataKey="retention_pct"
              stroke="#7F77DD"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}


function FunnelTab() {
  const [data, setData] = useState(null);
  const [device, setDevice] = useState("all");
  const [source, setSource] = useState("all");

  useEffect(() => {
    fetch(`${API}/funnel?device=${device}&source=${source}`)
      .then(res => res.json())
      .then(setData);
  }, [device, source]);

  const COLORS = ["#378ADD", "#1D9E75", "#EF9F27", "#E24B4A"];

  const Pill = ({ label, value, current, setter }) => (
    <button
      onClick={() => setter(value)}
      style={{
        fontSize: 12,
        padding: "4px 10px",
        borderRadius: 8,
        border: "0.5px solid",
        borderColor: current === value ? "transparent" : "#ccc",
        background: current === value ? "#EEEDFE" : "transparent",
        color: current === value ? "#3C3489" : "#888780",
        cursor: "pointer",
        fontWeight: current === value ? 500 : 400,
      }}
    >
      {label}
    </button>
  );

  return (
    <>
      <SectionTitle>Device</SectionTitle>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {["all", "mobile", "desktop"].map(d => (
          <Pill key={d} label={d} value={d} current={device} setter={setDevice} />
        ))}
      </div>

      <SectionTitle>Source</SectionTitle>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {["all", "organic", "paid", "referral", "social"].map(s => (
          <Pill key={s} label={s} value={s} current={source} setter={setSource} />
        ))}
      </div>

      {!data ? <p style={{ color: "#888780" }}>Loading...</p> : (
        <>
          <SectionTitle>Conversion funnel</SectionTitle>
          {data.stages.map((stage, i) => (
            <div key={stage.stage} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{stage.stage}</span>
                <span style={{ fontSize: 12, color: "#888780" }}>
                  {stage.users.toLocaleString()} · {stage.pct_of_total}%
                </span>
              </div>
              <div style={{ background: "#eee", borderRadius: 4, height: 20, overflow: "hidden" }}>
                <div style={{
                  width: `${stage.pct_of_total}%`,
                  height: "100%",
                  background: COLORS[i],
                  borderRadius: 4,
                  display: "flex",
                  alignItems: "center",
                  paddingLeft: 8,
                  fontSize: 11,
                  fontWeight: 500,
                  color: "#fff",
                }}>
                  {stage.pct_of_total}%
                </div>
              </div>
              {stage.drop_pct !== null && (
                <span style={{
                  display: "inline-block",
                  marginTop: 5,
                  fontSize: 11,
                  fontWeight: 500,
                  padding: "3px 10px",
                  borderRadius: 20,
                  background: stage.drop_pct > 60 ? "#FCEBEB"
                    : stage.drop_pct > 30 ? "#FAEEDA" : "#EAF3DE",
                  color: stage.drop_pct > 60 ? "#A32D2D"
                    : stage.drop_pct > 30 ? "#633806" : "#27500A",
                  letterSpacing: "0.02em",
                }}>
                  ↓ {stage.drop_pct}% drop
                </span>
              )}
            </div>
          ))}
          <div style={{
            background: "#ffffff",
            borderRadius: 12,
            padding: "14px 16px",
            marginTop: 8,
            border: "1px solid #eeece8",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          }}>
            <span style={{ fontSize: 13 }}>
              Overall: <strong>{data.overall_conversion_pct}%</strong>
              &nbsp;· Biggest leakage: <strong>{data.biggest_leakage}</strong>
            </span>
          </div>
        </>
      )}
    </>
  );
}


function InsightsTab() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`${API}/insights`)
      .then(res => res.json())
      .then(setData);
  }, []);

  if (!data) return <p style={{ color: "#888780" }}>Loading...</p>;

  return (
    <>
      <SectionTitle>Overall health</SectionTitle>
      <div style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 14px",
        borderRadius: 20,
        fontSize: 13,
        fontWeight: 600,
        marginBottom: 20,
        background: data.overall_health === "needs_attention" ? "#FCEBEB" : "#EAF3DE",
        color: data.overall_health === "needs_attention" ? "#A32D2D" : "#27500A",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}>
        {data.overall_health === "needs_attention" ? "⚠️" : "✅"}
        {data.overall_health === "needs_attention" ? "Needs attention" : "Fair"}
      </div>

      <SectionTitle>Issues found</SectionTitle>
      {data.issues.map((issue, i) => (
        <div key={i} style={{
          borderRadius: 10,
          padding: "12px 14px",
          marginBottom: 10,
          background: issue.severity === "high" ? "#FCEBEB" : "#FAEEDA",
        }}>
          <div style={{
            fontSize: 13,
            fontWeight: 500,
            marginBottom: 4,
            color: issue.severity === "high" ? "#A32D2D" : "#633806",
          }}>
            {issue.title}
          </div>
          <div style={{
            fontSize: 12,
            lineHeight: 1.6,
            color: issue.severity === "high" ? "#A32D2D" : "#633806",
          }}>
            {issue.detail}
          </div>
        </div>
      ))}

      <SectionTitle>Fix recommendations</SectionTitle>
      <div style={{
        background: "#ffffff",
        borderRadius: 14,
        padding: "16px 18px",
        border: "1px solid #d4edda",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}>
        {data.fixes.map((fix, i) => (
          <div key={i} style={{
            fontSize: 12,
            color: "#27500A",
            lineHeight: 1.7,
            display: "flex",
            gap: 8,
          }}>
            <span>✓</span><span>{fix}</span>
          </div>
        ))}
      </div>
    </>
  );
}

export default function App() {
  const [tab, setTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "retention", label: "Retention" },
    { id: "funnel", label: "Funnel" },
    { id: "insights", label: "Insights" },
  ];

  return (
    <div style={{
      maxWidth: 520,
      margin: "0 auto",
      padding: "28px 20px 60px",
      fontFamily: "inherit",
      color: "#2C2C2A",
    }}>
      <div style={{
        marginBottom: 24,
        paddingBottom: 20,
        borderBottom: "1px solid #eeece8",
      }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#7F77DD", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
          Portfolio project
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 4, letterSpacing: "-0.3px" }}>
          Startup Metrics Dashboard
        </h1>
        <p style={{ fontSize: 13, color: "#888780" }}>
          GrowthOS · 3,500 users · Live from SQLite + FastAPI
        </p>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              fontSize: 13,
              padding: "6px 14px",
              borderRadius: 8,
              cursor: "pointer",
              border: "0.5px solid",
              fontWeight: tab === t.id ? 500 : 400,
              borderColor: tab === t.id ? "transparent" : "#ccc",
              background: tab === t.id ? "#EEEDFE" : "transparent",
              color: tab === t.id ? "#3C3489" : "#5F5E5A",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && <OverviewTab />}
      {tab === "retention" && <RetentionTab />}
      {tab === "funnel" && <FunnelTab />}
      {tab === "insights" && <InsightsTab />}
    </div>
  );
}