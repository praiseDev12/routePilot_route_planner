import { Search } from 'lucide-react';
import { useState } from 'react';
import { geocodeAddress } from '../api/client';
import type { PlaceResult } from '../types/route';

interface AddressSearchProps {
  label: string;
  placeholder: string;
  selected?: PlaceResult;
  onSelect: (place: PlaceResult) => void;
}

export function AddressSearch({
  label,
  placeholder,
  selected,
  onSelect,
}: AddressSearchProps) {
  const [query, setQuery] = useState(selected?.label || '');
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSearch() {
    if (!query.trim()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const places = await geocodeAddress(query.trim());
      setResults(places);
      if (places.length === 0) {
        setError('No matching addresses found.');
      }
    } catch (searchError) {
      setError(
        searchError instanceof Error
          ? searchError.message
          : 'Address search failed.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='space-y-2'>
      <label className='text-sm font-semibold text-slate-700'>{label}</label>
      <div className='flex gap-2'>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              void handleSearch();
            }
          }}
          className='min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15'
          placeholder={placeholder}
        />
        <button
          type='button'
          onClick={() => void handleSearch()}
          className='inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-black text-white shadow-sm transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60'
          disabled={loading}
          aria-label={`Search ${label}`}
          title={`Search ${label}`}
        >
          <Search size={18} />
        </button>
      </div>
      {error ? (
        <p className='text-xs font-medium text-red-600'>{error}</p>
      ) : null}
      {results.length > 0 ? (
        <div className='max-h-40 overflow-auto rounded-md border border-slate-200 bg-white shadow-sm'>
          {results.map((result) => (
            <button
              type='button'
              key={`${result.coordinates[0]}-${result.coordinates[1]}-${result.label}`}
              onClick={() => {
                onSelect(result);
                setQuery(result.label);
                setResults([]);
              }}
              className='block w-full border-b border-slate-100 px-3 py-2 text-left text-xs leading-5 text-slate-700 transition last:border-b-0 hover:bg-blue-50'
            >
              {result.label}
            </button>
          ))}
        </div>
      ) : null}
      {selected ? (
        <p className='line-clamp-2 text-xs text-slate-500'>
          Selected: {selected.label}
        </p>
      ) : null}
    </div>
  );
}
