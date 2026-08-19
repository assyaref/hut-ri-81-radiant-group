import type { Competition } from '../../types/hutRi';

interface LeaderboardFiltersProps {
  competitions: Competition[];
  selected: string;
  onSelect: (id: string) => void;
}

function LeaderboardFilters({ competitions, selected, onSelect }: LeaderboardFiltersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="filter-label" htmlFor="lb-filter">Perlombaan</label>
        <select
          id="lb-filter"
          className="input-control"
          value={selected}
          onChange={(e) => onSelect(e.target.value)}
        >
          <option value="">Semua Perlombaan</option>
          {competitions.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default LeaderboardFilters;
