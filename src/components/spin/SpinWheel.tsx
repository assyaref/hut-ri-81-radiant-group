interface SpinWheelProps {
  spinning: boolean;
  winnerName: string | null;
  participantCount: number;
}

/**
 * Visual spinning animation. The actual random winner is decided and validated
 * by the backend; this component only renders the UI feedback for the spin.
 */
function SpinWheel({ spinning, winnerName, participantCount }: SpinWheelProps) {
  return (
    <div className={`spin-stage ${spinning ? 'spin-stage-active' : ''}`}>
      <div className="spin-wheel-outer" aria-hidden="true">
        {spinning && <div className="spin-rings spin-rings-animate" />}
        <div className="spin-wheel-center">
          {spinning ? '🎰' : winnerName ? '🏆' : '🎁'}
        </div>
      </div>
      <p className="mt-4 text-center text-gray-600">
        {spinning
          ? 'Memutar… menentukan pemenang'
          : winnerName
            ? `Selamat untuk ${winnerName}!`
            : `${participantCount} peserta eligible siap diundang.`}
      </p>
    </div>
  );
}

export default SpinWheel;