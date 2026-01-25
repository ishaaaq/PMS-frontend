import { FileText, Search, Clock, Printer, Download } from 'lucide-react';
import { REPORT_TEMPLATES } from '../../utils/mockData';

export default function ReportList() {
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
                        className="pl-9 pr-4 py-1.5 text-xs font-medium border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-indigo-500/20 outline-none w-full md:w-64"
                    />
                </div>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {REPORT_TEMPLATES.map(template => (
                    <div key={template.title} className="p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group cursor-pointer">
                        <div className="flex items-start gap-5">
                            <div className={`p-3 rounded-xl transition-colors ${template.type === 'PDF' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 group-hover:bg-red-100 dark:group-hover:bg-red-900/30' : 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 group-hover:bg-green-100 dark:group-hover:bg-green-900/30'}`}>
                                <FileText className="h-6 w-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{template.title}</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-lg mt-1">{template.description}</p>
                                <div className="mt-3 flex items-center gap-4 text-xs">
                                    <span className="font-bold text-gray-400 flex items-center">
                                        <Clock className="h-3 w-3 mr-1" /> Last: {template.lastGenerated}
                                    </span>
                                    <span className="font-bold text-gray-300 dark:text-gray-600">•</span>
                                    <span className="font-bold text-gray-400">{template.size}</span>
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
                ))}
            </div>
        </div>
    );
}
