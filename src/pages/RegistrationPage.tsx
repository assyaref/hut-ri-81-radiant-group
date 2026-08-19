import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import api from '../services/api';

const RegistrationPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    department: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [uniqueCode, setUniqueCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [registeredData, setRegisteredData] = useState<{
    name: string;
    department: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await api.register({
        name: formData.name.trim(),
        department: formData.department.trim()
      });

      if (result.success) {
        setUniqueCode(result.data.uniqueCode);
        setRegisteredData({
          name: result.data.name,
          department: result.data.department
        });
        setSubmitted(true);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({ name: '', department: '' });
    setSubmitted(false);
    setUniqueCode('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-navy-900 mb-2">Registrasi Peserta</h1>
          <p className="text-gray-600">Daftarkan diri Anda untuk acara HUT RI ke-81 Radiant Group</p>
        </div>

        <Card>
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-red-500 focus:outline-none transition-colors text-gray-800"
                  placeholder="Masukkan nama lengkap Anda"
                />
              </div>

              <div>
                <label htmlFor="department" className="block text-sm font-semibold text-gray-700 mb-2">
                  Departemen
                </label>
                <input
                  type="text"
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-red-500 focus:outline-none transition-colors text-gray-800"
                  placeholder="Masukkan departemen Anda"
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
                {isLoading ? 'Memproses...' : 'Daftar Sekarang'}
              </Button>
            </form>
          ) : (
            <div className="text-center py-8">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-5xl shadow-lg">
                ✓
              </div>
              <h2 className="text-2xl font-bold text-navy-900 mb-4">Registrasi Berhasil!</h2>
              <p className="text-gray-600 mb-2">Nama: <span className="font-semibold">{registeredData?.name}</span></p>
              <p className="text-gray-600 mb-6">Departemen: <span className="font-semibold">{registeredData?.department}</span></p>
              
              <div className="bg-gradient-to-r from-navy-800 to-navy-900 rounded-xl p-6 mb-6 inline-block">
                <p className="text-gray-400 text-sm mb-2">Kode Unik Anda</p>
                <Badge variant="gold" className="text-lg px-6 py-2">
                  {uniqueCode}
                </Badge>
              </div>

              <div className="flex gap-4 justify-center mt-8">
                <Button 
                  onClick={() => {
                    navigator.clipboard.writeText(uniqueCode);
                    alert('Kode berhasil disalin!');
                  }} 
                  variant="gold"
                >
                  SALIN KODE
                </Button>
                <Button onClick={handleReset} variant="outline">
                  Daftarkan Peserta Lain
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default RegistrationPage;