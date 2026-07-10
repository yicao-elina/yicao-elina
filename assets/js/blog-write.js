/* ============================================================
   blog-write.js
   Client-side markdown editor for blog posts.
   - Live preview: as the user types in #write-body, render
     marked.parse(value, { gfm: true, breaks: true }) into
     #write-preview .preview-content.
   - Download: clicking [data-write-download] builds a YAML
     frontmatter + body string, wraps it in a Blob, and triggers
     a hidden <a download> click. The filename is
     "<date>-<slug>.md".
   Requires: window.marked (loaded via assets/js/marked.min.js
   BEFORE this script in the HTML).
   Idempotent: bound on DOMContentLoaded only.
   ============================================================ */
(function () {
  "use strict";

  function slugify(title) {
    var s = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    return s || "untitled";
  }

  function buildMarkdown(fields) {
    var tags = fields.tags
      .split(",")
      .map(function (t) { return t.trim(); })
      .filter(function (t) { return t.length > 0; });

    var lines = [
      "---",
      "title: " + fields.title,
      "date: " + fields.date,
      "category: " + fields.category,
      "tags: [" + tags.join(", ") + "]",
      "summary: " + fields.summary,
      "---",
      "",
      "# " + fields.title,
      "",
      fields.body,
    ];
    return lines.join("\n");
  }

  function filename(fields) {
    return fields.date + "-" + slugify(fields.title) + ".md";
  }

  function readFields() {
    return {
      title: document.getElementById("write-title").value || "",
      date: document.getElementById("write-date").value || "",
      category: document.getElementById("write-category").value || "technical",
      tags: document.getElementById("write-tags").value || "",
      summary: document.getElementById("write-summary").value || "",
      body: document.getElementById("write-body").value || "",
    };
  }

  function updatePreview() {
    var preview = document.querySelector("#write-preview .preview-content");
    var body = document.getElementById("write-body");
    if (!preview || !body || !window.marked) return;
    preview.innerHTML = window.marked.parse(body.value, {
      gfm: true,
      breaks: true,
    });
  }

  function onDownload(e) {
    e.preventDefault();
    var fields = readFields();
    var md = buildMarkdown(fields);
    var name = filename(fields);
    var blob = new Blob([md], { type: "text/markdown" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function init() {
    var body = document.getElementById("write-body");
    var download = document.querySelector("[data-write-download]");
    if (!body || !download) return;

    body.addEventListener("input", updatePreview);
    download.addEventListener("click", onDownload);

    // First render with whatever is in the textarea on load.
    updatePreview();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
