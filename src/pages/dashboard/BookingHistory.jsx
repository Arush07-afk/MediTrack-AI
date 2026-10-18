import React, { useState, useMemo, useEffect } from 'react';
import { BookOpen, CheckCircle, Clock, XCircle, Search, ChevronLeft, ChevronRight, BarChart3, Plus } from 'lucide-react';
import { mockBookings } from '../../mockdata/mockBookings';
import BookingTable from '../../components/bookings/BookingTable';
import BookingFilters from '../../components/bookings/BookingFilters';
import BookingCardMobile from '../../components/bookings/BookingCardMobile';
import BookingDetailsModal from '../../components/bookings/BookingDetailsModal';
import BookingFormModal from '../../components/bookings/BookingFormModal';

export default function BookingHistory() {
  const [loading, setLoading] = useState(true);
  const [searchQ, setSearchQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [bookings, setBookings] = useState(mockBookings);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const [sortConfig, setSortConfig] = useState({ key: 'bookingDate', direction: 'desc' });

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const matchesSearch =
        b.patientName.toLowerCase().includes(searchQ.toLowerCase()) ||
        b.hospitalName.toLowerCase().includes(searchQ.toLowerCase()) ||
        b.bookingId.toLowerCase().includes(searchQ.toLowerCase());
      return (
        matchesSearch &&
        (statusFilter === 'All' || b.status === statusFilter) &&
        (typeFilter === 'All' || b.bedType === typeFilter) &&
        (paymentFilter === 'All' || b.paymentStatus === paymentFilter) &&
        (!dateFilter || b.bookingDate === dateFilter)
      );
    });
  }, [bookings, searchQ, statusFilter, typeFilter, paymentFilter, dateFilter]);

  const sortedBookings = useMemo(() => {
    const items = [...filteredBookings];
    if (sortConfig.key) {
      items.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [filteredBookings, sortConfig]);

  const totalPages = Math.ceil(sortedBookings.length / pageSize);
  const pagedBookings = sortedBookings.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (key) => {
    setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
  };
  const handleCancelBooking = (id) => {
    if (window.confirm('Cancel this booking?'))
      setBookings(prev => prev.map(b => b.bookingId === id ? { ...b, status: 'Cancelled', paymentStatus: 'Refunded' } : b));
  };
  const handleDeleteBooking = (id) => {
    if (window.confirm('Delete this booking? This cannot be undone.'))
      setBookings(prev => prev.filter(b => b.bookingId !== id));
  };
  const handleOpenForm = (booking = null) => { setEditingBooking(booking); setIsFormModalOpen(true); };
  const handleSaveBooking = (formData) => {
    if (editingBooking) {
      setBookings(prev => prev.map(b => b.bookingId === editingBooking.bookingId ? formData : b));
    } else {
      setBookings(prev => [{ ...formData, bookingId: `BK-${Math.floor(1000 + Math.random() * 9000)}` }, ...prev]);
    }
    setIsFormModalOpen(false);
    setEditingBooking(null);
  };
  const handleDownloadReceipt = (id) => alert(`Downloading receipt for booking ${id}...`);

  const stats = {
    total: bookings.length,
    active: bookings.filter(b => b.status === 'Active').length,
    completed: bookings.filter(b => b.status === 'Completed').length,
    cancelled: bookings.filter(b => b.status === 'Cancelled').length,
  };

  if (loading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="h-28 bg-violet-50 rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-violet-50 rounded-2xl" />)}
        </div>
        <div className="h-96 bg-violet-50 rounded-2xl" />
      </div>
    );
  }

  const STAT_CARDS = [
    { label: 'Total Bookings', value: stats.total, icon: BookOpen, gradient: 'linear-gradient(135deg,#7c3aed,#4f46e5)', border: 'border-violet-100' },
    { label: 'Active Bookings', value: stats.active, icon: Clock, gradient: 'linear-gradient(135deg,#0891b2,#0e7490)', border: 'border-cyan-100' },
    { label: 'Completed', value: stats.completed, icon: CheckCircle, gradient: 'linear-gradient(135deg,#10b981,#059669)', border: 'border-emerald-100' },
    { label: 'Cancelled', value: stats.cancelled, icon: XCircle, gradient: 'linear-gradient(135deg,#f43f5e,#e11d48)', border: 'border-rose-100' },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-violet-50 p-6"
        style={{ boxShadow: '0 2px 12px rgba(109,40,217,0.06)' }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BookOpen size={16} className="text-violet-500" />
              <span className="text-xs font-bold uppercase tracking-widest text-violet-500">Hospital Portal</span>
            </div>
            <h2 className="text-2xl font-black text-gray-900">Booking History</h2>
            <p className="text-sm text-gray-500 mt-0.5">Manage and track all previous bed reservations.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={() => handleOpenForm()}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white flex items-center gap-2 transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', boxShadow: '0 4px 14px rgba(109,40,217,0.3)' }}>
              <Plus size={16} /> Add New Booking
            </button>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-50 border border-violet-100">
              <BarChart3 size={16} className="text-violet-500" />
              <span className="text-sm font-bold text-violet-600">Analytics Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STAT_CARDS.map((c, i) => (
          <div key={i} className={`bg-white p-5 rounded-2xl border ${c.border} card-shadow flex flex-col gap-2`}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: c.gradient }}>
              <c.icon size={18} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{c.label}</p>
              <p className="text-2xl font-black text-gray-900">{c.value.toString().padStart(2, '0')}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-violet-50 p-5"
        style={{ boxShadow: '0 2px 12px rgba(109,40,217,0.06)' }}>
        <BookingFilters
          searchQ={searchQ} setSearchQ={setSearchQ}
          statusFilter={statusFilter} setStatusFilter={setStatusFilter}
          typeFilter={typeFilter} setTypeFilter={setTypeFilter}
          paymentFilter={paymentFilter} setPaymentFilter={setPaymentFilter}
          dateFilter={dateFilter} setDateFilter={setDateFilter}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-violet-50 overflow-hidden"
        style={{ boxShadow: '0 2px 12px rgba(109,40,217,0.06)' }}>
        {pagedBookings.length > 0 ? (
          <>
            <div className="hidden md:block">
              <BookingTable bookings={pagedBookings} onViewDetails={setSelectedBooking}
                onEdit={handleOpenForm} onCancel={handleCancelBooking}
                onDownloadReceipt={handleDownloadReceipt} onDelete={handleDeleteBooking}
                sortConfig={sortConfig} onSort={handleSort} />
            </div>
            <div className="md:hidden p-4 space-y-4">
              {pagedBookings.map(b => (
                <BookingCardMobile key={b.bookingId} booking={b} onViewDetails={setSelectedBooking}
                  onEdit={handleOpenForm} onCancel={handleCancelBooking}
                  onDownloadReceipt={handleDownloadReceipt} onDelete={handleDeleteBooking} />
              ))}
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, sortedBookings.length)} of {sortedBookings.length}
              </span>
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                  className="p-2 border border-gray-200 rounded-lg hover:border-violet-400 hover:bg-violet-50 disabled:opacity-30 transition-all">
                  <ChevronLeft size={16} className="text-gray-500" />
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button key={i} onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all border
                      ${currentPage === i + 1 ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-gray-500 border-gray-200 hover:border-violet-400'}`}>
                    {i + 1}
                  </button>
                ))}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                  className="p-2 border border-gray-200 rounded-lg hover:border-violet-400 hover:bg-violet-50 disabled:opacity-30 transition-all">
                  <ChevronRight size={16} className="text-gray-500" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-violet-50 border border-dashed border-violet-200 flex items-center justify-center mx-auto mb-4">
              <Search size={24} className="text-violet-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No bookings found</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">Try adjusting your filters or search query.</p>
            <button onClick={() => { setSearchQ(''); setStatusFilter('All'); setTypeFilter('All'); setPaymentFilter('All'); setDateFilter(''); }}
              className="mt-4 text-violet-600 font-bold text-sm hover:text-violet-800 transition-colors">
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <BookingDetailsModal open={!!selectedBooking} onClose={() => setSelectedBooking(null)} booking={selectedBooking} />
      {isFormModalOpen && (
        <BookingFormModal open={isFormModalOpen}
          onClose={() => { setIsFormModalOpen(false); setEditingBooking(null); }}
          onSave={handleSaveBooking} booking={editingBooking}
          key={editingBooking?.bookingId || 'new-booking'} />
      )}
    </div>
  );
}
