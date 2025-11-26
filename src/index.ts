import { renderHtml } from "./renderHtml";

export default {
  async fetch(request, env) {
    let results: unknown = [];
    try {
      const stmt = env.DB.prepare("SELECT * FROM comments LIMIT 3");
      const r = await stmt.all();
      results = r.results;
    } catch {}
    return new Response(renderHtml(JSON.stringify(results, null, 2)), {
      headers: { "content-type": "text/html" },
    });
  },
} satisfies ExportedHandler<Env>;
