import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import type { Competition, CompetitionType, ScoringMethod } from '../../types/hutRi';

interface CompetitionFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Competition, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  editingCompetition?: Competition | null;
}

interface CompetitionFormData {
  title: string;
  type: CompetitionType;
  description: string;
  maxParticipants: number;
  maxGroupSize: number;
  scoringMethod: ScoringMethod;
  startTime: string;
  endTime: string;
}

const emptyForm = (): CompetitionFormData => ({
  title: '',
  type: 'INDIVIDUAL',
  description: '',
  maxParticipants: 100,
  maxGroupSize: 5,
  scoringMethod: 'SCORE',
  startTime: new Date().toISOString().slice(0, 16),
  endTime: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
});

function CompetitionForm({ open, onClose, onSubmit, editingCompetition }: CompetitionFormProps) {
  const [formData, setFormData] = useState<CompetitionFormData>(emptyForm());
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editingCompetition) {
      setFormData({
        title: editingCompetition.title,
        type: editingCompetition.type,
        description: editingCompetition.description,
        maxParticipants: editingCompetition.maxParticipants,
        maxGroupSize: editingCompetition.maxGroupSize,
        scoringMethod: editingCompetition.scoringMethod,
        startTime: (editingCompetition.startTime || '').slice(0, 16),
        endTime: (editingCompetition.endTime || '').slice(0, 16),
      });
    } else {
      setFormData(emptyForm());
    }
  }, [open, editingCompetition]);

  const set = <K extends keyof CompetitionFormData>(key: K, value: CompetitionFormData[K]) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        status: 'DRAFT',
        maxParticipants: Math.max(1, Number(formData.maxParticipants) || 1),
        maxGroupSize: Math.max(1, Number(formData.maxGroupSize) || 1),
      });
      onClose();
    } catch {
      /* handled by caller */
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      title={editingCompetition ? 'Edit Perlombaan' : 'Tambah Perlombaan'}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="filter-label" htmlFor="comp-title">Nama Perlombaan</label>
          <input
            id="comp-title"
            className="input-control"
            type="text"
            required
            value={formData.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="Masukkan nama perlombaan"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="filter-label" htmlFor="comp-type">Tipe</label>
            <select
              id="comp-type"
              className="input-control"
              value={formData.type}
              onChange={(e) => set('type', e.target.value as CompetitionType)}
            >
              <option value="INDIVIDUAL">Individu</option>
              <option value="GROUP">Kelompok</option>
              <option value="BOTH">Keduanya</option>
            </select>
          </div>
          <div>
            <label className="filter-label" htmlFor="comp-method">Metode Scoring</label>
            <select
              id="comp-method"
              className="input-control"
              value={formData.scoringMethod}
              onChange={(e) => set('scoringMethod', e.target.value as ScoringMethod)}
            >
              <option value="SCORE">Point (Skor)</option>
              <option value="RANK">Peringkat</option>
              <option value="TIME">Waktu</option>
            </select>
          </div>
        </div>

        <div>
          <label className="filter-label" htmlFor="comp-desc">Deskripsi</label>
          <textarea
            id="comp-desc"
            className="input-control"
            value={formData.description}
            onChange={(e) => set('description', e.target.value)}
            rows={3}
            placeholder="Deskripsi perlombaan…"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="filter-label" htmlFor="comp-maxp">Maks. Peserta</label>
            <input
              id="comp-maxp"
              className="input-control"
              type="number"
              min="1"
              value={formData.maxParticipants}
              onChange={(e) => set('maxParticipants', Number(e.target.value))}
            />
          </div>
          <div>
            <label className="filter-label" htmlFor="comp-maxg">Maks. Anggota Tim</label>
            <input
              id="comp-maxg"
              className="input-control"
              type="number"
              min="1"
              value={formData.maxGroupSize}
              onChange={(e) => set('maxGroupSize', Number(e.target.value))}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="filter-label" htmlFor="comp-start">Waktu Mulai</label>
            <input
              id="comp-start"
              className="input-control"
              type="datetime-local"
              value={formData.startTime}
              onChange={(e) => set('startTime', e.target.value)}
            />
          </div>
          <div>
            <label className="filter-label" htmlFor="comp-end">Waktu Selesai</label>
            <input
              id="comp-end"
              className="input-control"
              type="datetime-local"
              value={formData.endTime}
              onChange={(e) => set('endTime', e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan…' : editingCompetition ? 'Update' : 'Tambah'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default CompetitionForm;