const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Minimal, safe Markdown for admin-authored content. Escapes first, then formats. */
export function renderMarkdown(md: string): string {
  const lines = escape(md.replace(/\r\n/g, "\n")).split("\n");
  const out: string[] = [];
  let inList = false;
  let paragraph: string[] = [];

  const inline = (s: string) =>
    s
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)/g, '<a href="$2" rel="noopener">$1</a>');

  const flushParagraph = () => {
    if (paragraph.length) {
      out.push(`<p>${inline(paragraph.join(" "))}</p>`);
      paragraph = [];
    }
  };
  const closeList = () => {
    if (inList) {
      out.push("</ul>");
      inList = false;
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flushParagraph();
      closeList();
      continue;
    }
    if (line.startsWith("### ")) {
      flushParagraph(); closeList();
      out.push(`<h3>${inline(line.slice(4))}</h3>`);
    } else if (line.startsWith("## ")) {
      flushParagraph(); closeList();
      out.push(`<h2>${inline(line.slice(3))}</h2>`);
    } else if (line.startsWith("# ")) {
      flushParagraph(); closeList();
      out.push(`<h2>${inline(line.slice(2))}</h2>`);
    } else if (/^[-*] /.test(line)) {
      flushParagraph();
      if (!inList) { out.push("<ul>"); inList = true; }
      out.push(`<li>${inline(line.slice(2))}</li>`);
    } else if (/^\d+\. /.test(line)) {
      flushParagraph();
      if (!inList) { out.push("<ul>"); inList = true; }
      out.push(`<li>${inline(line.replace(/^\d+\.\s/, ""))}</li>`);
    } else if (line.startsWith("> ")) {
      flushParagraph(); closeList();
      out.push(`<blockquote>${inline(line.slice(2))}</blockquote>`);
    } else {
      paragraph.push(line.trim());
    }
  }
  flushParagraph();
  closeList();
  return out.join("\n");
}
