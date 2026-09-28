export interface IndiaLocationSuggestion {
  name: string;
  address: string;
  city?: string;
  state?: string;
  lat: number;
  lng: number;
}

// Major cities across Indian states & union territories with preset landmarks
export const INDIA_MAJOR_CITIES: Record<
  string,
  { state: string; lat: number; lng: number; landmarks: Array<{ name: string; address: string; lat: number; lng: number }> }
> = {
  'Bengaluru': {
    state: 'Karnataka',
    lat: 12.9716,
    lng: 77.5946,
    landmarks: [
      { name: 'Indiranagar 100ft Road', address: '100 Feet Rd, HAL 2nd Stage, Indiranagar, Bengaluru', lat: 12.9719, lng: 77.6412 },
      { name: 'Koramangala 5th Block', address: 'Sony World Junction, Koramangala 5th Block, Bengaluru', lat: 12.9352, lng: 77.6245 },
      { name: 'Kempegowda Intl Airport (BLR)', address: 'BLR Airport Terminal 1, Devanahalli, Bengaluru', lat: 13.1986, lng: 77.7066 },
      { name: 'Whitefield ITPL', address: 'International Tech Park (ITPL), Whitefield, Bengaluru', lat: 12.9866, lng: 77.7381 },
      { name: 'HSR Layout Sector 2', address: '27th Main Rd, HSR Layout Sector 2, Bengaluru', lat: 12.9116, lng: 77.6534 },
      { name: 'Electronic City Phase 1', address: 'Hosur Road, Electronic City, Bengaluru', lat: 12.8399, lng: 77.6770 },
      { name: 'MG Road Metro Station', address: 'MG Road, Shivaji Nagar, Bengaluru', lat: 12.9756, lng: 77.6066 }
    ]
  },
  'Delhi NCR': {
    state: 'Delhi / Haryana / UP',
    lat: 28.6139,
    lng: 77.2090,
    landmarks: [
      { name: 'Connaught Place Inner Circle', address: 'Connaught Place, New Delhi', lat: 28.6315, lng: 77.2167 },
      { name: 'DLF Cyber Hub Gurgaon', address: 'Cyber City, Phase 2, Gurugram, Haryana', lat: 28.4950, lng: 77.0895 },
      { name: 'Indira Gandhi Intl Airport (IGI T3)', address: 'Terminal 3, IGI Airport, New Delhi', lat: 28.5562, lng: 77.1000 },
      { name: 'Hauz Khas Village', address: 'Deer Park, Hauz Khas, New Delhi', lat: 28.5535, lng: 77.1945 },
      { name: 'Sector 18 Noida (Atta Market)', address: 'Sector 18, Noida, Uttar Pradesh', lat: 28.5708, lng: 77.3271 },
      { name: 'Saket Select Citywalk', address: 'District Centre, Saket, New Delhi', lat: 28.5284, lng: 77.2193 }
    ]
  },
  'Mumbai': {
    state: 'Maharashtra',
    lat: 19.0760,
    lng: 72.8777,
    landmarks: [
      { name: 'Bandra West (Linking Road)', address: 'Linking Road, Bandra West, Mumbai', lat: 19.0600, lng: 72.8360 },
      { name: 'Bandra Kurla Complex (BKC)', address: 'G Block, BKC, Bandra East, Mumbai', lat: 19.0673, lng: 72.8687 },
      { name: 'Chhatrapati Shivaji Maharaj Airport (T2)', address: 'Sahar, Andheri East, Mumbai', lat: 19.0896, lng: 72.8656 },
      { name: 'Churchgate Railway Station', address: 'Churchgate, Fort, Mumbai', lat: 18.9322, lng: 72.8264 },
      { name: 'Powai (Hiranandani Gardens)', address: 'Hiranandani Gardens, Powai, Mumbai', lat: 19.1197, lng: 72.9051 },
      { name: 'Andheri West Lokhandwala', address: 'Lokhandwala Complex, Andheri West, Mumbai', lat: 19.1415, lng: 72.8286 }
    ]
  },
  'Hyderabad': {
    state: 'Telangana',
    lat: 17.3850,
    lng: 78.4867,
    landmarks: [
      { name: 'Hitec City (Cyber Towers)', address: 'HITEC City, Madhapur, Hyderabad', lat: 17.4504, lng: 78.3808 },
      { name: 'Gachibowli Stadium', address: 'Old Mumbai Highway, Gachibowli, Hyderabad', lat: 17.4443, lng: 78.3498 },
      { name: 'Rajiv Gandhi Intl Airport (RGIA)', address: 'Shamshabad, Hyderabad', lat: 17.2403, lng: 78.4294 },
      { name: 'Jubilee Hills Check Post', address: 'Road No. 36, Jubilee Hills, Hyderabad', lat: 17.4326, lng: 78.4071 },
      { name: 'Charminar Old City', address: 'Char Kaman, Ghansi Bazaar, Hyderabad', lat: 17.3616, lng: 78.4747 },
      { name: 'Secunderabad Railway Station', address: 'Station Rd, Regimental Bazaar, Secunderabad', lat: 17.4344, lng: 78.5015 }
    ]
  },
  'Pune': {
    state: 'Maharashtra',
    lat: 18.5204,
    lng: 73.8567,
    landmarks: [
      { name: 'Koregaon Park (North Main Rd)', address: 'Koregaon Park, Pune', lat: 18.5362, lng: 73.8940 },
      { name: 'Hinjawadi Phase 1 IT Park', address: 'Rajiv Gandhi Infotech Park, Hinjawadi, Pune', lat: 18.5913, lng: 73.7389 },
      { name: 'Viman Nagar (Phoenix Marketcity)', address: 'Viman Nagar, Pune', lat: 18.5621, lng: 73.9167 },
      { name: 'Pune Railway Station', address: 'Agarkar Nagar, Pune', lat: 18.5284, lng: 73.8744 },
      { name: 'Baner (High Street)', address: 'Baner Road, Baner, Pune', lat: 18.5590, lng: 73.7868 }
    ]
  },
  'Chennai': {
    state: 'Tamil Nadu',
    lat: 13.0827,
    lng: 80.2707,
    landmarks: [
      { name: 'T. Nagar (Panagal Park)', address: 'Prakasam Rd, T. Nagar, Chennai', lat: 13.0418, lng: 80.2341 },
      { name: 'OMR Sholinganallur Junction', address: 'Old Mahabalipuram Rd, Sholinganallur, Chennai', lat: 12.9010, lng: 80.2279 },
      { name: 'Chennai International Airport (MAA)', address: 'GST Road, Meenambakkam, Chennai', lat: 12.9941, lng: 80.1709 },
      { name: 'Marina Beach Light House', address: 'Kamarajar Salai, Mylapore, Chennai', lat: 13.0390, lng: 80.2785 },
      { name: 'Velachery Phoenix Marketcity', address: 'Velachery Main Rd, Chennai', lat: 12.9916, lng: 80.2170 }
    ]
  },
  'Kolkata': {
    state: 'West Bengal',
    lat: 22.5726,
    lng: 88.3639,
    landmarks: [
      { name: 'Park Street (Flurys)', address: 'Park Street, Kolkata', lat: 22.5535, lng: 88.3524 },
      { name: 'Salt Lake Sector V', address: 'Bidhannagar, Salt Lake Sector V, Kolkata', lat: 22.5804, lng: 88.4378 },
      { name: 'Netaji Subhash Chandra Bose Airport (CCU)', address: 'Dum Dum, Kolkata', lat: 22.6547, lng: 88.4467 },
      { name: 'Howrah Railway Station', address: 'Howrah, West Bengal', lat: 22.5839, lng: 88.3426 },
      { name: 'New Town Action Area 1', address: 'New Town, Rajarhat, Kolkata', lat: 22.5867, lng: 88.4699 }
    ]
  },
  'Ahmedabad': {
    state: 'Gujarat',
    lat: 23.0225,
    lng: 72.5714,
    landmarks: [
      { name: 'SG Highway (Prahlad Nagar)', address: 'Prahlad Nagar, SG Highway, Ahmedabad', lat: 23.0125, lng: 72.5108 },
      { name: 'Sardar Vallabhbhai Patel Airport (AMD)', address: 'Hansol, Ahmedabad', lat: 23.0772, lng: 72.6347 },
      { name: 'Sabarmati Riverfront', address: 'Riverfront Rd, Navrangpura, Ahmedabad', lat: 23.0333, lng: 72.5750 },
      { name: 'Vastrapur (IIM Ahmedabad)', address: 'Vastrapur, Ahmedabad', lat: 23.0305, lng: 72.5310 }
    ]
  },
  'Jaipur': {
    state: 'Rajasthan',
    lat: 26.9124,
    lng: 75.7873,
    landmarks: [
      { name: 'C-Scheme (MI Road)', address: 'MI Road, C-Scheme, Jaipur', lat: 26.9157, lng: 75.8038 },
      { name: 'Malviya Nagar (WTP Mall)', address: 'JLN Marg, Malviya Nagar, Jaipur', lat: 26.8530, lng: 75.8052 },
      { name: 'Jaipur International Airport (JAI)', address: 'Sanganer, Jaipur', lat: 26.8289, lng: 75.8056 },
      { name: 'Vaishali Nagar', address: 'Amrapali Marg, Vaishali Nagar, Jaipur', lat: 26.9030, lng: 75.7420 }
    ]
  },
  'Kochi': {
    state: 'Kerala',
    lat: 9.9312,
    lng: 76.2673,
    landmarks: [
      { name: 'MG Road (Ernakulam South)', address: 'MG Road, Ernakulam, Kochi', lat: 9.9678, lng: 76.2847 },
      { name: 'Kakkanad (Infopark Phase 1)', address: 'Infopark, Kakkanad, Kochi', lat: 10.0104, lng: 76.3638 },
      { name: 'Cochin International Airport (COK)', address: 'Nedumbassery, Kochi', lat: 10.1518, lng: 76.3930 },
      { name: 'Lulu Mall Edappally', address: 'NH 544, Edappally, Kochi', lat: 10.0279, lng: 76.3082 }
    ]
  },
  'Chandigarh': {
    state: 'Punjab / Haryana',
    lat: 30.7333,
    lng: 76.7794,
    landmarks: [
      { name: 'Sector 17 Plaza', address: 'Sector 17, Chandigarh', lat: 30.7398, lng: 76.7827 },
      { name: 'Sector 35 Market', address: 'Sector 35-C, Chandigarh', lat: 30.7228, lng: 76.7644 },
      { name: 'Chandigarh International Airport (IXC)', address: 'Mohali, Chandigarh', lat: 30.6735, lng: 76.7885 },
      { name: 'IT Park Kishangarh', address: 'Rajiv Gandhi Chandigarh Technology Park', lat: 30.7240, lng: 76.8436 }
    ]
  },
  'Lucknow': {
    state: 'Uttar Pradesh',
    lat: 26.8467,
    lng: 80.9462,
    landmarks: [
      { name: 'Hazratganj Market', address: 'Hazratganj, Lucknow', lat: 26.8526, lng: 80.9443 },
      { name: 'Gomti Nagar (Patrakarpuram)', address: 'Vipin Khand, Gomti Nagar, Lucknow', lat: 26.8504, lng: 81.0022 },
      { name: 'Chaudhary Charan Singh Airport (LKO)', address: 'Amausi, Lucknow', lat: 26.7606, lng: 80.8893 },
      { name: 'Charbagh Railway Station', address: 'Charbagh, Lucknow', lat: 26.8317, lng: 80.9198 }
    ]
  },
  'Indore': {
    state: 'Madhya Pradesh',
    lat: 22.7196,
    lng: 75.8577,
    landmarks: [
      { name: 'Vijay Nagar (C21 Mall)', address: 'Vijay Nagar Square, AB Road, Indore', lat: 22.7533, lng: 75.8937 },
      { name: 'Rajwada Palace Square', address: 'MG Road, Rajwada, Indore', lat: 22.7186, lng: 75.8550 },
      { name: 'Devi Ahilyabai Holkar Airport (IDR)', address: 'Depalpur Road, Indore', lat: 22.7217, lng: 75.8011 },
      { name: 'Palasia (Chappan Dukan)', address: 'New Palasia, Indore', lat: 22.7244, lng: 75.8839 }
    ]
  },
  'Surat': {
    state: 'Gujarat',
    lat: 21.1702,
    lng: 72.8311,
    landmarks: [
      { name: 'Vesu (VR Mall Surat)', address: 'Dumas Road, Vesu, Surat', lat: 21.1444, lng: 72.7744 },
      { name: 'Ring Road Textile Market', address: 'Ring Road, Surat', lat: 21.1895, lng: 72.8465 },
      { name: 'Surat International Airport (STV)', address: 'Dumas Road, Surat', lat: 21.1139, lng: 72.7419 }
    ]
  },
  'Visakhapatnam': {
    state: 'Andhra Pradesh',
    lat: 17.6868,
    lng: 83.2185,
    landmarks: [
      { name: 'Siripuram Junction', address: 'Siripuram, Visakhapatnam', lat: 17.7215, lng: 83.3150 },
      { name: 'RK Beach (Submarine Museum)', address: 'Beach Road, Pandurangapuram, Visakhapatnam', lat: 17.7164, lng: 83.3323 },
      { name: 'Visakhapatnam Airport (VTZ)', address: 'NAD Junction, Visakhapatnam', lat: 17.7215, lng: 83.2245 },
      { name: 'Gajuwaka Junction', address: 'Gajuwaka, Visakhapatnam', lat: 17.6896, lng: 83.2088 }
    ]
  },
  'Coimbatore': {
    state: 'Tamil Nadu',
    lat: 11.0168,
    lng: 76.9558,
    landmarks: [
      { name: 'RS Puram (DB Road)', address: 'DB Road, RS Puram, Coimbatore', lat: 11.0093, lng: 76.9497 },
      { name: 'Gandhipuram Bus Stand', address: 'Gandhipuram, Coimbatore', lat: 11.0168, lng: 76.9674 },
      { name: 'Coimbatore Intl Airport (CJB)', address: 'Peelamedu, Coimbatore', lat: 11.0298, lng: 77.0434 },
      { name: 'Saravanampatti (Tidel Park)', address: 'Sathy Road, Saravanampatti, Coimbatore', lat: 11.0827, lng: 76.9964 }
    ]
  },
  'Goa': {
    state: 'Goa',
    lat: 15.2993,
    lng: 74.1240,
    landmarks: [
      { name: 'Panaji Miramar Beach', address: 'Miramar, Panaji, Goa', lat: 15.4842, lng: 73.8118 },
      { name: 'Calangute Beach Circle', address: 'Calangute, North Goa', lat: 15.5439, lng: 73.7553 },
      { name: 'Dabolim Airport (GOI)', address: 'Dabolim, Vasco da Gama, Goa', lat: 15.3800, lng: 73.8313 },
      { name: 'Manohar Intl Airport Mopa (GOX)', address: 'Mopa, Pernem, North Goa', lat: 15.7486, lng: 73.8647 }
    ]
  },
  'Bhopal': {
    state: 'Madhya Pradesh',
    lat: 23.2599,
    lng: 77.4126,
    landmarks: [
      { name: 'MP Nagar Zone 1', address: 'Maharana Pratap Nagar, Bhopal', lat: 23.2332, lng: 77.4344 },
      { name: 'New Market (TT Nagar)', address: 'TT Nagar, Bhopal', lat: 23.2376, lng: 77.4011 },
      { name: 'Raja Bhoj Airport (BHO)', address: 'Gandhi Nagar, Bhopal', lat: 23.2875, lng: 77.3378 }
    ]
  },
  'Patna': {
    state: 'Bihar',
    lat: 25.5941,
    lng: 85.1376,
    landmarks: [
      { name: 'Dak Bunglow Chauraha', address: 'Fraser Road, Patna', lat: 25.6093, lng: 85.1376 },
      { name: 'Boring Road Crossing', address: 'Boring Road, Patna', lat: 25.6175, lng: 85.1147 },
      { name: 'Jay Prakash Narayan Airport (PAT)', address: 'Shaikhpura, Patna', lat: 25.5913, lng: 85.0880 }
    ]
  },
  'Bhubaneswar': {
    state: 'Odisha',
    lat: 20.2961,
    lng: 85.8245,
    landmarks: [
      { name: 'Saheed Nagar (Janpath)', address: 'Janpath, Saheed Nagar, Bhubaneswar', lat: 20.2882, lng: 85.8427 },
      { name: 'Patia (Infocity)', address: 'Chandaka Industrial Estate, Patia, Bhubaneswar', lat: 20.3541, lng: 85.8197 },
      { name: 'Biju Patnaik Airport (BBI)', address: 'Aerodrome Area, Bhubaneswar', lat: 20.2525, lng: 85.8178 }
    ]
  }
};

