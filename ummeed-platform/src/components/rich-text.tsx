import React from "react";

interface RichTextProps {
  children?: string;
  text?: string;
  style?: React.CSSProperties;
}

// Inline formatter for bold, code, math, italics
function formatInline(text: string): React.ReactNode[] {
  let parts: React.ReactNode[] = [];
  let index = 0;
  const len = text.length;
  let currentText = "";
  
  const flushText = () => {
    if (currentText) {
      parts.push(currentText);
      currentText = "";
    }
  };

  // Helper to replace math symbols
  const formatMath = (mathStr: string) => {
    let formatted = mathStr
      .replace(/\\times/g, "×")
      .replace(/\\dots/g, "…")
      .replace(/\\le/g, "≤")
      .replace(/\\ge/g, "≥")
      .replace(/\\ne/g, "≠")
      .replace(/\\approx/g, "≈")
      .replace(/\\pm/g, "±")
      .replace(/\\cdot/g, "·")
      .replace(/\\alpha/g, "α")
      .replace(/\\beta/g, "β")
      .replace(/\\gamma/g, "γ")
      .replace(/\\theta/g, "θ")
      .replace(/\\pi/g, "π")
      .replace(/\\infty/g, "∞")
      .replace(/\\rarr/g, "→")
      .replace(/\\larr/g, "←")
      .replace(/\\le/g, "≤")
      .replace(/\\ge/g, "≥")
      .replace(/\\neq/g, "≠");

    // Replace superscripts like 10^9 or x^y or x^{y}
    const superscriptRegex = /([a-zA-Z0-9\(\)]+)\^([a-zA-Z0-9\(\)\{\}\-]+)/g;
    formatted = formatted.replace(superscriptRegex, (match, base, exp) => {
      const cleanExp = exp.replace(/[\{\}]/g, "");
      return `${base}<sup>${cleanExp}</sup>`;
    });

    return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
  };

  while (index < len) {
    // 1. Bold: **
    if (text.startsWith("**", index)) {
      const closing = text.indexOf("**", index + 2);
      if (closing !== -1) {
        flushText();
        const content = text.slice(index + 2, closing);
        parts.push(<strong key={index}>{formatInline(content)}</strong>);
        index = closing + 2;
        continue;
      }
    }

    // 2. Inline code: `
    if (text.startsWith("`", index)) {
      const closing = text.indexOf("`", index + 1);
      if (closing !== -1) {
        flushText();
        const content = text.slice(index + 1, closing);
        parts.push(
          <code 
            key={index} 
            style={{ 
              backgroundColor: "#f1f5f9", 
              padding: "0.15rem 0.35rem", 
              borderRadius: "4px", 
              fontSize: "0.85em", 
              fontFamily: "monospace", 
              color: "#db2777" 
            }}
          >
            {content}
          </code>
        );
        index = closing + 1;
        continue;
      }
    }

    // 3. Math: $
    if (text.startsWith("$", index)) {
      const closing = text.indexOf("$", index + 1);
      if (closing !== -1) {
        flushText();
        const content = text.slice(index + 1, closing);
        parts.push(
          <span 
            key={index} 
            style={{ 
              fontFamily: "math, Cambria, 'Times New Roman', serif",
              fontStyle: "italic",
              fontWeight: "600",
              fontSize: "1.05em",
              padding: "0 0.15rem"
            }}
          >
            {formatMath(content)}
          </span>
        );
        index = closing + 1;
        continue;
      }
    }

    // 4. Italics: *
    if (text.startsWith("*", index)) {
      const closing = text.indexOf("*", index + 1);
      if (closing !== -1 && closing > index + 1) {
        flushText();
        const content = text.slice(index + 1, closing);
        parts.push(<em key={index}>{formatInline(content)}</em>);
        index = closing + 1;
        continue;
      }
    }

    // 5. Italics: _
    if (text.startsWith("_", index)) {
      const closing = text.indexOf("_", index + 1);
      if (closing !== -1) {
        flushText();
        const content = text.slice(index + 1, closing);
        parts.push(<em key={index}>{formatInline(content)}</em>);
        index = closing + 1;
        continue;
      }
    }

    currentText += text[index];
    index++;
  }

  flushText();
  return parts;
}

export function RichText({ children, text, style }: RichTextProps) {
  const content = text || children || "";
  if (!content) return null;

  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  
  let currentListItems: React.ReactNode[] = [];
  
  const flushList = (key: number) => {
    if (currentListItems.length > 0) {
      elements.push(
        <ul key={`ul-${key}`} style={{ margin: "0.5rem 0 1rem 1.5rem", paddingLeft: "0.5rem", listStyleType: "disc" }}>
          {currentListItems}
        </ul>
      );
      currentListItems = [];
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    
    // Headers
    if (trimmed.startsWith("### ")) {
      flushList(idx);
      elements.push(
        <h3 key={idx} style={{ fontSize: "1.1rem", fontWeight: 700, margin: "1.25rem 0 0.5rem", color: "#1f2937", lineHeight: 1.5 }}>
          {formatInline(trimmed.slice(4))}
        </h3>
      );
      return;
    }
    if (trimmed.startsWith("## ")) {
      flushList(idx);
      elements.push(
        <h2 key={idx} style={{ fontSize: "1.25rem", fontWeight: 700, margin: "1.5rem 0 0.75rem", color: "#111827", lineHeight: 1.5 }}>
          {formatInline(trimmed.slice(3))}
        </h2>
      );
      return;
    }
    if (trimmed.startsWith("# ")) {
      flushList(idx);
      elements.push(
        <h1 key={idx} style={{ fontSize: "1.4rem", fontWeight: 800, margin: "1.75rem 0 1rem", color: "#111827", lineHeight: 1.5 }}>
          {formatInline(trimmed.slice(2))}
        </h1>
      );
      return;
    }

    // Unordered List Items
    if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
      currentListItems.push(
        <li key={`li-${idx}`} style={{ marginBottom: "0.4rem", lineHeight: 1.6 }}>
          {formatInline(trimmed.slice(2))}
        </li>
      );
      return;
    }

    // Ordered List Items (e.g. "1. ")
    const orderedListMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (orderedListMatch) {
      flushList(idx);
      elements.push(
        <div key={idx} style={{ display: "flex", gap: "0.5rem", margin: "0.5rem 0", paddingLeft: "0.25rem", lineHeight: 1.6 }}>
          <span style={{ fontWeight: 700, color: "#4b5563" }}>{orderedListMatch[1]}.</span>
          <span style={{ flex: 1 }}>{formatInline(orderedListMatch[2])}</span>
        </div>
      );
      return;
    }

    // Empty line - flush any active lists and add spacing
    if (trimmed === "") {
      flushList(idx);
      elements.push(<div key={`space-${idx}`} style={{ height: "0.5rem" }} />);
      return;
    }

    // Plain Paragraph
    flushList(idx);
    elements.push(
      <p key={idx} style={{ margin: "0 0 0.75rem 0", color: "#374151", lineHeight: 1.6, ...style }}>
        {formatInline(line)}
      </p>
    );
  });

  flushList(lines.length);
  return <div style={{ display: "flex", flexDirection: "column" }}>{elements}</div>;
}
