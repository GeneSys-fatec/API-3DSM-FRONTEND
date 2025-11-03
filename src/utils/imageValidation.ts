export const IMAGE_MIME_REGEX = /^image\/(jpeg|jpg|png)$/i;
export const IMAGE_EXT_REGEX = /\.(jpe?g|png)$/i;

export function isImage(file: File): boolean {
  const t = file.type || "";
  return IMAGE_MIME_REGEX.test(t) || IMAGE_EXT_REGEX.test(file.name || "");
}

// Retorna string de erro ou null se válido
export function validateImageSize(file: File, maxBytes: number): string | null {
  if (!isImage(file)) return "Arquivo não é uma imagem suportada.";
  if (file.size > maxBytes) {
    const mb = (maxBytes / (1024 * 1024)).toFixed(0);
    return `${file.name}: imagem excede ${mb} MB permitidos`;
  }
  return null;
}

export const imageAccept = "image/png,image/jpeg";