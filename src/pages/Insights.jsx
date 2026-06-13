import AppLayout from '../components/AppLayout';
import MaterialIcon from '../components/MaterialIcon';

export default function Insights() {
  return (
    <AppLayout
      active="explore"
      wrapperClassName="bg-background text-on-background min-h-screen flex flex-col pb-24 md:pb-0"
      mainClassName="flex-grow w-full max-w-[1040px] mx-auto px-container-margin pt-24 py-md flex flex-col gap-xl md:pl-28"
    >
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold">Insights & Patterns</h1>
        <p className="text-on-surface-variant">I've noticed a few gentle rhythms in your week.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface-container-lowest border rounded-xl p-6 flex flex-col gap-4 shadow-sm hover-lift">
          <div className="w-12 h-12 rounded-full bg-tertiary-container flex items-center justify-center">
            <MaterialIcon name="bedtime" filled />
          </div>
          <h3 className="font-bold">Late nights lately</h3>
          <p className="text-sm text-on-surface-variant">
            Activity continued past usual wind-down times. Try a gentle reminder tonight.
          </p>
          <button className="mt-auto bg-primary-container px-4 py-2 rounded-full text-xs font-bold uppercase w-max">
            Set alarm
          </button>
        </div>
        <div className="bg-surface-container-lowest border rounded-xl p-6 flex flex-col gap-4 shadow-sm hover-lift">
          <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center">
            <MaterialIcon name="battery_charging_full" filled />
          </div>
          <h3 className="font-bold">Recharging rhythm</h3>
          <p className="text-sm text-on-surface-variant">
            Energy improves on days with fewer than 3 meetings. You thrive on deep-focus time.
          </p>
          <button className="mt-auto border px-4 py-2 rounded-full text-xs font-bold uppercase w-max">
            Review schedule
          </button>
        </div>
        <div className="md:col-span-2 bg-surface-container-lowest border rounded-xl p-6 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
            <MaterialIcon name="directions_walk" filled />
          </div>
          <div>
            <h3 className="font-bold">Steadily moving</h3>
            <p className="text-sm text-on-surface-variant">
              Consistent lunch walks are contributing to your stable mood scores.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
