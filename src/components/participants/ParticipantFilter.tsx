interface ParticipantFilterProps {
  onSearch: (q: string) => void;
  onDepartment: (department: string) => void;
  onStatus: (status: string) => void;
  departments: string[];
  statusValue: string;
  query: string;
}

function ParticipantFilter({
  onSearch,
  onDepartment,
  onStatus,
  departments,
  statusValue,
  query,
}: ParticipantFilterProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="filter-label" htmlFor="p-search">Cari Nama / Kode</label>
        <input
          id="p-search"
          type="text"
          value={query}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Nama atau kode unik…"
          className="input-control"
          aria-label="Cari peserta"
        />
      </div>
      <div>
        <label className="filter-label" htmlFor="p-dept">Departemen</label>
        <select
          id="p-dept"
          value=""
          onChange={(e) => onDepartment(e.target.value)}
          className="input-control"
          aria-label="Filter departemen"
        >
          <option value="" disabled>Pilih departemen…</option>
          {departments.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="filter-label" htmlFor="p-status">Status</label>
        <select
          id="p-status"
          value={statusValue}
          onChange={(e) => onStatus(e.target.value)}
          className="input-control"
          aria-label="Filter status"
        >
          <option value="">Semua Status</option>
          <option value="REGISTERED">Registered</option>
          <option value="CHECKED_IN">Check-in</option>
        </select>
      </div>
    </div>
  );
}

export default ParticipantFilter;