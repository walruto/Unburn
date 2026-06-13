import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import {
  EMPTY_CALENDAR_IMAGE,
  EMPTY_CHECKIN_IMAGE,
  EMPTY_TRENDS_IMAGE,
} from '../constants/images';

export default function Home() {
  const navigate = useNavigate();

  return (
    <AppLayout
      active="home"
      wrapperClassName="bg-background text-on-surface min-h-screen flex flex-col font-body-md antialiased pb-24 md:pb-0"
      mainClassName="flex-grow w-full max-w-[1040px] mx-auto px-container-margin pt-24 py-lg md:py-xl flex flex-col gap-xl"
    >
      <header className="text-center max-w-2xl mx-auto mb-md">
        <h2 className="text-3xl md:text-4xl font-bold text-on-surface mb-sm">Let's get comfortable.</h2>
        <p className="font-body-lg text-on-surface-variant">Here are a few gentle steps to set up your personal sanctuary.</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
        <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg flex flex-col items-center text-center shadow-sm">
          <img src={EMPTY_CALENDAR_IMAGE} className="w-32 h-32 mb-4 rounded-full object-cover" alt="" />
          <h3 className="font-bold mb-2">No calendar connected</h3>
          <button
            onClick={() => navigate('/calendar')}
            className="mt-auto squishy-btn bg-primary-container px-6 py-3 rounded-full text-sm font-bold"
          >
            Connect Calendar
          </button>
        </div>
        <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg flex flex-col items-center text-center shadow-sm">
          <img src={EMPTY_TRENDS_IMAGE} className="w-32 h-32 mb-4 rounded-full object-cover" alt="" />
          <h3 className="font-bold mb-2">No trend data yet</h3>
          <button
            onClick={() => navigate('/trends')}
            className="mt-auto squishy-btn border px-6 py-3 rounded-full text-sm font-bold"
          >
            Learn About Trends
          </button>
        </div>
        <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg flex flex-col items-center text-center shadow-sm">
          <img src={EMPTY_CHECKIN_IMAGE} className="w-32 h-32 mb-4 rounded-full object-cover" alt="" />
          <h3 className="font-bold mb-2">No check-ins completed</h3>
          <button
            onClick={() => navigate('/checkin')}
            className="mt-auto squishy-btn bg-primary-container px-6 py-3 rounded-full text-sm font-bold"
          >
            Start Check-in
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
