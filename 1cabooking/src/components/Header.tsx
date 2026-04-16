import { useLang } from '../context/LanguageContext';
import { brand } from '../brand';

export default function Header() {
  const { lang, setLang } = useLang();

  return (
    <header className="bg-black shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <img
            src={brand.logo}
            alt={brand.name}
            className="h-14 sm:h-16 w-auto object-contain"
          />
        </div>

        {/* Language Toggle */}
        <div className="flex items-center border border-slate-600 rounded-lg overflow-hidden text-xs sm:text-sm font-semibold">
          <button
            onClick={() => setLang('en')}
            className={`px-3 sm:px-4 py-2 transition-colors ${
              lang === 'en'
                ? 'bg-blue-600 text-white'
                : 'bg-transparent text-slate-300 hover:bg-slate-800'
            }`}
          >
            EN
          </button>
          <div className="w-px h-5 bg-slate-600" />
          <button
            onClick={() => setLang('fr')}
            className={`px-3 sm:px-4 py-2 transition-colors ${
              lang === 'fr'
                ? 'bg-blue-600 text-white'
                : 'bg-transparent text-slate-300 hover:bg-slate-800'
            }`}
          >
            FR
          </button>
        </div>
      </div>
    </header>
  );
}
