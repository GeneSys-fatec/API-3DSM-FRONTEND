import { toast } from "react-toastify";

export type ErroRespostaDTO = { titulo?: string; mensagem?: string };

export async function parseErroResposta(res: Response): Promise<string> {
  try {
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = (await res.json()) as ErroRespostaDTO | unknown;
      if (data && typeof data === "object") {
        const maybe = data as ErroRespostaDTO;
        return (
          (maybe.mensagem && String(maybe.mensagem)) ||
          (maybe.titulo && String(maybe.titulo)) ||
          ""
        );
      }
    }
    const text = await res.text();
    return text || "";
  } catch {
    return "";
  }
}

export async function showErrorToastFromResponse(
  res: Response | null | undefined,
  prefix?: string
): Promise<void> {
  if (!res || res.ok) return;
  const parsed = await parseErroResposta(res);
  const fallback = `Ocorreu um erro. (status ${res.status})`;
  const message = parsed || fallback;
  toast.error(prefix ? `${prefix}: ${message}` : message);
}

export function showValidationToast(errors: string[], title?: string) {
  if (!errors || errors.length === 0) return;
  toast.dismiss();
  const message =
    (title ? `${title}:\n` : "") + errors.map((e) => `• ${e}`).join("\n");
  toast.error(message, { style: { whiteSpace: "pre-line" } });
}

export function getErrorMessage(error: unknown, defaultMsg = "Ocorreu um erro inesperado"): string {
  if (error instanceof Error) {
    try {
      const parsed = JSON.parse(error.message);
      return parsed.mensagem || parsed.titulo || error.message;
    } catch {
      return error.message;
    }
  }

  if (typeof error === "string") return error;

  return defaultMsg;
}