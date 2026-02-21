import { useState, useEffect } from 'react';
import { FileText, Search, Clock, Printer, Download } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ReportTemplate {
    id: string;
    title: string;
    description: string;
    format: string;
    file_size: string | null;
    last_generated_at: string | null;
}

export default function ReportList() {
    const [templates, setTemplates] = useState<ReportTemplate[]>([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        async function fetchReports() {
            try {
                const { data, error } = await supabase
                    .from('report_templates')
                    .select('id, title, description, format, file_size, last_generated_at')
                    .eq('is_active', true)
                    .order('title');

                if (error) throw error;
                setTemplates(data || []);
            } catch (err) {
                console.error('ReportList error:', err);
            }
        }
        fetchReports();
    }, []);

    function timeAgo(dateStr: string | null): string {
        if (!dateStr) return 'Never';
        const diff = Date.now() - new Date(dateStr).getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        return `${days} days ago`;
    }

    const filtered = templates.filter(t => t.title.toLowerCase().includes(search.toLowerCase()) || (t.description || '').toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="glass-card rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Available Reports
                </h3>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Filter reports..."
                        aria-label="Filter reports"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 pr-4 py-1.5 text-xs font-medium border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500/20 outline-none w-full md:w-64"
                    />
                </div>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {filtered.length > 0 ? filtered.map(template => (
                    <div key={template.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group cursor-pointer">
                        <div className="flex items-start gap-5">
                            <div className={`p-3 rounded-xl transition-colors ${template.format === 'PDF' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 group-hover:bg-red-100 dark:group-hover:bg-red-900/30' : 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 group-hover:bg-green-100 dark:group-hover:bg-green-900/30'}`}>
                                <FileText className="h-6 w-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{template.title}</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-lg mt-1">{template.description}</p>
                                <div className="mt-3 flex items-center gap-4 text-xs">
                                    <span className="font-bold text-gray-400 flex items-center">
                                        <Clock className="h-3 w-3 mr-1" /> Last: {timeAgo(template.last_generated_at)}
                                    </span>
                                    <span className="font-bold text-gray-300 dark:text-gray-600">•</span>
                                    <span className="font-bold text-gray-400">{template.file_size || 'Unknown size'}</span>
                                    <span className="font-bold text-gray-300 dark:text-gray-600">•</span>
                                    <span className="font-bold text-gray-400">{template.format}</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 md:mt-0 flex items-center gap-3 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                            <button className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" title="Print" aria-label={`Print ${template.title}`}>
                                <Printer className="h-4 w-4" />
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-bold shadow-lg shadow-gray-900/10 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                                <Download className="h-4 w-4" /> Download
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">No report templates match your search.</div>
                )}
            </div>
        </div>
    );
}
