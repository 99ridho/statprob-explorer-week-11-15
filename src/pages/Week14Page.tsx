import { WeekHeader } from "../components/WeekHeader";
import { BloomFilter } from "../modules/week14/BloomFilter";
import { MCMCVisualizer } from "../modules/week14/MCMCVisualizer";
import { ProbabilityViaSimulation } from "../modules/week14/ProbabilityViaSimulation";
import { getWeek } from "../utils/weekConfig";

export function Week14Page() {
  const week = getWeek(14)!;
  return (
    <div className="space-y-6">
      <WeekHeader week={week} />
      <ProbabilityViaSimulation />
      <BloomFilter />
      <MCMCVisualizer />
    </div>
  );
}