/**
 * Searches for any location across India.
 * Priority:
 * 1. Checks matching presets / major landmarks in India.
 * 2. Queries OpenStreetMap / Photon India geocoder for real street/locality accuracy.
 */
export async function searchIndiaLocation(
  query: string,
  preferredCity?: string
): Promise<IndiaLocationSuggestion[]> {
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];

  const results: IndiaLocationSuggestion[] = [];

  // 1. Search local landmark index first (instant)
  const queryLower = cleanQuery.toLowerCase();
  for (const [cityName, cityData] of Object.entries(INDIA_MAJOR_CITIES)) {
    // If preferredCity is specified, bias ranking towards it
    const isPreferred = preferredCity && cityName.toLowerCase() === preferredCity.toLowerCase();

    for (const lm of cityData.landmarks) {
      if (
        lm.name.toLowerCase().includes(queryLower) ||
        lm.address.toLowerCase().includes(queryLower) ||
        cityName.toLowerCase().includes(queryLower)
      ) {
        results.push({
          name: lm.name,
          address: lm.address,
          city: cityName,
          state: cityData.state,
          lat: lm.lat,
          lng: lm.lng
        });
      }
    }
  }

  // If local search found good matches and query is short, return them promptly
  if (results.length >= 3 && cleanQuery.length <= 4) {
    return results.slice(0, 5);
  }

  // 2. Query Photon / OpenStreetMap geocoder for granular street, locality & village names across India
  try {
    const searchTarget = encodeURIComponent(`${cleanQuery}, India`);
    const response = await fetch(
      `https://photon.komoot.io/api/?q=${searchTarget}&lat=20.5937&lon=78.9629&limit=5`
    );

    if (response.ok) {
      const data = await response.json();
      if (data.features && Array.isArray(data.features)) {
        for (const f of data.features) {
          const props = f.properties || {};
          const country = (props.country || '').toLowerCase();
          // Filter strictly for India
          if (country === 'india' || country === 'in' || !props.country) {
            const coords = f.geometry?.coordinates;
            if (coords && coords.length >= 2) {
              const lng = coords[0];
              const lat = coords[1];
              const name = props.name || props.street || cleanQuery;
              const parts = [
                props.name,
                props.street,
                props.district || props.city || props.county,
                props.state,
                props.postcode
              ].filter(Boolean);

              const formattedAddress = parts.length > 0 ? parts.join(', ') : `${name}, India`;

              // Avoid duplicates
              const alreadyExists = results.some(
                r => Math.abs(r.lat - lat) < 0.001 && Math.abs(r.lng - lng) < 0.001
              );

              if (!alreadyExists) {
                results.push({
                  name,
                  address: formattedAddress,
                  city: props.city || props.district,
                  state: props.state,
                  lat,
                  lng
                });
              }
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn('Online geocoding lookup failed, relying on index:', err);
  }

  // 3. Fallback: If no results found, resolve query to the closest city or India central coordinates
  if (results.length === 0) {
    const defaultCity = (preferredCity && INDIA_MAJOR_CITIES[preferredCity]) || INDIA_MAJOR_CITIES['Bengaluru'];
    results.push({
      name: cleanQuery,
      address: `${cleanQuery}, India`,
      lat: defaultCity.lat,
      lng: defaultCity.lng
    });
  }

  return results.slice(0, 6);
}

/**
 * Reverse geocode any latitude and longitude in India to a readable street/area address
 */
export async function reverseGeocodeIndiaLocation(
  lat: number,
  lng: number
): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    if (response.ok) {
      const data = await response.json();
      if (data.display_name) {
        const parts = data.display_name.split(', ');
        return parts.slice(0, 4).join(', ');
      }
    }
  } catch {
    // Fallback to coordinates
  }
  return `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
}
