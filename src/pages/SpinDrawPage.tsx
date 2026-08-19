import { useCallback, useEffect, useMemo, useState } from 'react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import PrizeSelector from '../components/spin/PrizeSelector';
import SpinParticipantList from '../components/spin/SpinParticipantList';
import SpinWheel from '../components/spin/SpinWheel';
import SpinControl from '../components/spin/SpinControl';
import WinnerResult from '../components/spin/WinnerResult';
import { LoadingState, ErrorState, EmptyState } from '../components/ui/Feedback';
import { useToast } from '../context/ToastContext';
import type { Participant, Prize, Winner } from '../types/hutRi';
import api from '../services/api';

function SpinDrawPage() {
  const { notify } = useToast();
  const [eligible, setEligible] = useState<Participant[]>([]);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [selectedPrizeId, setSelectedPrizeId] = useState('');
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<Winner | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const [elResult, prResult] = await Promise.all([
        api.getEligibleParticipants(),
        api.getPrizes(),
      ]);
      if (elResult.success) setEligible(Array.isArray(elResult.data) ? elResult.data : []);
      else setError(elResult.message);
      if (prResult.success) {
        setPrizes(Array.isArray(prResult.data) ? prResult.data : []);
      } else if (!error) {
        setError(prResult.message);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Gagal memuat data spin.');
    } finally {
      setIsLoading(false);
    }
  }, [error]);

  useEffect(() => { load(); }, []);

  const availablePrizes = useMemo(() => prizes.filter((p) => p.available > 0), [prizes]);

  useEffect(() => {
    if (selectedPrizeId && !prizes.some((p) => p.id === selectedPrizeId && p.available > 0)) {
      setSelectedPrizeId('');
    }
  }, [prizes, selectedPrizeId]);

  const handleSpin = async () => {
    if (!selectedPrizeId || eligible.length === 0) return;
    setSpinning(true);
    setWinner(null);

    // UI-only animation delay.
    await new Promise((r) => setTimeout(r, 2600));

    try {
      const result = await api.drawWinner(selectedPrizeId);
      if (result.success) {
        if (result.data) setWinner(result.data);
        window.setTimeout(() => { setWinner(null); }, 6000);
        notify('success', 'Pemenang berhasil ditentukan!');
        load();
      } else {
        notify('error', result.message);
      }
    } catch (e: unknown) {
      notify('error', e instanceof Error ? e.message : 'Spin gagal, coba lagi.');
    } finally {
      setSpinning(false);
    }
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-navy-900 mb-1">Spin Draw</h1>
        <p className="text-gray-500">Undian hadiah untuk peserta yang sudah check-in.</p>
      </div>

      {isLoading ? (
        <Card><LoadingState label="Menyiapkan spin…" /></Card>
      ) : error ? (
        <Card><ErrorState message={error} onRetry={load} /></Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 flex flex-col gap-6">
            <h2 className="text-xl font-bold text-navy-900">Konfigurasi Undian</h2>
            <PrizeSelector
              prizes={prizes}
              selectedId={selectedPrizeId}
              onSelect={setSelectedPrizeId}
              disabled={spinning}
            />
            <SpinControl
              spinning={spinning}
              hasPrize={!!selectedPrizeId}
              hasEligible={eligible.length > 0}
              onSpin={handleSpin}
            />
            <div className="grid grid-cols-2 gap-4">
              <div className="stat-mini">
                <span className="stat-mini-value">{eligible.length}</span>
                <span className="stat-mini-label">Eligible</span>
              </div>
              <div className="stat-mini">
                <span className="stat-mini-value">{availablePrizes.reduce((a, p) => a + p.available, 0)}</span>
                <span className="stat-mini-label">Hadiah Tersisa</span>
              </div>
            </div>
            {eligible.length === 0 && (
              <p className="text-sm text-amber-700 bg-amber-50 rounded-lg p-3">
                Tidak ada peserta eligible. Pastikan peserta sudah check-in dan belum menang.
              </p>
            )}
          </Card>

          <Card className="lg:col-span-2 flex flex-col items-center">
            <SpinWheel
              spinning={spinning}
              winnerName={winner ? winner.participantName : null}
              participantCount={eligible.length}
            />
          </Card>

          <Card className="lg:col-span-3">
            <h2 className="text-xl font-bold text-navy-900 mb-4">Peserta Eligible</h2>
            {eligible.length === 0 ? (
              <EmptyState title="Tidak ada peserta eligible" description="Belum ada peserta yang check-in untuk mengikuti spin." />
            ) : (
              <SpinParticipantList participants={eligible} spinning={spinning} winnerName={winner ? winner.participantName : null} />
            )}
          </Card>
        </div>
      )}

      <WinnerResult winner={winner} onClose={() => setWinner(null)} />
    </Layout>
  );
}

export default SpinDrawPage;