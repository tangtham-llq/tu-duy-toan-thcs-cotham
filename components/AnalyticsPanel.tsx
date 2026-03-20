

import React, { useState, useEffect } from 'react';
import type { FeedbackStats } from '../types';
import { LoadingSpinner } from './icons';

export const AnalyticsPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [stats, setStats] = useState<FeedbackStats>({ understood: 0, needs_more: 0, too_hard: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch('/api/feedback', { cache: 'no-store' });
                if (!response.ok) {
                    throw new Error(`Failed to fetch stats: ${response.statusText}`);
                }
                const data: FeedbackStats = await response.json();
                setStats(data);
            } catch (error) {
                console.error(error);
                setError('Không thể tải dữ liệu thống kê. Vui lòng thử lại sau.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="fixed inset-0 bg-black/30 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="modal-content w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <header className="header p-4 flex justify-between items-center rounded-t-2xl">
                    <h2 className="text-lg font-bold">Thống kê phản hồi toàn hệ thống</h2>
                    <button onClick={onClose} className="text-white/80 hover:text-white text-2xl leading-none">&times;</button>
                </header>
                <div className="p-6 min-h-[200px] flex items-center justify-center">
                    {isLoading ? (
                        <LoadingSpinner className="w-10 h-10 text-[var(--primary-500)]" />
                    ) : error ? (
                        <p className="text-center text-red-500">{error}</p>
                    ) : (
                        <div>
                            <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                                <div className="p-4 bg-green-50 dark:bg-green-900/50 rounded-lg"><div className="text-3xl font-bold text-green-700 dark:text-green-400">{stats.understood}</div><div className="text-sm text-green-600 dark:text-green-500 mt-1">Em hiểu rồi!</div></div>
                                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/50 rounded-lg"><div className="text-3xl font-bold text-yellow-700 dark:text-yellow-400">{stats.needs_more}</div><div className="text-sm text-yellow-600 dark:text-yellow-500 mt-1">Em cần gợi ý thêm</div></div>
                                <div className="p-4 bg-red-50 dark:bg-red-900/50 rounded-lg"><div className="text-3xl font-bold text-red-700 dark:text-red-400">{stats.too_hard}</div><div className="text-sm text-red-600 dark:text-red-500 mt-1">Khó quá ạ</div></div>
                            </div>
                            <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
                                Số liệu được tổng hợp từ tất cả người dùng để giúp cô cải thiện chất lượng gợi ý.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};