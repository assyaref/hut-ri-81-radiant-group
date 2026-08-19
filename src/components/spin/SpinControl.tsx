interface SpinControlProps {
  spinning: boolean;
  hasPrize: boolean;
  hasEligible: boolean;
  onSpin: () => void;
}

function SpinControl({ spinning, hasPrize, hasEligible, onSpin }: SpinControlProps) {
  const disabled = spinning || !hasPrize || !hasEligible;
  return (
    <button
      className={`spin-button ${disabled ? 'is-disabled' : ''}`}
      onClick={onSpin}
      disabled={disabled}
    >
      {spinning ? (
        <span className="inline-flex items-center gap-2">
          <span className="spinner spinner-light" /> Memutar…
        </span>
      ) : (
        '🎰 MULAI SPIN'
      )}
    </button>
  );
}

export default SpinControl;