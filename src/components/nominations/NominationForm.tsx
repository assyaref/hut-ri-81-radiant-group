import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import type { Competition, NominationCategory } from '../../types/hutRi';
import api from '../../services/api';

export interface NominationPayload {
  competitionId: string;
  participantId: string | null;
  teamId: string | null;
  category: NominationCategory;
  position: number;
}

interface NominationFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: NominationPayload) => Promise<void>;
  competitions: Competition[];
}

interface EntityOption {
  key: string;
  label: string;
}

const categoryOptions: { value: NominationCategory; label: string }[] = [
  { value: 'JUARA_1', label: 'Juara 1' },
  { value: 'JUARA_2', label: 'Juara 2' },
  { value: 'JUARA_3', label: 'Juara 3' },
  { value: 'BEST_TEAM', label: 'Tim Terbaik' },
  { value: 'BEST_YEL_YEL', label: 'Yel-Yel Terbaik' },
];

function NominationForm({ open, onClose, onSubmit, competitions }: NominationFormProps) {
  const [competitionId, setCompetitionId] = useState('');
  const [entityKey, setEntityKey] = useState('');
  const [category, setCategory] = useState<NominationCategory>('JUARA_1');
  const [entities, setEntities] = useState<EntityOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCompetition = competitions.find((c) => c.id === competitionId);

  useEffect(() => {
    if (!open) return;
    setCompetitionId('');
    setEntityKey('');
    setCategory('JUARA_1');
    setEntities([]);
  }, [open]);

  useEffect(() => {
    if (!open || !competitionId) return;
    let active = true;
    (async () => {
      try {
        const [cpRes, teamsRes] = await Promise.all([
          api.getCompetitionParticipants(competitionId),
          api.getTeams(competitionId),
        ]);
        if (!active) return;
        const options: EntityOption[] = [];
        if (cpRes.success) {
          (Array.isArray(cpRes.data) ? cpRes.data : []).forEach((cp) => {
            options.push({ key: `participant:${cp.participantId}`, label: `👤 ${cp.participant?.name || cp.participantId}` });
          });
        }
        if (teamsRes.success) {
          (Array.isArray(teamsRes.data) ? teamsRes.data : []).forEach((t) => {
            options.push({ key: `team:${t.id}`, label: `👥 ${t.name}` });
          });
        }
        setEntities(options);
      } catch {
        if (active) setEntities([]);
      }
    })();
    return () => {
      active = false;
    };
  }, [open, competitionId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!competitionId || !entityKey) return;
    const [kind, id] = entityKey.split(':');
    const position =
      category === 'JUARA_1' ? 1 : category === 'JUARA_2' ? 2 : category === 'JUARA_3' ? 3 : 0;
    setIsSubmitting(true);
    try {
      await onSubmit({
        competitionId,
        participantId: kind === 'participant' ? id : null,
        teamId: kind === 'team' ? id : null,
        category,
        position,
      });
      onClose();
    } catch {
      /* handled by caller */
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} title="Tambah Nominasi" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="filter-label" htmlFor="nom-comp">Perlombaan</label>
          <select
            id="nom-comp"
            className="input-control"
            value={competitionId}
            onChange={(e) => {
              setCompetitionId(e.target.value);
              setEntityKey('');
            }}
          >
            <option value="">Pilih perlombaan…</option>
            {competitions.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="filter-label" htmlFor="nom-entity">Peserta / Tim</label>
          <select
            id="nom-entity"
            className="input-control"
            value={entityKey}
            onChange={(e) => setEntityKey(e.target.value)}
            disabled={!selectedCompetition}
          >
            <option value="">Pilih peserta / tim…</option>
            {entities.map((en) => (
              <option key={en.key} value={en.key}>{en.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="filter-label" htmlFor="nom-cat">Kategori</label>
          <select
            id="nom-cat"
            className="input-control"
            value={category}
            onChange={(e) => setCategory(e.target.value as NominationCategory)}
          >
            {categoryOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Batal</Button>
          <Button type="submit" disabled={isSubmitting || !entityKey}>
            {isSubmitting ? 'Menyimpan…' : 'Simpan'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default NominationForm;
