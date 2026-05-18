import { WeekHeader } from "../components/WeekHeader";
import { OneSampleMeanTest } from "../modules/week13/OneSampleMeanTest";
import { OneSampleProportionTest } from "../modules/week13/OneSampleProportionTest";
import { TwoSampleTest } from "../modules/week13/TwoSampleTest";
import { PValueDrawbacks } from "../modules/week13/PValueDrawbacks";
import { getWeek } from "../utils/weekConfig";

export function Week13Page() {
  const week = getWeek(13)!;
  return (
    <div className="space-y-6">
      <WeekHeader week={week} />
      <OneSampleMeanTest />
      <OneSampleProportionTest />
      <TwoSampleTest />
      <PValueDrawbacks />
    </div>
  );
}
