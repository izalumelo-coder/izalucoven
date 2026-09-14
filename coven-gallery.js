// Lê os envios do formulário "coven" (Netlify Forms) e devolve
// nome, cidade, recado e a URL da foto — para a galeria ao vivo.
// O token fica seguro numa variável de ambiente; nunca aparece no site.

exports.handler = async () => {
  const token  = process.env.NETLIFY_API_TOKEN;
  const siteId = process.env.NETLIFY_SITE_ID || process.env.SITE_ID;

  const json = (obj) => ({
    statusCode: 200,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
    body: JSON.stringify(obj),
  });

  if (!token || !siteId) {
    return json({ witches: [], error: 'Faltam variáveis: NETLIFY_API_TOKEN e/ou NETLIFY_SITE_ID' });
  }

  try {
    const url = `https://api.netlify.com/api/v1/sites/${siteId}/submissions?per_page=100`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return json({ witches: [], error: 'API Netlify respondeu ' + res.status });

    const subs = await res.json();
    const witches = subs
      .filter((s) => (s.form_name || '') === 'coven')
      .map((s) => {
        const d = s.data || {};
        let foto = d.foto;
        if (foto && typeof foto === 'object') foto = foto.url || foto.href || '';
        return {
          nome:   (d.nome   || s.name || '').toString(),
          cidade: (d.cidade || '').toString(),
          recado: (d.recado || '').toString(),
          foto:   (foto || '').toString(),
        };
      })
      .filter((w) => w.foto);

    return json({ witches });
  } catch (e) {
    return json({ witches: [], error: String(e) });
  }
};
