import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface Competency {
  id: string;
  name: string;
}

interface CompetencyScore {
  competency_id: string;
  score: number;
  notes?: string;
  competency?: Competency;
}

interface CompetencyRadarChartProps {
  competencies: CompetencyScore[];
}

export const CompetencyRadarChart = ({ competencies }: CompetencyRadarChartProps) => {
  // Transform data for radar chart
  const chartData = competencies
    .filter(c => c.score > 0) // Only show competencies with scores
    .map(c => {
      // Get competency name from the competency object if available
      let competencyName = 'Unknown';
      if (c.competency && typeof c.competency === 'object') {
        competencyName = c.competency.name;
      }
      
      return {
        competency: competencyName,
        score: c.score,
        fullMark: 5,
      };
    });

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-400">
        <p>No competency scores available</p>
      </div>
    );
  }

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={chartData}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis 
            dataKey="competency" 
            tick={{ fill: '#6b7280', fontSize: 14, fontWeight: 500 }}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 5]} 
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            tickCount={6}
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke="#f59e0b"
            fill="#fbbf24"
            fillOpacity={0.6}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
