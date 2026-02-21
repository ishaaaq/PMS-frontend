import { useState, useEffect } from 'react';
import { FileSpreadsheet, Download, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AuditLogModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface AuditLogEntry {
    id: string;
    action: string;
    details: string | null;
    created_at: string;
    actor_user_id: string;
    actor_name?: string;
    actor_initials?: string;
}

export default function AuditLogModal({ isOpen, onClose }: AuditLogModalProps) {
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isOpen) return;
        async function loadLogs() {
            try {
                const { data, error } = await supabase
                    .from('audit_logs')
                    .select(`id, action, project_id, actor_user_id, created_at, actor:actor_user_id ( full_name )`)
                    .order('created_at', { ascending: false })
                    .limit(20);

                if (error) {
                    console.warn('audit_logs query failed, trying simple:', error);
                    const { data: simple } = await supabase
                        .from('audit_logs')
                        .select('*')
                        .order('created_at', { ascending: false })
                        .limit(20);
                    setLogs((simple || []).map((l: Record<string, unknown>) => ({
                        id: l.id as string,
                        action: l.action as string,
                        details: null,
                        created_at: l.created_at as string,
                        actor_user_id: l.actor_user_id as string,
                        actor_name: 'System',
                        actor_initials: 'SY',
                    })));
                } else {
                    setLogs((data || []).map((l: Record<string, unknown>) => {
                        const actor = l.actor as { full_name?: string } | null;
                        const name = actor?.full_name || 'System';
                        return {
                            id: l.id as string,
                            action: l.action as string,
                            details: null,
                            created_at: l.created_at as string,
                            actor_user_id: l.actor_user_id as string,
                            actor_name: name,
                            actor_initials: name.split(' ').map(w => w[0]).join('').substring(0, 2),
                        };
                    }));
                }
            } catch (err) {
                console.error('AuditLog load error:', err);
            } finally {
                setLoading(false);
            }
        }
        loadLogs();
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-[70] pointer-events-none p-4">
            <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-4xl pointer-events-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-700 flex flex-col max-h-[80vh] relative z-10">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <FileSpreadsheet className="h-5 w-5 text-indigo-500" /> System Audit Log
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Track all financial movements and system actions</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-lg text-gray-400 transition-colors" title="Export CSV" aria-label="Export Audit Log">
                            <Download className="h-4 w-4" />
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-gray-400 hover:text-red-500 transition-colors" aria-label="Close Modal">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-0">
                    {loading ? (
                        <div className="p-8 space-y-4 animate-pulse">
                            {[1, 2, 3, 4].map(i => <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>)}
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
                            <thead className="bg-gray-50 dark:bg-gray-800/50 sticky top-0">
                                <tr>
                                    <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Timestamp</th>
                                    <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                                    <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                                {logs.length > 0 ? logs.map(log => (
                                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400 font-mono text-xs">
                                            {new Date(log.created_at).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-xs text-indigo-600 dark:text-indigo-400 font-bold">
                                                    {log.actor_initials}
                                                </div>
                                                {log.actor_name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                                            {log.action.replace(/_/g, ' ')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                Success
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-gray-400">No audit logs found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30 text-center text-xs text-gray-500">
                    Showing last {logs.length} entries. <span className="text-indigo-600 cursor-pointer hover:underline">View Archive</span>
                </div>
            </div>
        </div>
    );
}
