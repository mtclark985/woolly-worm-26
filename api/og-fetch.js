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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    })
    clearTimeout(timeout)

    const html = await response.text()

    // Detect bot-protection interstitial pages
    const headSnippet = html.slice(0, 2000).toLowerCase()
    const botSignatures = [
      'cf-browser-verification',
      'cf-chl-bypass',
      '<title>just a moment',
      '<title>attention required',
      'ddos protection by cloudflare',
    ]
    if (botSignatures.some((sig) => headSnippet.includes(sig))) {
      console.log(`OG fetch: bot-protection page detected for ${url}`)
      return res.status(200).json({ imageUrl: null, title: null, bedrooms: null, bathrooms: null, sleeps: null, sleepingAreas: null })
    }

    // Parse OG image
    const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i)
      || html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i)

    // Parse OG title
    const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i)
      || html.match(/<title[^>]*>([^<]+)<\/title>/i)

    // Extract structured data from JSON-LD and meta tags
    const structured = extractStructuredData(html)

    return res.status(200).json({
      imageUrl: ogImageMatch?.[1] || null,
      title: ogTitleMatch?.[1] || null,
      bedrooms: structured.bedrooms,
      bathrooms: structured.bathrooms,
      sleeps: structured.sleeps,
      sleepingAreas: structured.sleepingAreas,
    })
  } catch {
    return res.status(200).json({ imageUrl: null, title: null, bedrooms: null, bathrooms: null, sleeps: null, sleepingAreas: null })
  }
}

function clamp(value, min, max) {
  const num = Number(value)
  if (isNaN(num) || num < min || num > max) return null
  return num
}

function extractStructuredData(html) {
  let bedrooms = null
  let bathrooms = null
  let sleeps = null
  let sleepingAreas = null

  // 1. JSON-LD extraction
  const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  let match
  while ((match = jsonLdRegex.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(match[1])
      extractFromJsonLd(parsed)
    } catch { /* skip bad JSON */ }
  }

  function extractFromJsonLd(obj) {
    if (!obj || typeof obj !== 'object') return
    // Handle @graph arrays
    if (Array.isArray(obj)) {
      obj.forEach(extractFromJsonLd)
      return
    }
    if (obj['@graph'] && Array.isArray(obj['@graph'])) {
      obj['@graph'].forEach(extractFromJsonLd)
    }

    // Check relevant types
    const type = obj['@type']
    const types = Array.isArray(type) ? type : [type]
    const relevant = ['LodgingBusiness', 'Accommodation', 'House', 'Apartment',
      'VacationRental', 'Product', 'RealEstateListing', 'SingleFamilyResidence',
      'Hotel', 'BedAndBreakfast', 'Resort']
    const isRelevant = types.some(t => relevant.includes(t))

    if (isRelevant || obj.numberOfRooms || obj.numberOfBedrooms || obj.numberOfBathroomsTotal) {
      if (bedrooms === null) {
        bedrooms = clamp(obj.numberOfBedrooms || obj.numberOfRooms, 1, 20)
      }
      if (bathrooms === null) {
        bathrooms = clamp(obj.numberOfBathroomsTotal || obj.numberOfBathroomsRoom || obj.numberOfBathrooms, 0.5, 20)
      }
      if (sleeps === null) {
        sleeps = clamp(obj.numberOfBeds || obj.bed?.numberOfBeds, 1, 50)
      }
    }

    // Recurse into nested objects (e.g., containsPlace, amenityFeature)
    if (obj.containsPlace) extractFromJsonLd(obj.containsPlace)
    if (obj.accommodationFloorPlan) extractFromJsonLd(obj.accommodationFloorPlan)
  }

  // 2. Meta tag fallbacks (VRBO/Airbnb specific)
  if (bedrooms === null) {
    const metaBedrooms = html.match(/<meta[^>]*name=["'](?:vrbo|airbnb):bedrooms["'][^>]*content=["']([^"']+)["']/i)
    if (metaBedrooms) bedrooms = clamp(metaBedrooms[1], 1, 20)
  }
  if (bathrooms === null) {
    const metaBathrooms = html.match(/<meta[^>]*name=["'](?:vrbo|airbnb):bathrooms["'][^>]*content=["']([^"']+)["']/i)
    if (metaBathrooms) bathrooms = clamp(metaBathrooms[1], 0.5, 20)
  }
  if (sleeps === null) {
    const metaBeds = html.match(/<meta[^>]*name=["'](?:vrbo|airbnb):beds["'][^>]*content=["']([^"']+)["']/i)
    if (metaBeds) sleeps = clamp(metaBeds[1], 1, 50)
  }

  return { bedrooms, bathrooms, sleeps, sleepingAreas }
}
