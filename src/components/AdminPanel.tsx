import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, Trash2, ShieldCheck, X, RefreshCw } from 'lucide-react';
import { Bookings } from '../types';

interface AdminPanelProps {
  bookings: Bookings;
  onClearAll: (password: string) => void;
  onDeleteSeat: (password: string, seatId: string) => void;
  onClose: () => void;
  onAuthorize: () => void;
  isAuthorizedInitial: boolean;
}

export const AdminPanel = ({ bookings, onClearAll, onDeleteSeat, onClose, onAuthorize, isAuthorizedInitial }: AdminPanelProps) => {
  const [password, setPassword] = useState(isAuthorizedInitial ? '130613' : '');
  const [isAuthorized, setIsAuthorized] = useState(isAuthorizedInitial);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '130613') {
      setIsAuthorized(true);
      onAuthorize();
      setError('');
    } else {
      setError('Mật khẩu không chính xác!');
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ danh sách đặt chỗ?')) {
      onClearAll(password);
    }
  };

  const handleDeleteSeat = (seatId: string) => {
    if (window.confirm(`Xóa đặt chỗ cho ghế ${seatId}?`)) {
      onDeleteSeat(password, seatId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200"
      >
        <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
            <Settings className="text-slate-400" />
            <h2 className="text-xl font-bold">Quản lý Rạp chiếu phim</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-8">
          {!isAuthorized ? (
            <form onSubmit={handleLogin} className="max-w-xs mx-auto space-y-6 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck size={40} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">Yêu cầu xác thực Admin</h3>
              <div className="space-y-2">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none transition-all text-center text-lg tracking-widest"
                  autoFocus
                />
                {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all active:scale-95"
              >
                Đăng nhập
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  Danh sách đặt chỗ ({Object.keys(bookings).length})
                </h3>
                <button
                  onClick={handleClearAll}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-bold text-sm"
                >
                  <RefreshCw size={16} /> Xóa toàn bộ
                </button>
              </div>

              <div className="max-h-[400px] overflow-y-auto rounded-xl border border-slate-100">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 sticky top-0">
                    <tr>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Ghế</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Người đặt</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Thời gian</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {Object.entries(bookings)
                      .sort((a, b) => b[1].timestamp - a[1].timestamp)
                      .map(([id, booking]) => (
                        <tr key={id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 font-bold text-slate-700">{id}</td>
                          <td className="p-4 text-slate-600">{booking.name}</td>
                          <td className="p-4 text-slate-400 text-sm">
                            {new Date(booking.timestamp).toLocaleTimeString()}
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleDeleteSeat(id)}
                              className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    {Object.keys(bookings).length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-12 text-center text-slate-400 italic">
                          Chưa có ghế nào được đặt.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
