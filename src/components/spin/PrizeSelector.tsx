import type { Prize } from '../../types/hutRi';
import Badge from '../ui/Badge';

interface PrizeSelectorProps {
  prizes: Prize[];
  selectedId: string;
  onSelect: (id: string) => void;
  disabled: boolean;
}

function PrizeSelector({ prizes, selectedId, onSelect, disabled }: PrizeSelectorProps) {
  const availablePrizes = prizes.filter((p) => p.available > 0);
  return (
    <div>
      <label className="filter-label" htmlFor="prize-select">Pilih Hadiah</label>
      <div className="flex gap-3 items-center">
        <select
          id="prize-select"
          className="input-control flex-1"
          value={selectedId}
          disabled={disabled}
          onChange={(e) => onSelect(e.target.value)}
        >
          <option value="">— Pilih hadiah —</option>
          {availablePrizes.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} (sisa {p.available})
            </option>
          ))}
        </select>
      </div>
      {selectedId && (() => {
        const selected = prizes.find((p) => p.id === selectedId);
        if (!selected) return null;
        return (
          <div className="mt-2 flex gap-2 flex-wrap">
            <Badge variant="gold">{selected.name}</Badge>
            <Badge variant="success">Tersisa {selected.available}</Badge>
          </div>
        );
      })()}
    </div>
  );
}

export default PrizeSelector;