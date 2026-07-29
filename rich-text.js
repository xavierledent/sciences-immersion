/* Shared safe renderer for teacher-authored text.

   Every JSON field on this site is written in the admin tools, whose G/I/S
   buttons insert <strong>, <em> and <u>. Injecting those fields straight into
   innerHTML would make the formatting work but would also read a plain "<" as
   markup — and science statements legitimately contain them ("si T < 0 °C",
   "acide & base"). So the text is escaped first and only the formatting tags
   below are re-enabled afterwards.

   Side benefit: no arbitrary HTML from a JSON file can ever be executed.

   To allow a new tag (e.g. <sub>/<sup> for chemical formulas), add it to
   ALLOWED_TAGS here — this is the single place the four engines share. */
(function (global) {
  const ALLOWED_TAGS = 'strong|em|u|br';
  const TAG_RE = new RegExp('&lt;(\\/?)(' + ALLOWED_TAGS + ')\\s*\\/?&gt;', 'gi');

  // Returns a safe HTML string, for engines that build markup with templates.
  function richText(raw) {
    return String(raw == null ? '' : raw)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(TAG_RE, (match, slash, tag) => '<' + slash + tag.toLowerCase() + '>');
  }

  // Convenience wrapper for engines that write directly into an element.
  function setRichText(element, raw) {
    if (element) element.innerHTML = richText(raw);
  }

  global.richText = richText;
  global.setRichText = setRichText;
})(window);
