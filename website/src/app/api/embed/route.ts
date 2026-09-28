// Proxies ansembed.net embed pages to strip the Anime-Sama intro overlay.
const ALLOWED_HOST = "ansembed.net";

export async function GET(req: Request) {
  const raw = new URL(req.url).searchParams.get("url");
  let target: URL;
  try {
    target = new URL(raw ?? "");
  } catch {
    return new Response("Invalid url", { status: 400 });
  }
  if (target.protocol !== "https:" || target.hostname !== ALLOWED_HOST) {
    return new Response("Host not allowed", { status: 400 });
  }

  const upstream = await fetch(target, {
    headers: { "User-Agent": req.headers.get("user-agent") ?? "Mozilla/5.0", Referer: "https://anime-sama.to/" },
    cache: "no-store",
  });
  if (!upstream.ok) return new Response("Upstream error", { status: 502 });

  const html = (await upstream.text())
    // The player calls window.installAnimeSamaIntro only if defined, so dropping the assets disables the intro.
    .replace(/<(link|script)[^>]*anime-sama-(intro|logo)[^>]*>(<\/script>)?/gi, "")
    .replace(/<head>/i, `<head><base href="${target.origin}/">`);

  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
