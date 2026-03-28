import React, { useState, useEffect, useCallback } from 'react';
import { Cinema3D } from './components/Cinema3D';
import { BookingForm } from './components/BookingForm';
import { AdminPanel } from './components/AdminPanel';
import { Bookings, ROW_CONFIG, ROWS } from './types';
import { Settings, Info, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [bookings, setBookings] = useState<Bookings>({});
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [bookingQuantity, setBookingQuantity] = useState(1);
  const [justBookedSeats, setJustBookedSeats] = useState<string[]>([]);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Fetch initial bookings
  useEffect(() => {
    fetch('/api/bookings')
      .then(res => res.json())
      .then(data => setBookings(data))
      .catch(err => console.error('Failed to fetch bookings:', err));

    // WebSocket for real-time updates
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'UPDATE') {
        setBookings(data.bookings);
      }
    };

    return () => ws.close();
  }, []);

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const updateSelection = useCallback((startId: string, quantity: number) => {
    const [row, numStr] = startId.split('-');
    const startNum = parseInt(numStr);
    const rowMax = ROW_CONFIG[row];
    
    // Try to find 'quantity' number of available seats in the same row
    // starting from startNum and looking right, then left if needed.
    let finalSeats: string[] = [];
    
    // First, try to get consecutive seats to the right
    for (let i = 0; i < quantity; i++) {
      const nextNum = startNum + i;
      if (nextNum <= rowMax) {
        const nextId = `${row}-${nextNum}`;
        if (!bookings[nextId]) {
          finalSeats.push(nextId);
        }
      }
    }
    
    // If we don't have enough, try looking to the left of the start seat
    if (finalSeats.length < quantity) {
      for (let i = 1; i < quantity; i++) {
        const prevNum = startNum - i;
        if (prevNum >= 1) {
          const prevId = `${row}-${prevNum}`;
          if (!bookings[prevId] && !finalSeats.includes(prevId)) {
            finalSeats.unshift(prevId); // Add to the beginning to keep order
          }
        }
        if (finalSeats.length >= quantity) break;
      }
    }

    // Limit to requested quantity
    setSelectedSeats(finalSeats.slice(0, quantity));
  }, [bookings]);

  const handleSeatSelect = (id: string) => {
    if (bookings[id]) {
      if (isAdmin) {
        if (window.confirm(`Bạn đang ở chế độ Admin. Bạn có muốn xóa đặt chỗ của ghế ${id}?`)) {
          handleAdminDelete('130613', id);
        }
      } else {
        showToast('error', 'Ghế này đã có người đặt. Vui lòng chọn ghế khác!');
      }
      return;
    }

    if (selectedSeats.includes(id) && (selectedSeats.length === 1 || id === selectedSeats[0])) {
      setSelectedSeats([]);
      setShowBookingForm(false);
      setBookingQuantity(1);
    } else {
      updateSelection(id, bookingQuantity);
      setShowBookingForm(true);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    setBookingQuantity(newQuantity);
    if (selectedSeats.length > 0) {
      updateSelection(selectedSeats[0], newQuantity);
    }
  };

  const handleBook = async (name: string) => {
    if (!name.trim()) {
      showToast('error', 'Vui lòng nhập họ và tên!');
      return;
    }
    if (selectedSeats.length === 0) {
      showToast('error', 'Vui lòng chọn ít nhất một ghế!');
      return;
    }
    setIsLoading(true);
    const finalSeats = [...selectedSeats];

    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, seats: finalSeats }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast('success', `Đặt vé thành công cho ${finalSeats.length} ghế!`);
        setJustBookedSeats(finalSeats);
        setSelectedSeats([]);
        setShowBookingForm(false);
        
        // Clear highlight after 5 seconds
        setTimeout(() => setJustBookedSeats([]), 5000);
      } else {
        showToast('error', data.error || 'Có lỗi xảy ra!');
      }
    } catch (err) {
      showToast('error', 'Không thể kết nối tới máy chủ!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminClear = async (password: string) => {
    try {
      const res = await fetch('/api/admin/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) showToast('success', 'Đã xóa toàn bộ danh sách đặt chỗ!');
      else showToast('error', 'Mật khẩu sai hoặc lỗi hệ thống!');
    } catch (err) {
      showToast('error', 'Lỗi kết nối!');
    }
  };

  const handleAdminDelete = async (password: string, seatId: string) => {
    try {
      const res = await fetch('/api/admin/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, seatId }),
      });
      if (res.ok) showToast('success', `Đã xóa ghế ${seatId}!`);
      else showToast('error', 'Lỗi hệ thống!');
    } catch (err) {
      showToast('error', 'Lỗi kết nối!');
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-red-500/30">
      {/* Header */}
      <header className="p-6 flex justify-between items-center border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-900/20">
            <CheckCircle2 className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">EVENT BTS LIVE VIEWING GOYANG</h1>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">GALAXY PHAN HUY ÍCH</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {isAdmin && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-200">
              <ShieldCheck size={12} /> Admin Mode
            </div>
          )}
          <button 
            onClick={() => setShowAdminPanel(true)}
            className={`p-3 rounded-xl transition-all ${isAdmin ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900'}`}
            title="Admin Panel"
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Legend & Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Info size={16} /> Chú thích
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-6 h-6 bg-red-600 rounded-md shadow-inner" />
                <span className="text-sm font-medium text-slate-700">Ghế trống</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-6 h-6 bg-white border border-slate-200 rounded-md shadow-lg" />
                <span className="text-sm font-medium text-slate-700">Đang chọn</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-6 h-6 bg-black rounded-md relative overflow-hidden">
                  <div className="absolute inset-0 bg-red-400/20 animate-pulse" />
                </div>
                <span className="text-sm font-medium text-slate-700">Đã có người (Cute Character)</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-600/10 to-rose-600/10 p-6 rounded-3xl border border-red-500/20">
            <h3 className="text-sm font-bold text-red-600 uppercase tracking-widest mb-4">Hướng dẫn</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Bấm chọn một ghế trống để bắt đầu đặt vé. Nếu bạn đi cùng bạn bè, hãy nhập số lượng, hệ thống sẽ tự động chọn thêm các ghế kế bên cho bạn!
            </p>
          </div>
        </div>

        {/* 3D Viewport */}
        <div className="lg:col-span-3 h-[600px] relative">
          <Cinema3D 
            bookings={bookings} 
            selectedSeats={selectedSeats} 
            onSeatSelect={handleSeatSelect} 
            justBookedSeats={justBookedSeats}
          />
          
          {/* Floating Instructions */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/60 pointer-events-none">
            Sử dụng chuột để xoay và phóng to
          </div>
        </div>
      </main>

      {/* Booking Form Overlay */}
      {showBookingForm && (
        <BookingForm
          selectedSeats={selectedSeats}
          onBook={handleBook}
          onQuantityChange={handleQuantityChange}
          onCancel={() => { setSelectedSeats([]); setShowBookingForm(false); setBookingQuantity(1); }}
          isLoading={isLoading}
        />
      )}

      {/* Admin Panel Overlay */}
      {showAdminPanel && (
        <AdminPanel
          bookings={bookings}
          onClearAll={handleAdminClear}
          onDeleteSeat={handleAdminDelete}
          onClose={() => setShowAdminPanel(false)}
          onAuthorize={() => setIsAdmin(true)}
          isAuthorizedInitial={isAdmin}
        />
      )}

      {/* Toast Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className={`fixed top-24 right-8 p-4 rounded-2xl shadow-2xl flex items-center gap-3 z-[200] border ${
              notification.type === 'success' 
                ? 'bg-green-600 border-green-500 text-white' 
                : 'bg-red-600 border-red-500 text-white'
            }`}
          >
            {notification.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
            <p className="font-bold">{notification.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="p-12 text-center text-slate-400 text-sm">
        <p>© 2026 Galaxy Cinema Experience • Built with React & Three.js</p>
      </footer>
    </div>
  );
}
