import React from "react";

interface RichTextProps {
  children?: string;
  text?: string;
  style?: React.CSSProperties;
}

export function RichText({ children, text, style }: RichTextProps) {
  const content = text || children || "";

  if (!content) return null;

  const processed = content
    .replace(/\\times/g, "×")
    .replace(/\\dots/g, "…")
    .replace(/\\le/g, "≤")
    .replace(/\\ge/g, "≥")
    .replace(/\\ne/g, "≠")
    .replace(/\\approx/g, "≈")
    .replace(/\\pm/g, "±");

  // We split by '$' to identify inline math equations
  // e.g. "Given $N$, compute" -> ["Given ", "N", ", compute"]
  const parts = processed.split("$");

  return (
    <span style={{ lineHeight: 1.6, ...style }}>
      {parts.map((part, index) => {
        const isMath = index % 2 === 1;

        if (isMath) {
          return (
            <span
              key={index}
              style={{
                fontFamily: "math, Cambria, 'Times New Roman', serif",
                fontStyle: "italic",
                fontWeight: "600",
                fontSize: "1.05em",
                color: "inherit",
                marginLeft: "0.15rem",
                marginRight: "0.15rem",
              }}
            >
              {part}
            </span>
          );
        }

        // For regular text, we can support basic formatting like bold or line breaks
        // Split by newlines to preserve formatting
        const subParts = part.split("\n");
        return (
          <React.Fragment key={index}>
            {subParts.map((line, lineIdx) => (
              <React.Fragment key={lineIdx}>
                {lineIdx > 0 && <br />}
                {line}
              </React.Fragment>
            ))}
          </React.Fragment>
        );
      })}
    </span>
  );
}
