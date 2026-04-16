import { useEffect, useRef, useState } from 'react';
import { Phone } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { brand } from '../brand';

/* Strip accents so "Montréal" → "montreal" */
function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

/* Returns the region key the backend expects, or null if not served.
   Home Depot brand serves Ottawa + Gatineau only — Montreal and BKC are not served. */
function cityToRegion(city: string): 'ottawa' | null {
  const c = normalize(city);
  if (brand.cities.ottawa.some(n => c.includes(n)) || brand.cities.gatineau.some(n => c.includes(n))) return 'ottawa';
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyWindow = Window & typeof globalThis & Record<string, any>;

interface Props {
  onConfirm: (region: 'ottawa', city: string, address: string, parts?: { stateCode: string; zip: string; address1: string }) => void;
}

export default function LocationGate({ onConfirm }: Props) {
  const { lang } = useLang();
  const inputRef = useRef<HTMLInputElement>(null);
  const autoRef  = useRef<google.maps.places.Autocomplete | null>(null);

  const [mapsReady, setMapsReady] = useState(false);
  const [city, setCity]           = useState('');
  const [address, setAddress]     = useState('');
  const [addressParts, setAddressParts] = useState<{ stateCode: string; zip: string; address1: string }>({ stateCode: '', zip: '', address1: '' });
  const [region, setRegion]       = useState<'ottawa' | '' | null>(null); // null = not checked, '' = not served
  const [inputVal, setInputVal]   = useState('');

  /* ── Wait for Google Maps (loaded via index.html script tag) ── */
  useEffect(() => {
    // Already loaded (cached on second visit)
    if ((window as AnyWindow).google?.maps?.places) {
      setMapsReady(true);
      return;
    }

    const apiKey = import.meta.env.VITE_PLACES_API_KEY as string | undefined;

    if (!apiKey) {
      // Key is injected via index.html — wait for its callback event
      const handler = () => setMapsReady(true);
      window.addEventListener('googleMapsLoaded', handler, { once: true });
      return () => window.removeEventListener('googleMapsLoaded', handler);
    }

    // Fallback: load script dynamically when env var is provided
    const cb = '__gmapsLoaded';
    (window as AnyWindow)[cb] = () => setMapsReady(true);

    const s = document.createElement('script');
    s.src   = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=${cb}`;
    s.async = true;
    s.defer = true;
    document.head.appendChild(s);

    return () => { delete (window as AnyWindow)[cb]; };
  }, []);

  /* ── Attach Autocomplete ── */
  useEffect(() => {
    if (!mapsReady || !inputRef.current || autoRef.current) return;

    autoRef.current = new google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: 'ca' },
      fields: ['address_components', 'formatted_address'],
      types: ['address'],
    });

    autoRef.current.addListener('place_changed', () => {
      const place = autoRef.current!.getPlace();
      if (!place.address_components) return;

      const formatted = place.formatted_address ?? inputRef.current?.value ?? '';
      const get = (type: string) =>
        place.address_components!.find(
          (c: google.maps.GeocoderAddressComponent) => c.types.includes(type)
        )?.long_name ?? '';
      const getShort = (type: string) =>
        place.address_components!.find(
          (c: google.maps.GeocoderAddressComponent) => c.types.includes(type)
        )?.short_name ?? '';

      const detectedCity =
        get('locality') ||
        get('administrative_area_level_3') ||
        get('administrative_area_level_2') || '';

      const stateCode = getShort('administrative_area_level_1');
      const zip = getShort('postal_code');
      const streetNumber = get('street_number');
      const route = get('route');
      const address1 = [streetNumber, route].filter(Boolean).join(' ') || formatted.split(',')[0].trim();

      // Fallback: parse from formatted address if components missing
      let finalCity = detectedCity;
      let finalState = stateCode;
      let finalZip = zip;
      if (!finalCity || !finalState || !finalZip) {
        const parts = formatted.split(',').map((s: string) => s.trim());
        if (!finalCity && parts.length >= 3) finalCity = parts[1] || '';
        if ((!finalState || !finalZip) && parts.length >= 3) {
          const match = (parts[2] || '').match(/^([A-Z]{2})\s+(.+)$/);
          if (match) {
            if (!finalState) finalState = match[1];
            if (!finalZip) finalZip = match[2];
          }
        }
      }

      const ids = cityToRegion(finalCity || detectedCity);
      setCity(finalCity || detectedCity);
      setAddress(formatted);
      setAddressParts({ stateCode: finalState, zip: finalZip, address1 });
      setRegion(ids ?? '');   // '' means not served
      setInputVal(formatted);
    });
  }, [mapsReady]);

  const canConfirm = region !== null && region !== '';
  const notServed  = region === '';

  const handleConfirm = () => {
    if (canConfirm) onConfirm(region!, city, address, addressParts);
  };

  return (
    <div className="flex-1 bg-white flex flex-col min-h-0">

      {/* ── Content ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center pb-16 min-h-0">

        {/* Truck illustration */}
        <div className="mb-6">
          <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <svg viewBox="0 0 80 60" className="w-20 h-16" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Truck body */}
              <rect x="2" y="20" width="46" height="26" rx="3" fill="#29B6F6"/>
              {/* Cab */}
              <path d="M48 28 L48 46 L70 46 L70 34 L62 28 Z" fill="#0288D1"/>
              {/* Cab window */}
              <path d="M52 30 L52 38 L66 38 L66 34 L60 30 Z" fill="#B3E5FC"/>
              {/* Wheels */}
              <circle cx="16" cy="47" r="6" fill="#37474F"/>
              <circle cx="16" cy="47" r="3" fill="#90A4AE"/>
              <circle cx="58" cy="47" r="6" fill="#37474F"/>
              <circle cx="58" cy="47" r="3" fill="#90A4AE"/>
              {/* Map pin */}
              <circle cx="55" cy="12" r="10" fill="#F44336"/>
              <path d="M55 5 C50.5 5 47 8.5 47 13 C47 18.5 55 24 55 24 C55 24 63 18.5 63 13 C63 8.5 59.5 5 55 5Z" fill="#E53935"/>
              <circle cx="55" cy="12" r="3" fill="white"/>
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {lang === 'en' ? 'Where are you?' : 'Où êtes-vous?'}
        </h1>
        <p className="text-sm text-orange-500 font-medium mb-6 max-w-xs leading-relaxed">
          {lang === 'en'
            ? 'Please enter your address to confirm service availability in your area.'
            : 'Veuillez entrer votre adresse pour confirmer la disponibilité du service.'}
        </p>

        {/* Input */}
        <div className="w-full max-w-sm">
          <label className="block text-left text-xs font-bold text-gray-600 mb-1 uppercase tracking-wide">
            {lang === 'en' ? 'Address *' : 'Adresse *'}
          </label>
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => {
              setInputVal(e.target.value);
              // Reset result if user clears/edits
              if (region !== null) { setRegion(null); setCity(''); setAddress(''); }
            }}
            placeholder={lang === 'en' ? 'Start typing your address…' : 'Commencez à saisir…'}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />

          {/* Not served message */}
          {notServed && (
            <p className="mt-2 text-xs text-red-500 font-medium">
              {lang === 'en'
                ? `Sorry, we don't service ${city || 'that area'} yet. We serve Ottawa & Gatineau.`
                : `Désolé, nous ne desservons pas encore ${city || 'cette région'}. Nous desservons Ottawa et Gatineau.`}
            </p>
          )}

          {/* Served confirmation */}
          {canConfirm && (
            <p className="mt-2 text-xs text-green-600 font-semibold">
              {lang === 'en' ? `✓ We service ${city}!` : `✓ Nous desservons ${city}!`}
            </p>
          )}
        </div>
      </div>

      {/* ── Sticky bottom bar ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-black shadow-2xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
          <a
            href={`tel:${brand.phoneDigits}`}
            className="flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <Phone className="w-4 h-4" />
            {lang === 'en' ? 'Emergency' : 'Urgence'}
          </a>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className={`px-8 py-2.5 sm:py-3 rounded-lg font-semibold text-sm transition-colors ${
              canConfirm
                ? 'bg-blue-600 hover:bg-blue-500 text-white'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            {lang === 'en' ? 'Confirm' : 'Confirmer'}
          </button>
        </div>
      </div>
    </div>
  );
}
