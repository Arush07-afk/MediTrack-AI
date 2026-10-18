import React, { useState, useEffect } from 'react';
import { X, Users, ChevronLeft, ChevronRight, Plus, Edit2, Trash2, Clock as ClockIcon, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useBeds } from '../../context/BedContext';
import hospitalImg from '../../assets/hospital.png';
import useWaitTime from '../../hooks/useWaitTime';
import AddQueuePatientModal from '../queue/AddQueuePatientModal';

const TABS = ['admin', 'discharge', 'transfer'];
const TAB_LABELS = { admin: 'Admin', discharge: 'Discharge', transfer: 'Transfer' };
const PAGE_SIZE = 4;

function RealTimeClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="flex items-center gap-1.5 text-[11px] font-bold text-violet-600 bg-violet-50 border border-violet-200 px-2.5 py-1 rounded-full">
      <ClockIcon size={11} />
      <span>{time.toLocaleTimeString()}</span>
    </div>
  );
}

const PRIORITY_STYLES = {
  High: 'bg-rose-50   text-rose-600   border-rose-200',
  Medium: 'bg-amber-50  text-amber-600  border-amber-200',
  Low: 'bg-emerald-50 text-emerald-600 border-emerald-200',
};

function QueueItem({ patient, onEdit, onDelete }) {
  const waitTime = useWaitTime(patient.timestamp);
  const priorityCls = PRIORITY_STYLES[patient.priority] ?? 'bg-gray-50 text-gray-500 border-gray-200';

  return (
    <div className="group flex items-center justify-between bg-white rounded-xl px-3 py-2.5 card-shadow
      hover:shadow-md transition-all duration-200 border border-violet-50">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">{patient.patientName}</p>
        <p className="text-xs text-violet-500 font-medium mt-0.5">{patient.requiredWard}</p>
      </div>
      <div className="flex flex-col items-end gap-1 ml-2 shrink-0">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${priorityCls}`}>
          {patient.priority}
        </span>
        <span className="text-[10px] text-gray-400">{waitTime}</span>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(patient)} className="text-violet-400 hover:text-violet-600 transition-colors">
            <Edit2 size={11} />
          </button>
          <button onClick={() => onDelete(patient.id)} className="text-rose-400 hover:text-rose-600 transition-colors">
            <Trash2 size={11} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();
  const [isAddQueueOpen, setAddQueueOpen] = useState(false);
  const [patientToEdit, setPatientToEdit] = useState(null);
  const { queue, removeFromQueue } = useBeds();
  const [activeTab, setActiveTab] = useState('admin');
  const [page, setPage] = useState(1);

  const tabQueue = queue.filter(q => q.tab === activeTab);
  const totalPages = Math.max(1, Math.ceil(tabQueue.length / PAGE_SIZE));
  const paged = tabQueue.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleTabChange(tab) { setActiveTab(tab); setPage(1); }
  function handleEdit(patient) { setPatientToEdit(patient); setAddQueueOpen(true); }
  function handleCloseModal() { setAddQueueOpen(false); setPatientToEdit(null); }

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/30 z-40 md:hidden backdrop-blur-sm" onClick={onClose} />
      )}

      <aside className={[
        'flex flex-col bg-white h-full',
        'fixed inset-y-0 left-0 z-50 w-72 shadow-2xl',
        'transition-transform duration-300 ease-in-out',
        open ? 'translate-x-0' : '-translate-x-full',
        'md:relative md:translate-x-0 md:w-64 md:shadow-none md:z-auto',
      ].join(' ')}
        style={{ borderRight: '1px solid #ede9fe' }}
      >
        {/* Close btn — mobile only */}
        <div className="flex items-center justify-end px-4 pt-3 md:hidden">
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Brand + illustration */}
        <div className="px-4 pt-4 pb-3 shrink-0" style={{ background: 'linear-gradient(135deg, #f5f3ff 0%, #eef2ff 100%)' }}>
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
              <Activity size={18} className="text-white" />
            </div>
            <div>
              <p className="text-gray-800 font-extrabold text-sm uppercase leading-none">MediTrack AI</p>
              <p className="text-violet-400 text-[10px] font-semibold uppercase tracking-widest mt-0.5">Bed Tracking</p>
            </div>
          </div>
          <div className="w-full rounded-xl overflow-hidden bg-white/60 border border-violet-100">
            <img src={hospitalImg} alt="Hospital" className="w-full max-h-28 object-contain py-2 px-3" />
          </div>
        </div>

        {/* Queuing label */}
        <div className="flex items-center justify-between px-4 py-2.5 shrink-0 border-b border-violet-50">
          <div className="flex items-center gap-2">
            <Users size={14} className="text-violet-500" />
            <span className="text-violet-700 font-bold text-xs uppercase tracking-wider">Queue System</span>
          </div>
          <RealTimeClock />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-3 py-2 shrink-0">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`flex-1 py-1.5 text-[11px] font-bold capitalize rounded-lg transition-all duration-200
                ${activeTab === tab
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'text-gray-500 hover:text-violet-600 hover:bg-violet-50'}`}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>

        {/* Pagination bar */}
        <div className="flex items-center justify-between px-3 py-1.5 shrink-0">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-violet-600 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft size={13} /> Prev
          </button>
          <span className="text-[11px] font-bold text-violet-600 bg-violet-50 border border-violet-100 px-2.5 py-0.5 rounded-full">
            {page}/{totalPages}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-violet-600 disabled:opacity-30 transition-colors"
            >
              Next <ChevronRight size={13} />
            </button>
            <button
              onClick={() => setAddQueueOpen(true)}
              className="w-6 h-6 rounded-lg flex items-center justify-center bg-violet-600 text-white hover:bg-violet-700 transition-colors"
              title="Add patient"
            >
              <Plus size={13} />
            </button>
          </div>
        </div>

        {/* Queue list */}
        <div className="flex-1 overflow-y-auto px-3 pb-3 min-h-0 scrollbar-thin space-y-2">
          {paged.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Users size={28} className="text-violet-200 mb-2" />
              <p className="text-center text-gray-400 text-xs">No patients in this queue.</p>
            </div>
          ) : (
            paged.map(p => (
              <QueueItem key={p.id} patient={p} onEdit={handleEdit} onDelete={removeFromQueue} />
            ))
          )}
        </div>

        {/* User footer */}
        <div className="px-4 py-3 shrink-0 border-t border-violet-50 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
              {(user?.name?.[0] ?? 'U').toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-700 truncate">{user?.name ?? 'User'}</p>
              <p className="text-[10px] text-gray-400 truncate">{user?.email ?? ''}</p>
            </div>
          </div>
        </div>
      </aside>

      <AddQueuePatientModal
        open={isAddQueueOpen}
        onClose={handleCloseModal}
        defaultTab={activeTab}
        patientToEdit={patientToEdit}
      />
    </>
  );
}
