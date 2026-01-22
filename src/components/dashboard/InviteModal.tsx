
import { Mail, UserPlus, X, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface InviteModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function InviteModal({ isOpen, onClose }: InviteModalProps) {
    const [role, setRole] = useState('CONTRACTOR');
    const [email, setEmail] = useState('');
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const copyLink = () => {
        navigator.clipboard.writeText('https://pms.ptdf.gov.ng/invite/t-x7a9-z3v4');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative border border-white/20 animate-in fade-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="p-8">
                    <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6">
                        <UserPlus className="h-7 w-7 text-indigo-600" />
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 flex items-center">
                        Invite Collaborator
                    </h3>
                    <p className="text-sm text-gray-500 mt-2">
                        Select role for the collaborators you want to invite. Bulk invitation can be sent for collaborators of the same role.
                    </p>

                    <div className="mt-8 space-y-6">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Select User Role</label>
                            <div className="grid grid-cols-4 gap-2">
                                {['ADMIN', 'CONSULTANT', 'CONTRACTOR', 'STAFF'].map(r => (
                                    <button
                                        key={r}
                                        onClick={() => setRole(r)}
                                        className={`py-2 text-[10px] font-bold rounded-lg border transition-all ${role === r
                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100'
                                            : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'
                                            }`}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="email"
                                    placeholder="Enter collaborator email..."
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 text-sm border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-gray-50/50 border outline-none"
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xl shadow-indigo-100 active:scale-95 transition-all text-sm uppercase tracking-widest"
                            >
                                Send Invitation
                            </button>
                        </div>

                        <div className="relative py-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-100"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase font-bold text-gray-300">
                                <span className="bg-white px-4">Or Share Link</span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <div className="flex-1 bg-gray-50 rounded-xl px-4 py-3 text-xs font-medium text-gray-400 truncate flex items-center">
                                pms.ptdf.gov.ng/invite/t-x7a9-z3v4
                            </div>
                            <button
                                onClick={copyLink}
                                className={`p-3 rounded-xl border transition-all ${copied ? 'bg-green-50 border-green-200 text-green-600' : 'bg-white border-gray-100 text-gray-400 hover:bg-gray-50'}`}
                            >
                                {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
