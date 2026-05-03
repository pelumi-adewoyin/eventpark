import { Link } from 'react-router-dom';

// The EventPark mark — 4 interlocking petal loops forming a clover
export function EventParkMark({ size = 32, light = false }) {
  const color = light ? '#FFFFFF' : '#0A0D3B';
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M50 50
          C50 50 50 22 28 22
          C14 22 8 32 8 40
          C8 50 16 58 28 58
          C28 58 8 58 8 72
          C8 84 18 92 28 92
          C42 92 50 78 50 78
          C50 78 58 92 72 92
          C82 92 92 84 92 72
          C92 58 72 58 72 58
          C84 58 92 50 92 40
          C92 32 86 22 72 22
          C50 22 50 50 50 50Z"
        fill={color}
        opacity="0.15"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M50 44C50 44 50 20 28 20C14 20 6 30 6 40C6 52 16 60 28 60C16 60 6 68 6 80C6 90 14 100 28 100C40 100 50 90 50 78C50 90 60 100 72 100C86 100 94 90 94 80C94 68 84 60 72 60C84 60 94 52 94 40C94 30 86 20 72 20C50 20 50 44 50 44ZM50 56C50 56 50 80 28 80C19 80 18 72 18 70C18 64 22 60 28 60C34 60 38 56 38 50C38 44 34 40 28 40C22 40 18 36 18 30C18 28 19 20 28 20C50 20 50 44 50 44C50 44 50 20 72 20C81 20 82 28 82 30C82 36 78 40 72 40C66 40 62 44 62 50C62 56 66 60 72 60C78 60 82 64 82 70C82 72 81 80 72 80C50 80 50 56 50 56Z"
        fill={color}
      />
    </svg>
  );
}

export function EventParkLogo({ light = false, size = 'md' }) {
  const sizes = { sm: 24, md: 32, lg: 40 };
  const textSizes = { sm: 'text-lg', md: 'text-xl', lg: 'text-2xl' };
  const textColor = light ? 'text-white' : 'text-ep-navy';
  const accentColor = light ? 'text-brand-300' : 'text-brand-600';

  return (
    <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
      <EventParkMark size={sizes[size]} light={light} />
      <span className={`${textSizes[size]} font-extrabold tracking-tight ${textColor}`}>
        Event<span className={accentColor}>park</span>
      </span>
    </Link>
  );
}
