import { ForecastSection } from '../components/ai/ForecastSection';
import AILiveBanner from '../components/ai/AILiveBanner';
import React, { useState, useEffect } from 'react';
import AddBedModal from '../components/beds/AddBedModal';
import UpdateStatusModal from '../components/beds/UpdateStatusModal';
import AssignBedModal from '../components/beds/AssignBedModal';
import { WARDS, BED_STATUSES } from '../data/mockData';
import { getAiMockData } from '../data/aiMockData';
import StatsDashboard from './StatsDashboard';
import PatientsDashboard from '../components/patients/PatientsDashboard';
import Billing from './dashboard/Billing';
import BookingHistory from './dashboard/BookingHistory';
import WardView from '../components/ui/WardView/react/WardView';
import BedSummaryModal from '../components/ui/WardView/react/BedSummaryModal';
import {
  BedDouble, BarChart2, TrendingUp, BookOpen,
  Users, IndianRupee, FileText,
} from 'lucide-react';

const SECTION_TABS = [
  { id: 'ward', label: 'Ward View', icon: BedDouble },
  { id: 'stats', label: 'Stats', icon: BarChart2 },
  { id: 'forecast', label: 'Forecast', icon: TrendingUp },
  { id: 'history', label: 'Booking History', icon: BookOpen },
  { id: 'patients', label: 'Patients', icon: Users },
  { id: 'billing', label: 'Billing', icon: IndianRupee },
  { id: 'reports', label: 'Reports', icon: FileText },
];

function ComingSoon({ label }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-gray-400">
      <div className="w-16 h-16 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center mb-4">
        <TrendingUp size={28} className="text-violet-300" />
      </div>
      <p className="text-lg font-bold text-gray-500">{label}</p>
      <p className="text-sm mt-1 text-gray-400">Coming soon</p>
    </div>
  );
}

const CLOSED = { type: null, bed: null };

