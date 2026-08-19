import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import type { Team } from '../../types/hutRi';

interface TeamFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; department: string }) => Promise<void>;
  editingTeam?: Team | null;
}

function TeamForm({ open, onClose, onSubmit, editingTeam }: TeamFormProps) {
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(editingTeam?.name || '');
    setDepartment(editingTeam?.department || '');
  }, [open, editingTeam]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({ name, department });
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
      title={editingTeam ? 'Edit Tim' : 'Tambah Tim'}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="filter-label" htmlFor="team-name">Nama Tim</label>
          <input
            id="team-name"
            className="input-control"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama tim"
          />
        </div>
        <div>
          <label className="filter-label" htmlFor="team-dept">Departemen</label>
          <input
            id="team-dept"
            className="input-control"
            type="text"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="Departemen"
          />
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>Batal</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan…' : editingTeam ? 'Update' : 'Tambah'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default TeamForm;
