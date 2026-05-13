import { WeekHeader } from "../components/WeekHeader";
import { BernoulliMLE } from "../modules/week11/BernoulliMLE";
import { PoissonMLE } from "../modules/week11/PoissonMLE";
import { BetaExplorer } from "../modules/week11/BetaExplorer";
import { getWeek } from "../utils/weekConfig";

export function Week11Page() {
  const week = getWeek(11)!;
  return (
    <div className="space-y-6">
      <WeekHeader week={week} />
      <BernoulliMLE />
      <PoissonMLE />
      <BetaExplorer />
    </div>
  );
}
