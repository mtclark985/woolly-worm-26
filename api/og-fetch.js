export default async function handler(req, res) {
  const { url } = req.query

  if (!url) {
    return res.status(400).json({ imageUrl: null, title: null, error: 'Missing url parameter' })
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; OGFetcher/1.0)',
        'Accept': 'text/html',
      },
    })
    clearTimeout(timeout)

    const html = await response.text()

    // Parse OG image
    const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i)
      || html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i)

    // Parse OG title
    const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i)
      || html.match(/<title[^>]*>([^<]+)<\/title>/i)

    return res.status(200).json({
      imageUrl: ogImageMatch?.[1] || null,
      title: ogTitleMatch?.[1] || null,
    })
  } catch {
    return res.status(200).json({ imageUrl: null, title: null })
  }
}
