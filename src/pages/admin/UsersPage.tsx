import { useCallback, useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import AdminNav from './AdminNav';
import { LoadingState, ErrorState } from '../../components/ui/Feedback';
import { useToast } from '../../context/ToastContext';
import type { Role, UserRow } from '../../types/hutRi';
import api from '../../services/api';

const ROLES: Role[] = ['VIEWER', 'OPERATOR', 'ADMIN', 'SUPERADMIN'];

function UsersPage() {
  const { notify } = useToast();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'VIEWER' });

  const load = useCallback(async () => {
    setError('');
    try {
      const result = await api.getUsers();
      if (result.success) setUsers(Array.isArray(result.data) ? result.data : []);
      else setError(result.message);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Gagal memuat pengguna.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleStatus = async (user: UserRow) => {
    const result = await api.updateUser(user.id, { status: user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' });
    if (result.success) { notify('success', 'Status pengguna diperbarui.'); load(); }
    else { notify('error', result.message); }
  };

  const changeRole = async (user: UserRow, role: string) => {
    const result = await api.updateUser(user.id, { role });
    if (result.success) { notify('success', 'Role diperbarui.'); load(); }
    else { notify('error', result.message); }
  };

  const createUser = async () => {
    setIsSaving(true);
    try {
      const result = await api.createUser({ ...newUser, role: newUser.role });
      if (result.success) {
        notify('success', 'Pengguna dibuat.');
        setCreateOpen(false);
        setNewUser({ name: '', email: '', password: '', role: 'VIEWER' });
        load();
      } else { notify('error', result.message); }
    } catch (e: unknown) {
      notify('error', e instanceof Error ? e.message : 'Gagal membuat pengguna.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-navy-900 mb-1">Manajemen Pengguna</h1>
          <p className="text-gray-500">Kelola akun dan role akses (SUPERADMIN).</p>
        </div>
        <Button className="mt-3 md:mt-0" onClick={() => setCreateOpen(true)}>+ Tambah Pengguna</Button>
      </div>
      <AdminNav />

      {isLoading ? (
        <Card><LoadingState label="Memuat pengguna\u2026" /></Card>
      ) : error ? (
        <Card><ErrorState message={error} onRetry={load} /></Card>
      ) : (
        <Card className="p-0">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="font-medium text-navy-900">{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <select className="input-control input-inline" value={u.role} onChange={(e) => changeRole(u, e.target.value)}>
                        {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                    <td><Badge variant={u.status === 'ACTIVE' ? 'success' : 'default'}>{u.status}</Badge></td>
                    <td>
                      <button className="btn-outline-small" onClick={() => toggleStatus(u)}>
                        {u.status === 'ACTIVE' ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal open={createOpen} title="Tambah Pengguna" onClose={() => setCreateOpen(false)}>
        <div className="space-y-4">
          <div>
            <label className="filter-label" htmlFor="nu-name">Nama</label>
            <input id="nu-name" className="input-control" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />
          </div>
          <div>
            <label className="filter-label" htmlFor="nu-email">Email</label>
            <input id="nu-email" type="email" className="input-control" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
          </div>
          <div>
            <label className="filter-label" htmlFor="nu-password">Password</label>
            <input id="nu-password" type="password" className="input-control" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
          </div>
          <div>
            <label className="filter-label" htmlFor="nu-role">Role</label>
            <select id="nu-role" className="input-control" value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button className="btn-outline-small" onClick={() => setCreateOpen(false)}>Batal</button>
            <Button disabled={isSaving} onClick={createUser}>{isSaving ? 'Menyimpan\u2026' : 'Simpan'}</Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}

export default UsersPage;
