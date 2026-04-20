import type { BrandConfig } from './types';

const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

/**
 * Home Depot branded booking flow (operated by 1 Clean Air).
 * TODO: swap logo, phone, privacy URL, service-area cities before launch.
 */
export const brandHdx1ca: BrandConfig = {
  id: 'hdx1ca',
  name: 'Home Depot Home Services',
  logo: '/homedepot-logo.png',
  pageTitle: 'Home Depot Home Services Booking',
  phoneDigits: '6133664260',
  phoneDisplay: '613-366-4260',
  privacyUrl: 'https://www.homedepot.ca/privacy-policy',

  cities: {
    ottawa: [
      'ottawa',
      'arnprior', 'carleton place', 'smiths falls', 'perth',
      'kemptville', 'manotick', 'embrun', 'russell', 'casselman',
      'rockland', 'clarence-rockland',
    ].map(normalize),

    bkc: [
      'kingston', 'bath', 'amherstview', 'loyalist', 'sydenham',
      'verona', 'harrowsmith', 'odessa', 'westport',
      'brockville', 'prescott', 'cardinal', 'iroquois',
      'mallorytown', 'lansdowne', 'athens', 'delta',
      'cornwall', 'long sault', 'ingleside', 'lancaster',
      'williamstown', 'alexandria', 'chesterville', 'winchester',
      'south stormont', 'south dundas', 'north dundas',
      'gananoque', 'napanee', 'greater napanee', 'morrisburg',
      'south glengarry', 'north glengarry',
    ].map(normalize),

    gatineau: [
      'gatineau', 'hull', 'aylmer', 'buckingham', 'chelsea',
      'wakefield', 'cantley', 'pontiac', 'la peche',
    ].map(normalize),

    montreal: [
      'montreal',
      'laval', 'terrebonne', 'repentigny', 'blainville', 'boisbriand',
      'saint-eustache', 'mirabel', 'deux-montagnes', 'sainte-therese',
      'rosemere', 'mascouche', 'lachenaie', 'saint-jerome',
      'vaudreuil-dorion', 'pointe-claire', 'dorval', 'beaconsfield', 'kirkland',
      'brossard', 'longueuil', 'saint-jean-sur-richelieu', 'chambly',
      'saint-lambert', 'laprairie',
    ].map(normalize),
  },

  hiddenCategoriesByRegion: {
    montreal: ['carpet'],
    bkc: ['carpet'],
  },
};
