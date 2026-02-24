import { useState, useEffect, useCallback } from 'react';
import { Send, CheckCircle, AlertTriangle, Info, Clock, User, Users } from 'lucide-react';
import { NotificationsService } from '../../services/notifications.service';
import type { SentNotification } from '../../services/notifications.service';

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' });
}

interface ProjectOption { id: string; title: string }
interface SectionOption { id: string; name: string; contractorCount: number }

export default function ConsultantNotifications() {
    const [activeTab, setActiveTab] = useState<'received' | 'sent'>('sent');
    const [composeOpen, setComposeOpen] = useState(false);

    // Data state
    const [projects, setProjects] = useState<ProjectOption[]>([]);
    const [sections, setSections] = useState<SectionOption[]>([]);
    const [sentNotifications, setSentNotifications] = useState<SentNotification[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Compose form state
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [selectedSectionId, setSelectedSectionId] = useState('');
    const [composeTitle, setComposeTitle] = useState('');
    const [composeMessage, setComposeMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [sendError, setSendError] = useState('');
    const [sendSuccess, setSendSuccess] = useState('');

    // Load projects and sent notifications on mount
    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            try {
                const [projs, sent] = await Promise.all([
                    NotificationsService.getConsultantProjects(),
                    NotificationsService.getConsultantSentNotifications(),
                ]);
                setProjects(projs);
                setSentNotifications(sent);
            } catch (err) {
                console.error('Failed to load consultant notifications data', err);
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);

    // Load sections when project changes
    useEffect(() => {
        if (!selectedProjectId) {
            setSections([]);
            setSelectedSectionId('');
            return;
        }
        const loadSections = async () => {
            const data = await NotificationsService.getProjectSectionsWithContractors(selectedProjectId);
            setSections(data);
            setSelectedSectionId('');
        };
        loadSections();
    }, [selectedProjectId]);

    const handleSend = useCallback(async () => {
        setSendError('');
        setSendSuccess('');

        if (!selectedSectionId) {
            setSendError('Please select a section.');
            return;
        }
        if (!composeTitle.trim()) {
            setSendError('Please enter a subject.');
            return;
        }
        if (!composeMessage.trim()) {
            setSendError('Please enter a message.');
            return;
        }

        const section = sections.find(s => s.id === selectedSectionId);
        if (section && section.contractorCount === 0) {
            setSendError('This section has no contractors assigned.');
            return;
        }

        setIsSending(true);
        try {
            await NotificationsService.sendNotification(
                selectedSectionId,
                composeTitle.trim(),
                composeMessage.trim()
            );

            setSendSuccess('Notification sent successfully!');
            setComposeTitle('');
            setComposeMessage('');
            setSelectedSectionId('');

            // Refresh sent list
            const sent = await NotificationsService.getConsultantSentNotifications();
            setSentNotifications(sent);

            setTimeout(() => {
                setSendSuccess('');
                setComposeOpen(false);
            }, 2000);
        } catch (err) {
            console.error('Send notification failed', err);
            setSendError('Failed to send notification. Please try again.');
        } finally {
            setIsSending(false);
        }
    }, [selectedSectionId, composeTitle, composeMessage, sections]);

    const selectedSection = sections.find(s => s.id === selectedSectionId);

    if (isLoading) {
        return (
            <div className="max-w-5xl mx-auto space-y-4 animate-pulse">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
                {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>)}
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications &amp; Messages</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Stay updated on your assigned projects ({projects.length}) and send notifications to contractors.</p>
                </div>
                <button
                    onClick={() => setComposeOpen(!composeOpen)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none font-medium text-sm"
                >
                    <Send className="h-4 w-4" /> Send Message
                </button>
            </div>

            {/* Compose Area - Toggleable */}
            {composeOpen && (
                <div className="glass-card p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 animate-slide-down">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">New Message</h3>
                    <div className="grid gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project</label>
                            <select
                                value={selectedProjectId}
                                onChange={(e) => setSelectedProjectId(e.target.value)}
                                className="block w-full border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white sm:text-sm p-2.5"
                            >
                                <option value="">Select Project...</option>
                                {projects.map(p => (
                                    <option key={p.id} value={p.id}>{p.title}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Section (recipients)</label>
                            <select
                                value={selectedSectionId}
                                onChange={(e) => setSelectedSectionId(e.target.value)}
                                disabled={!selectedProjectId || sections.length === 0}
                                className="block w-full border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white sm:text-sm p-2.5 disabled:opacity-50"
                            >
                                <option value="">
                                    {!selectedProjectId ? 'Select a project first...' : sections.length === 0 ? 'No sections found' : 'Select Section...'}
                                </option>
                                {sections.map(s => (
                                    <option key={s.id} value={s.id}>
                                        {s.name} ({s.contractorCount} contractor{s.contractorCount !== 1 ? 's' : ''})
                                    </option>
                                ))}
                            </select>
                            {selectedSection && selectedSection.contractorCount > 0 && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                                    <Users className="h-3 w-3 mr-1" />
                                    Will be sent to {selectedSection.contractorCount} contractor{selectedSection.contractorCount !== 1 ? 's' : ''} assigned to this section
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                            <input
                                type="text"
                                value={composeTitle}
                                onChange={(e) => setComposeTitle(e.target.value)}
                                placeholder="e.g. Site Inspection Required"
                                className="block w-full border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white sm:text-sm p-2.5"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
                            <textarea
                                rows={4}
                                value={composeMessage}
                                onChange={(e) => setComposeMessage(e.target.value)}
                                placeholder="Type your notification message..."
                                className="block w-full border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white sm:text-sm p-2.5"
                            ></textarea>
                        </div>
                        {sendError && (
                            <div className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                <AlertTriangle className="h-4 w-4" /> {sendError}
                            </div>
                        )}
                        {sendSuccess && (
                            <div className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                                <CheckCircle className="h-4 w-4" /> {sendSuccess}
                            </div>
                        )}
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => { setComposeOpen(false); setSendError(''); setSendSuccess(''); }}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSend}
                                disabled={isSending}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSending ? 'Sending...' : 'Send Notification'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* List */}
            <div className="glass-card rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setActiveTab('received')}
                        className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors ${activeTab === 'received' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                            }`}
                    >
                        Received (0)
                    </button>
                    <button
                        onClick={() => setActiveTab('sent')}
                        className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors ${activeTab === 'sent' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                            }`}
                    >
                        Sent History ({sentNotifications.length})
                    </button>
                </div>

                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {activeTab === 'received' ? (
                        /* Received tab — Consultants don't receive notifications in this system;
                           the notifications table only stores consultant→contractor messages.
                           Show a graceful empty state. */
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                            <Info className="h-8 w-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                            No received notifications. Submission updates appear on the verification queue.
                        </div>
                    ) : (
                        sentNotifications.length > 0 ? (
                            sentNotifications.map(item => (
                                <div key={item.id} className="p-4 flex gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <div className="p-2 rounded-full h-fit bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                                        <Send className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{item.title}</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">{item.message}</p>
                                        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                            {item.sectionName && (
                                                <span className="flex items-center">
                                                    <User className="h-3 w-3 mr-1" />
                                                    {item.sectionName}
                                                </span>
                                            )}
                                            {item.projectTitle && (
                                                <span className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">{item.projectTitle}</span>
                                            )}
                                            <span className="flex items-center">
                                                <Clock className="h-3 w-3 mr-1" /> {timeAgo(item.created_at)}
                                            </span>
                                            <span className="flex items-center">
                                                <Users className="h-3 w-3 mr-1" /> {item.recipientCount} recipient{item.recipientCount !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                No sent messages yet. Use the "Send Message" button to notify contractors.
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
