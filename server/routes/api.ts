import { Router } from 'express';
import { RapidoServiceAdapter } from '../adapters/RapidoAdapter.js';
import { UberServiceAdapter } from '../adapters/UberAdapter.js';
import { OlaServiceAdapter } from '../adapters/OlaAdapter.js';
import { NammaYatriServiceAdapter } from '../adapters/NammaYatriAdapter.js';
import { BluSmartServiceAdapter } from '../adapters/BluSmartAdapter.js';
import {
  ComparisonResponse,
  LocationCoordinate,
  RideQuote,
  RideRecommendation
} from '../adapters/types.js';
import { computeRoute } from '../services/routeService.js';

export const apiRouter = Router();

const rapidoAdapter = new RapidoServiceAdapter();
const uberAdapter = new UberServiceAdapter();
const olaAdapter = new OlaServiceAdapter();
const nammaYatriAdapter = new NammaYatriServiceAdapter();
const bluSmartAdapter = new BluSmartServiceAdapter();

// Popular routes in India for 1-click test comparisons
const POPULAR_ROUTES = [
  {
    city: 'Bengaluru',
    name: 'Indiranagar 100ft Rd to Koramangala 5th Block',
    origin: {
      lat: 12.9719,
      lng: 77.6412,
      address: '100 Feet Rd, Indiranagar, Bengaluru, Karnataka'
    },
    destination: {
      lat: 12.9352,
      lng: 77.6245,
      address: 'Koramangala 5th Block, Bengaluru, Karnataka'
    }
  },
  {
    city: 'Bengaluru',
    name: 'Koramangala to Kempegowda Intl Airport (BLR)',
    origin: {
      lat: 12.9352,
      lng: 77.6245,
      address: 'Koramangala Sony World Junction, Bengaluru'
    },
    destination: {
      lat: 13.1986,
      lng: 77.7066,
      address: 'Kempegowda International Airport (BLR), Devanahalli'
    }
  },
  {
    city: 'Delhi NCR',
    name: 'Connaught Place to Cyber City Gurgaon',
    origin: {
      lat: 28.6315,
      lng: 77.2167,
      address: 'Connaught Place Inner Circle, New Delhi'
    },
    destination: {
      lat: 28.4950,
      lng: 77.0895,
      address: 'DLF Cyber City, Phase 2, Gurugram, Haryana'
    }
  },
  {
    city: 'Mumbai',
    name: 'Bandra West (Linking Rd) to BKC Diamond Bourse',
    origin: {
      lat: 19.0600,
      lng: 72.8360,
      address: 'Linking Road, Bandra West, Mumbai, Maharashtra'
    },
    destination: {
      lat: 19.0673,
      lng: 72.8687,
      address: 'Bandra Kurla Complex (BKC), G Block, Mumbai'
    }
  },
  {
    city: 'Hyderabad',
    name: 'Hitec City Cyber Towers to Gachibowli Stadium',
    origin: {
      lat: 17.4504,
      lng: 78.3808,
      address: 'Cyber Towers, Hitec City, Hyderabad, Telangana'
    },
    destination: {
      lat: 17.4443,
      lng: 78.3498,
      address: 'Gachibowli Indoor Stadium, Gachibowli, Hyderabad'
    }
  }
];

apiRouter.get('/config', (req, res) => {
  res.json({
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY || ''
  });
});

apiRouter.get('/popular-routes', (req, res) => {
  res.json(POPULAR_ROUTES);
});

apiRouter.get('/adapters/status', (req, res) => {
  res.json({
    rapido: {
      configured: rapidoAdapter.isConfigured(),
      mode: rapidoAdapter.isConfigured() ? 'live' : 'demo',
      provider: 'Rapido',
      supportedCategories: ['bike', 'auto'],
      requiredEnv: ['RAPIDO_CLIENT_ID', 'RAPIDO_CLIENT_SECRET', 'RAPIDO_API_KEY']
    },
    uber: {
      configured: uberAdapter.isConfigured(),
      mode: uberAdapter.isConfigured() ? 'live' : 'demo',
      provider: 'Uber',
      supportedCategories: ['bike', 'auto', 'cab'],
      requiredEnv: ['UBER_SERVER_TOKEN', 'UBER_CLIENT_ID', 'UBER_CLIENT_SECRET']
    },
    ola: {
      configured: olaAdapter.isConfigured(),
      mode: olaAdapter.isConfigured() ? 'live' : 'demo',
      provider: 'Ola',
      supportedCategories: ['bike', 'auto', 'cab'],
      requiredEnv: ['OLA_CLIENT_ID', 'OLA_CLIENT_SECRET', 'OLA_API_KEY']
    },
    namma_yatri: {
      configured: nammaYatriAdapter.isConfigured(),
      mode: nammaYatriAdapter.isConfigured() ? 'live' : 'demo',
      provider: 'Namma Yatri',
      supportedCategories: ['auto', 'cab'],
      requiredEnv: ['NAMMA_YATRI_API_KEY']
    },
    blusmart: {
      configured: bluSmartAdapter.isConfigured(),
      mode: bluSmartAdapter.isConfigured() ? 'live' : 'demo',
      provider: 'BluSmart EV',
      supportedCategories: ['cab'],
      requiredEnv: ['BLUSMART_API_KEY']
    }
  });
});

