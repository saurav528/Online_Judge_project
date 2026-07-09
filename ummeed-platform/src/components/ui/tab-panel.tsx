"use client";

import React, { useState } from "react";

interface TabPanelProps {
  tabs: Array<{ id: string; label: string; icon?: string; count?: number }>;
  defaultTab?: string;
  children: Record<string, React.ReactNode>;
}

export function TabPanel({ tabs, defaultTab, children }: TabPanelProps) {
  const [active, setActive] = useState(defaultTab || tabs[0]?.id);

  return (
    <div>
      {/* Tab bar */}
      <div className="tab-bar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-item ${active === tab.id ? "active" : ""}`}
            onClick={() => setActive(tab.id)}
          >
            {tab.icon && <span style={{ marginRight: "0.35rem" }}>{tab.icon}</span>}
            {tab.label}
            {tab.count !== undefined && (
              <span style={{
                marginLeft: "0.4rem", fontSize: "0.7rem", fontWeight: 700,
                background: active === tab.id ? "#dbeafe" : "#f3f4f6",
                color: active === tab.id ? "#1a56db" : "#9ca3af",
                padding: "0.1rem 0.4rem", borderRadius: "999px",
              }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
      {/* Active content */}
      <div>{children[active]}</div>
    </div>
  );
}
