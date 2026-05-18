import { WeekHeader } from "../components/WeekHeader";
import { CIProportion } from "../modules/week12/CIProportion";
import { CIWidthExplorer } from "../modules/week12/CIWidthExplorer";
import { CIInterpretationSimulator } from "../modules/week12/CIInterpretationSimulator";
import { CredibleInterval } from "../modules/week12/CredibleInterval";
import { getWeek } from "../utils/weekConfig";

export function Week12Page() {
  const week = getWeek(12)!;
  return (
    <div className="space-y-6">
      <WeekHeader week={week} />
      <CIProportion />
      <CIWidthExplorer />
      <CIInterpretationSimulator />
      <CredibleInterval />
    </div>
  );
}