apiRouter.post('/compare', async (req, res) => {
  try {
    const { origin, destination } = req.body as {
      origin?: LocationCoordinate;
      destination?: LocationCoordinate;
    };

    if (!origin || !destination) {
      return res.status(400).json({ error: 'Pickup and destination coordinates are required.' });
    }

    if (
      typeof origin.lat !== 'number' ||
      typeof origin.lng !== 'number' ||
      typeof destination.lat !== 'number' ||
      typeof destination.lng !== 'number'
    ) {
      return res.status(400).json({ error: 'Invalid latitude or longitude numbers.' });
    }

    // 1. Calculate route distance, duration and polyline
    const route = await computeRoute(origin, destination);

    // 2. Query Rapido, Uber, Ola, Namma Yatri, and BluSmart in parallel
    const [rapidoQuotes, uberQuotes, olaQuotes, nyQuotes, bluQuotes] = await Promise.all([
      rapidoAdapter.getQuotes(origin, destination, route).catch(err => {
        console.error('Rapido adapter error:', err);
        return [] as RideQuote[];
      }),
      uberAdapter.getQuotes(origin, destination, route).catch(err => {
        console.error('Uber adapter error:', err);
        return [] as RideQuote[];
      }),
      olaAdapter.getQuotes(origin, destination, route).catch(err => {
        console.error('Ola adapter error:', err);
        return [] as RideQuote[];
      }),
      nammaYatriAdapter.getQuotes(origin, destination, route).catch(err => {
        console.error('Namma Yatri adapter error:', err);
        return [] as RideQuote[];
      }),
      bluSmartAdapter.getQuotes(origin, destination, route).catch(err => {
        console.error('BluSmart adapter error:', err);
        return [] as RideQuote[];
      })
    ]);

    const allRides = [...rapidoQuotes, ...uberQuotes, ...olaQuotes, ...nyQuotes, ...bluQuotes];

    if (allRides.length === 0) {
      return res.status(404).json({
        error: 'No ride quotes available for this route.',
        route
      });
    }

    // 3. Compute 3 independent recommendations
    // 3a. Cheapest: minimum fare
    const cheapest = allRides.reduce((prev, curr) => {
      return curr.fareInr < prev.fareInr ? curr : prev;
    }, allRides[0]);

    // 3b. Fastest Pickup: shortest driver ETA
    const fastestPickup = allRides.reduce((prev, curr) => {
      return curr.pickupEtaMinutes < prev.pickupEtaMinutes ? curr : prev;
    }, allRides[0]);

    // 3c. Shortest Journey: quickest total trip time
    const shortestJourney = allRides.reduce((prev, curr) => {
      return curr.totalJourneyMinutes < prev.totalJourneyMinutes ? curr : prev;
    }, allRides[0]);

    const recommendations: RideRecommendation = {
      cheapest,
      fastestPickup,
      shortestJourney
    };

    const isDemoMode =
      !rapidoAdapter.isConfigured() ||
      !uberAdapter.isConfigured() ||
      !olaAdapter.isConfigured() ||
      !nammaYatriAdapter.isConfigured() ||
      !bluSmartAdapter.isConfigured();

    const notices: string[] = [];
    if (isDemoMode) {
      notices.push('Demo estimate — not a live fare.');
      notices.push('Calculated using verified Indian urban benchmark fare models (fuel, base fare, and per-km rates).');
      notices.push('Official API credentials can be connected in server environment to enable live driver dispatch.');
    }

    // Determine if current time in IST is peak rush hour
    const nowUtc = new Date();
    const istHours = (nowUtc.getUTCHours() + 5 + Math.floor((nowUtc.getUTCMinutes() + 30) / 60)) % 24;
    const isRushHour = (istHours >= 8 && istHours <= 11) || (istHours >= 17 && istHours <= 21);

    const responsePayload: ComparisonResponse = {
      route,
      origin,
      destination,
      rides: allRides,
      recommendations,
      isDemoMode,
      notices,
      rushHourActive: isRushHour,
      updatedAt: new Date().toISOString()
    };

    res.json(responsePayload);
  } catch (error: any) {
    console.error('Ride comparison error:', error);
    res.status(500).json({
      error: error.message || 'Internal server error while comparing rides.'
    });
  }
});

// n8n Chatbot Webhook Integration Proxy
const N8N_CHAT_WEBHOOK_URL =
  process.env.N8N_CHAT_WEBHOOK_URL ||
  'https://usharaniboddpalli.app.n8n.cloud/webhook/ad2848ba-569d-4430-b595-6f7090222fda/chat';

apiRouter.post('/chat', async (req, res) => {
  try {
    const { message, sessionId, webhookUrl } = req.body as {
      message: string;
      sessionId?: string;
      webhookUrl?: string;
    };

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message text is required.' });
    }

    const targetUrl = webhookUrl?.trim() || N8N_CHAT_WEBHOOK_URL;
    const session = sessionId || `user-${Date.now()}`;

    // Send payload matching n8n Chat Trigger / Webhook specification
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*'
      },
      signal: AbortSignal.timeout(35000),
      body: JSON.stringify({
        chatInput: message,
        message: message,
        action: 'sendMessage',
        sessionId: session
      })
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      return res.status(response.status).json({
        error: `n8n webhook error: ${response.statusText}`,
        details: errText
      });
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await response.json();
      const outputText = data.output || data.text || data.message || data.response || JSON.stringify(data);
      return res.json({
        output: outputText,
        sessionId: session,
        raw: data
      });
    } else {
      const text = await response.text();
      return res.json({
        output: text,
        sessionId: session
      });
    }
  } catch (error: any) {
    console.error('n8n chat proxy error:', error);
    res.status(500).json({
      error: error.message || 'Failed to communicate with n8n chat agent workflow.'
    });
  }
});

