import AppLayout from '../components/AppLayout';

export default function Trends() {
  return (
    <AppLayout
      active="journey"
      wrapperClassName="bg-background text-on-background min-h-screen font-body-md pb-24 md:pb-8"
      mainClassName="max-w-[1040px] mx-auto px-container-margin pt-24 space-y-xl md:pl-28"
    >
      <h2 className="text-3xl md:text-4xl font-bold">Your Rhythm</h2>
      <article className="bg-surface-container-lowest rounded-xl p-6 border shadow-sm space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-sm">local_fire_department</span>
              </span>{' '}
              Energy Flow
            </h3>
          </div>
          <span className="text-xs uppercase bg-surface-container px-3 py-1 rounded-full">Last 7 Days</span>
        </div>
        <div className="h-48 w-full bg-surface-container-low rounded-lg relative overflow-hidden">
          <svg className="w-full h-full absolute inset-0" preserveAspectRatio="none" viewBox="0 0 100 100">
            <path
              d="M0,80 Q20,60 40,70 T80,40 T100,20 L100,100 L0,100 Z"
              fill="#fea35e"
              opacity="0.3"
            />
            <path
              d="M0,80 Q20,60 40,70 T80,40 T100,20"
              fill="none"
              stroke="#924c0b"
              strokeWidth="3"
            />
          </svg>
        </div>
        <div className="bg-surface-container-low rounded-lg p-4 flex gap-3">
          <span className="material-symbols-outlined text-secondary">spa</span>
          <p className="text-sm">
            Your stress peaks are softer this week, and you're adding more recovery moments.
          </p>
        </div>
      </article>
    </AppLayout>
  );
}
