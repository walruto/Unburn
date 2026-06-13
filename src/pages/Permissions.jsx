import { useNavigate } from 'react-router-dom';
import Toggle from '../components/Toggle';
import MaterialIcon from '../components/MaterialIcon';

const PERMISSIONS = [
  { title: 'Calendar', icon: 'calendar_today' },
  { title: 'Sleep Data', icon: 'bedtime' },
  { title: 'Physical Activity', icon: 'favorite', wide: true },
];

export default function Permissions() {
  const navigate = useNavigate();

  return (
    <main className="flex-grow w-full max-w-3xl mx-auto px-container-margin py-md flex flex-col gap-xl">
      <section className="text-center space-y-4 pt-8 md:pt-16">
        <h2 className="text-3xl md:text-4xl font-bold text-on-surface">Let's set up your sanctuary</h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl mx-auto">
          Unburn works best when it understands your natural rhythm. We only ask for what helps us support your recovery.
        </p>
      </section>
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {PERMISSIONS.map((item, i) => (
          <div
            key={item.title}
            className={`bg-surface-container-lowest rounded-xl p-8 border border-surface-variant flex flex-col items-center text-center gap-6 ${
              item.wide ? 'md:col-span-2 md:flex-row md:text-left' : ''
            }`}
          >
            <div className="w-20 h-20 bg-primary-fixed rounded-full flex items-center justify-center">
              <MaterialIcon name={item.icon} filled className="text-[40px] text-on-primary-container" />
            </div>
            <div className="flex-grow">
              <h3 className="font-headline-md text-headline-md text-on-surface">{item.title}</h3>
              <p className="font-body-md text-on-surface-variant">Explanation for why we need this data to help you.</p>
            </div>
            <Toggle id={`toggle-${i}`} defaultChecked />
          </div>
        ))}
      </section>
      <section className="flex flex-col items-center gap-4 mt-8 pb-32">
        <button
          onClick={() => navigate('/empty')}
          className="squishy-btn bg-primary-container text-on-primary-container font-headline-md text-body-lg px-8 py-4 rounded-full min-h-[56px] min-w-[200px] shadow-sm"
        >
          Continue
        </button>
      </section>
    </main>
  );
}
