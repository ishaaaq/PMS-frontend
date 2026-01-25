import { useState } from 'react';
import { FileText, Download, Filter, Printer } from 'lucide-react';

export default function ConsultantReports() {
    const [selectedTemplate, setSelectedTemplate] = useState('site-progress');

    const templates = [
        { id: 'site-progress', name: 'Weekly Site Progress Report', desc: 'Summary of work done, materials used, and milestones status.' },
        { id: 'incident', name: 'Incident / Risk Report', desc: 'Log of safety incidents, risks, or weather delays.' },
        { id: 'financial', name: 'Milestone Valuation Certificate', desc: 'Formal valuation for completed milestones to process payments.' },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Report Generator</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Create and issue formal reports for your projects.</p>
                </div>
            </div>

            {/* Template Selection */}
            <div className="grid gap-4 md:grid-cols-3">
                {templates.map(t => (
                    <div
                        key={t.id}
                        onClick={() => setSelectedTemplate(t.id)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedTemplate === t.id
                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 shadow-sm'
                            : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                            }`}
                    >
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center mb-3 ${selectedTemplate === t.id ? 'bg-indigo-200 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                            }`}>
                            <FileText className="h-6 w-6" />
                        </div>
                        <h3 className={`font-bold text-sm mb-1 ${selectedTemplate === t.id ? 'text-indigo-900 dark:text-indigo-400' : 'text-gray-900 dark:text-white'}`}>
                            {t.name}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-snug">{t.desc}</p>
                    </div>
                ))}
            </div>

            {/* Configuration Form */}
            <div className="glass-card rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <Filter className="h-5 w-5 text-gray-400" />
                    Report Parameters
                </h3>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Project</label>
                        <select className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                            <option>ICT Center Construction (Lagos)</option>
                            <option>Solar Mini-Grid (Kano)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                        <input type="date" className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:[color-scheme:dark]" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                        <input type="date" className="w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:[color-scheme:dark]" />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Include Sections</label>
                        <div className="flex gap-4 mt-2">
                            <label className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mr-2" defaultChecked />
                                Site Photos
                            </label>
                            <label className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mr-2" defaultChecked />
                                Contractor Submissions
                            </label>
                            <label className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mr-2" defaultChecked />
                                Financial Summary
                            </label>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                    <button className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium">
                        <Printer className="h-4 w-4 mr-2" />
                        Print Preview
                    </button>
                    <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm hover:shadow">
                        <Download className="h-4 w-4 mr-2" />
                        Generate PDF
                    </button>
                </div>
            </div>
        </div>
    );
}
