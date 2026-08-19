import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import api from '../services/api';

const CheckinPage: React.FC = () => {
  const [uniqueCode, setUniqueCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [participantData, setParticipantData] = useState<{
    name: string;
    department: string;
    uniqueCode: string;
    status: string;
  } | null>(null);

  const handleCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await api.checkin(uniqueCode.trim().toUpperCase());
      
      if (result.success) {
        setIsSuccess(true);
        setParticipantData({
          name: result.data.name,
          department: result.data.department,
          uniqueCode: result.data.uniqueCode,
          status: result.data.checkin_status
        });
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (participantData) {
      navigator.clipboard.writeText(participantData.uniqueCode);
      alert('Kode berhasil disalin!');
    }
  };

  const resetForm = () => {
    setUniqueCode('');
    setIsSuccess(false);
    setParticipantData(null);
    setError('');
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Check-in Peserta</h1>
        <p className="text-gray-600 mb-8">Masukkan kode unik Anda untuk melakukan check-in acara HUT RI KE-81</p>

        {!isSuccess ? (
          <Card className="p-8">
            <form onSubmit={handleCheckin} className="space-y-6">
              <div>
                <label htmlFor="uniqueCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Kode Unik Peserta
                </label>
                <input
                  type="text"
                  id="uniqueCode"
                  value={uniqueCode}
                  onChange={(e) => setUniqueCode(e.target.value.toUpperCase())}
                  placeholder="HUTRI81XRG-XXXXX"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition uppercase"
                  required
                  maxLength={15}
                  pattern="^HUTRI81XRG-[A-Z0-9]{5}$"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Masukkan kode unik yang Anda dapatkan saat registrasi
                </p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                className="w-full py-3 text-lg"
                disabled={isLoading}
              >
                {isLoading ? 'Memproses...' : 'CHECK-IN SEKARANG'}
              </Button>
            </form>
          </Card>
        ) : (
          <Card className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-6">CHECK-IN BERHASIL!</h2>
            
            <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left space-y-4">
              <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                <span className="text-gray-600">Nama:</span>
                <span className="font-semibold text-gray-800">{participantData?.name}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                <span className="text-gray-600">Departemen:</span>
                <span className="font-semibold text-gray-800">{participantData?.department}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                <span className="text-gray-600">Kode Unik:</span>
                <span className="font-mono font-bold text-red-600">{participantData?.uniqueCode}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status:</span>
                <Badge variant="success">{participantData?.status}</Badge>
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" onClick={handleCopyCode} className="flex-1">
                SALIN KODE
              </Button>
              <Button variant="primary" onClick={resetForm} className="flex-1">
                CHECK-IN ULANG
              </Button>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default CheckinPage;