export default function Dashboard() {
  const [section, setSection] = useState('ward');
  const [modal, setModal] = useState(CLOSED);
  const [aiData, setAiData] = useState(null);
  const [aiLoading, setAiLoading] = useState(true);

  useEffect(() => {
    const fetchAiData = async () => {
      try {
        const now = new Date();
        const hour = now.getHours();
        const day = now.getDay() === 0 ? 6 : now.getDay() - 1;
        const is_weekend = day >= 5 ? 1 : 0;
        const is_festival = 0;

        const forecastRes = await fetch(
          `http://127.0.0.1:8000/forecast?day=${day}&is_weekend=${is_weekend}&is_festival=${is_festival}&start_hour=${hour}`
        );
        const forecastJson = await forecastRes.json();
        const forecast = forecastJson.forecast;

        const predictRes = await fetch(
          `http://127.0.0.1:8000/predict?hour=${hour}&day=${day}&is_weekend=${is_weekend}&is_festival=${is_festival}`
        );
        const predict = await predictRes.json();

        const peakHours = forecast
          .filter(f => f.alert_probability > 30)
          .map(f => `${String(f.hour).padStart(2, '0')}:00`);

        const activityData = forecast.map(f => ({
          time: `${String(f.hour).padStart(2, '0')}:00`,
          load: f.occupied
        }));

        const next6 = forecast.slice(0, 6);
        const next12 = forecast.slice(0, 12);
        const next24 = forecast.slice(0, 24);
        const avgOccupied = (arr) => Math.round(arr.reduce((sum, f) => sum + f.occupied, 0) / arr.length);

        setAiData({
          peakHours: {
            predictedPeakHours: peakHours.slice(0, 3),
            expectedPatientLoad: predict.occupied,
            confidence: `${100 - Math.round(predict.alert_probability)}%`,
            activityData
          },
          bedDemand: {
            next6Hours: { icu: Math.round(avgOccupied(next6) * 0.2), general: Math.round(avgOccupied(next6) * 0.8) },
            next12Hours: { icu: Math.round(avgOccupied(next12) * 0.2), general: Math.round(avgOccupied(next12) * 0.8) },
            next24Hours: { icu: Math.round(avgOccupied(next24) * 0.2), general: Math.round(avgOccupied(next24) * 0.8) },
            chartData: [
              { timeframe: '6h', icu: Math.round(avgOccupied(next6) * 0.2), general: Math.round(avgOccupied(next6) * 0.8) },
              { timeframe: '12h', icu: Math.round(avgOccupied(next12) * 0.2), general: Math.round(avgOccupied(next12) * 0.8) },
              { timeframe: '24h', icu: Math.round(avgOccupied(next24) * 0.2), general: Math.round(avgOccupied(next24) * 0.8) },
            ]
          },
          emergencyAlert: {
            alert: predict.alert === 'CRITICAL',
            reason: predict.alert === 'CRITICAL' ? `AI detected ${predict.alert_probability}% critical risk at hour ${hour}` : null,
            riskLevel: predict.alert_probability > 70 ? 'High' : 'Medium',
            suggestion: 'Prepare additional beds'
          },
          nearbyHospitals: [
            { id: 1, name: 'AIIMS Delhi', distance: '2.1 km', availableBeds: 12 },
            { id: 2, name: 'Safdarjung Hospital', distance: '4.5 km', availableBeds: 8 },
            { id: 3, name: 'Ram Manohar Lohia Hospital', distance: '6.2 km', availableBeds: 10 },
            { id: 4, name: 'Sir Ganga Ram Hospital', distance: '3.8 km', availableBeds: 6 },
            { id: 5, name: 'Apollo Hospital Delhi', distance: '5.0 km', availableBeds: 7 },
          ],
          bedRecommendation: {
            recommendedBed: predict.alert === 'CRITICAL' ? 'ICU-12' : 'GEN-05',
            reason: predict.alert === 'CRITICAL' ? 'Critical risk detected — ICU bed reserved' : 'Closest available general bed',
            priority: predict.alert === 'CRITICAL' ? 'Critical' : 'Normal',
            assigned: false
          }
        });
      } catch (err) {
        console.error('FastAPI connection failed:', err);
        setAiData(getAiMockData());
      } finally {
        setAiLoading(false);
      }
    };

    fetchAiData();
    const interval = setInterval(fetchAiData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <AILiveBanner aiData={aiData} />

      {/* ── Section tab nav ── */}
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide bg-white rounded-2xl p-1.5 mb-5"
        style={{ border: '1px solid #ede9fe', boxShadow: '0 2px 12px rgba(109,40,217,0.06)' }}>
        {SECTION_TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setSection(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-semibold
              whitespace-nowrap transition-all duration-200 shrink-0
              ${section === id
                ? 'bg-violet-600 text-white shadow-md'
                : 'text-gray-500 hover:text-violet-600 hover:bg-violet-50'}`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      {section === 'ward' ? (
        <WardView setModal={setModal} />
      ) : section === 'forecast' ? (
        <ForecastSection aiData={aiData} aiLoading={aiLoading} />
      ) : section === 'stats' ? (
        <StatsDashboard />
      ) : section === 'patients' ? (
        <PatientsDashboard />
      ) : section === 'billing' ? (
        <Billing />
      ) : section === 'history' ? (
        <BookingHistory />
      ) : (
        <div className="bg-white rounded-2xl border border-violet-50 shadow-sm">
          <ComingSoon label={SECTION_TABS.find(t => t.id === section)?.label} />
        </div>
      )}

      {/* ── Modals ── */}
      <AddBedModal open={modal.type === 'add'} onClose={() => setModal(CLOSED)} />
      <UpdateStatusModal open={modal.type === 'status'} onClose={() => setModal(CLOSED)} bed={modal.bed} />
      <AssignBedModal open={modal.type === 'assign'} onClose={() => setModal(CLOSED)} bed={modal.bed} />
      <BedSummaryModal open={modal.type === 'summary'} onClose={() => setModal(CLOSED)} />
    </>
  );
}
