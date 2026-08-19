interface RankBadgeProps {
  rank: number;
}

const medals = ['🥇', '🥈', '🥉'];

function RankBadge({ rank }: RankBadgeProps) {
  if (rank <= 3) {
    return <span className="text-2xl" aria-label={`Peringkat ${rank}`}>{medals[rank - 1]}</span>;
  }
  return <span className="text-lg font-bold text-gray-500">#{rank}</span>;
}

export default RankBadge;
