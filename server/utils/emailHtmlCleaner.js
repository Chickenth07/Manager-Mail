export function unwrapImageParagraph(html) {
  return html.replace(/<p[^>]*>\s*(<img[^>]+>)\s*<\/p>/gi, "$1");
}

export function normalizeImageForEmail(html) {
  return html.replace(
    /<img([^>]*)>/gi,
    '<img$1 style="display:block; line-height:0; border:0; outline:none; text-decoration:none;" />'
  );
}
