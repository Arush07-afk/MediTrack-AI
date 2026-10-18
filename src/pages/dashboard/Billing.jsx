import React, { useState, useMemo } from 'react';
import { CreditCard, Calendar, ShieldCheck, Search, Plus, IndianRupee } from 'lucide-react';
import { mockInvoices } from '../../mockdata/mockInvoices';
import InvoiceTable from '../../components/billing/InvoiceTable';
import InvoiceModal from '../../components/billing/InvoiceModal';
import InvoiceFormModal from '../../components/billing/InvoiceFormModal';

export default function Billing() {
  const [searchQ, setSearchQ] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoices, setInvoices] = useState(mockInvoices);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);

  const filteredInvoices = useMemo(() => {
    if (!searchQ.trim()) return invoices;
    const q = searchQ.trim().toLowerCase();
    return invoices.filter(inv =>
      inv.id.toLowerCase().includes(q) || inv.description.toLowerCase().includes(q)
    );
  }, [searchQ, invoices]);

  const totalSpent = useMemo(() => {
    return invoices
      .filter(inv => inv.status === 'Paid')
      .reduce((sum, inv) => {
        const amount = Number(inv.amount.replace(/[^0-9.]/g, ''));
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);
  }, [invoices]);

  const lastPayment = useMemo(() => {
    const paid = invoices.filter(inv => inv.status === 'Paid');
    if (!paid.length) return null;
    return paid.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  }, [invoices]);

  const handleOpenCreateForm = () => { setEditingInvoice(null); setIsFormOpen(true); };
  const handleOpenEditForm = (inv) => { setEditingInvoice(inv); setIsFormOpen(true); };
  const handleDeleteClick = (id) => setInvoiceToDelete(id);
  const confirmDelete = () => {
    if (invoiceToDelete) { setInvoices(prev => prev.filter(inv => inv.id !== invoiceToDelete)); setInvoiceToDelete(null); }
  };
  const handleSaveInvoice = (data) => {
    if (editingInvoice) {
      setInvoices(prev => prev.map(inv => inv.id === editingInvoice.id ? { ...data, id: inv.id } : inv));
    } else {
      setInvoices(prev => [{ ...data, id: `INV-${Math.floor(1000 + Math.random() * 9000)}` }, ...prev]);
    }
    setIsFormOpen(false);
    setEditingInvoice(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-violet-50 shadow-sm min-h-[500px]"
      style={{ boxShadow: '0 2px 12px rgba(109,40,217,0.06)' }}>

      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <IndianRupee size={16} className="text-violet-500" />
            <span className="text-xs font-bold uppercase tracking-widest text-violet-500">Finance</span>
          </div>
          <h2 className="text-xl font-black text-gray-900">Billing & Invoices</h2>
          <p className="text-sm text-gray-500 mt-0.5">View your billing history and manage invoices.</p>
        </div>
        <button onClick={handleOpenCreateForm}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', boxShadow: '0 4px 14px rgba(109,40,217,0.3)' }}>
          <Plus size={16} /> Add Invoice
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-slate-50/60 border-b border-gray-100">
        <div className="bg-white p-5 rounded-xl border border-violet-100 flex items-center gap-4 card-shadow">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
            <CreditCard size={22} className="text-white" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Spent</p>
            <p className="text-xl font-black text-gray-900 mt-0.5">₹{totalSpent.toLocaleString('en-IN')}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-emerald-100 flex items-center gap-4 card-shadow">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
            <Calendar size={22} className="text-white" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Last Payment</p>
            {lastPayment ? (
              <>
                <p className="text-base font-black text-gray-900 mt-0.5">{lastPayment.amount}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">on {lastPayment.date}</p>
              </>
            ) : (
              <p className="text-sm font-bold text-gray-400 mt-0.5">No payments yet</p>
            )}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-purple-100 flex items-center gap-4 card-shadow">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
            <ShieldCheck size={22} className="text-white" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Active Plan</p>
            <p className="text-base font-black text-gray-900 mt-0.5 truncate max-w-[160px]">Hospital Dashboard Pro</p>
          </div>
        </div>
      </div>

      {/* Invoices */}
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
          <h3 className="text-base font-bold text-gray-900">Invoice History</h3>
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 w-full sm:w-64
            focus-within:ring-2 focus-within:ring-violet-400 focus-within:border-violet-400 transition-all">
            <Search size={15} className="text-gray-400 shrink-0" />
            <input type="text" placeholder="Search by ID or description..."
              value={searchQ} onChange={e => setSearchQ(e.target.value)}
              className="text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none w-full bg-transparent" />
          </div>
        </div>
        <InvoiceTable invoices={filteredInvoices} onView={inv => setSelectedInvoice(inv)}
          onEdit={handleOpenEditForm} onDelete={handleDeleteClick} />
      </div>

      {/* Modals */}
      <InvoiceModal open={!!selectedInvoice} onClose={() => setSelectedInvoice(null)} invoice={selectedInvoice} />
      <InvoiceFormModal
        key={editingInvoice ? editingInvoice.id : 'new-invoice'}
        open={isFormOpen} onClose={() => setIsFormOpen(false)}
        onSave={handleSaveInvoice} editingInvoice={editingInvoice} />

      {/* Delete confirm */}
      {invoiceToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setInvoiceToDelete(null)} />
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm relative z-10 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Invoice</h3>
            <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete this invoice? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setInvoiceToDelete(null)}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm transition-colors">
                Cancel
              </button>
              <button onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl text-sm transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
