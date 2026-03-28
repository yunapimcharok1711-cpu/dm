import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Users, CheckCircle2, X } from 'lucide-react';

interface BookingFormProps {
  selectedSeats: string[];
  onBook: (name: string) => void;
  onQuantityChange: (quantity: number) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export const BookingForm = ({ selectedSeats, onBook, onQuantityChange, onCancel, isLoading }: BookingFormProps) => {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && quantity > 0) {
      onBook(name);
    }
  };

  const handleQuantityChange = (val: string) => {
    const newQty = parseInt(val) || 1;
    setQuantity(newQty);
    onQuantityChange(newQty);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-8 right-8 w-80 bg-white rounded-2xl shadow-2xl p-6 border border-slate-200 z-50"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-800">Xác nhận đặt vé</h3>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
          <p className="text-sm text-slate-500 mb-1">Ghế đã chọn:</p>
          <div className="flex flex-wrap gap-1">
            {selectedSeats.map(id => (
              <span key={id} className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded border border-green-200">
                {id}
              </span>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
              <User size={14} /> Họ và tên <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên của bạn..."
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
              <Users size={14} /> Số lượng <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2 mb-2 overflow-x-auto pb-1 no-scrollbar">
              {[1, 2, 4, 8, 10].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleQuantityChange(num.toString())}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                    quantity === num 
                      ? 'bg-green-600 border-green-600 text-white shadow-md' 
                      : 'bg-white border-slate-200 text-slate-600 hover:border-green-500'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
            <input
              type="number"
              min="1"
              max="20"
              value={quantity}
              onChange={(e) => handleQuantityChange(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              required
            />
            <p className="text-[10px] text-slate-400 mt-1 italic">
              * Hệ thống sẽ tự động chọn thêm ghế kế bên trong cùng một hàng.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || !name.trim() || quantity < 1}
            className={`w-full py-3 rounded-lg font-bold text-white flex items-center justify-center gap-2 transition-all ${
              isLoading || !name.trim() || quantity < 1 ? 'bg-slate-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 active:scale-95 shadow-lg shadow-green-200'
            }`}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle2 size={18} /> Xác nhận & Gửi
              </>
            )}
          </button>
        </form>
      </motion.div>
    </AnimatePresence>
  );
};
