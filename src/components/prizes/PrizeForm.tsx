import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import type { Prize } from '../../types/hutRi';

interface PrizeFormProps {
  open: boolean;
  initial: Prize | null;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description: string; quantity: number }) => void;
}

interface FormState {
  name: string;
  description: string;
  quantity: string;
}

function PrizeForm({ open, initial, isSaving, onClose, onSubmit }: PrizeFormProps) {
  const [form, setForm] = useState<FormState>({ name: '', description: '', quantity: '1' });

  useEffect(() => {
    if (open) {
      setForm({
        name: initial?.name || '',
        description: initial?.description || '',
        quantity: String(initial?.quantity || 1),
      });
    }
  }, [open, initial]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: form.name.trim(),
      description: form.description.trim(),
      quantity: Math.max(1, Math.floor(Number(form.quantity) || 1)),
    });
  };

  return (
    <Modal
      open={open}
      title={initial ? 'Edit Hadiah' : 'Tambah Hadiah'}
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>Batal</Button>
          <Button type="submit" form="prize-form" disabled={isSaving}>
            {isSaving ? 'Menyimpan…' : 'Simpan'}
          </Button>
        </>
      }
    >
      <form id="prize-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="filter-label" htmlFor="prize-name">Nama Hadiah</label>
          <input
            id="prize-name"
            className="input-control"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            placeholder="cth: Sepeda"
          />
        </div>
        <div>
          <label className="filter-label" htmlFor="prize-desc">Deskripsi</label>
          <textarea
            id="prize-desc"
            className="input-control"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Detail hadiah (opsional)"
          />
        </div>
        <div>
          <label className="filter-label" htmlFor="prize-qty">Jumlah</label>
          <input
            id="prize-qty"
            type="number"
            min={1}
            className="input-control"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            required
          />
        </div>
      </form>
    </Modal>
  );
}

export default PrizeForm;