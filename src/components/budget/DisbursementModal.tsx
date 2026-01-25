import { Check, Shield, Smartphone, X, CreditCard } from 'lucide-react';
import { useState } from 'react';

interface DisbursementModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function DisbursementModal({ isOpen, onClose }: DisbursementModalProps) {
    const [step, setStep] = useState<'form' | 'mfa' | 'success'>('form');
    const [isProcessing, setIsProcessing] = useState(false);
    const [mfaCode, setMfaCode] = useState(['', '', '', '', '', '']);

    if (!isOpen) return null;

    const handleInitialSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        // Simulate initial check
        setTimeout(() => {
            setIsProcessing(false);
            setStep('mfa');
        }, 1000);
    };

    const handleMfaSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        // Simulate verification
        setTimeout(() => {
            setIsProcessing(false);
            setStep('success');
            setTimeout(() => {
                resetInternalState();
                onClose();
            }, 3000);
        }, 1500);
    };

    const handleMfaChange = (index: number, value: string) => {
        if (value.length > 1) return;
        const newCode = [...mfaCode];
        newCode[index] = value;
        setMfaCode(newCode);

        // Auto-focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`mfa-${index + 1}`);
            nextInput?.focus();
        }
    };

    const resetInternalState = () => {
        setStep('form');
        setMfaCode(['', '', '', '', '', '']);
    };

    const handleClose = () => {
        resetInternalState();
        onClose();
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-[70] pointer-events-none p-4">
            <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={handleClose} />
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-md pointer-events-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-700 relative z-10">
                {step === 'success' ? (
                    <div className="p-12 text-center flex flex-col items-center justify-center animate-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                            <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Disbursement Initiated!</h3>
                        <p className="text-gray-500 dark:text-gray-400">Funds have been queued and verified.</p>
                    </div>
                ) : step === 'mfa' ? (
                    <div className="animate-in slide-in-from-right duration-300">
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Shield className="h-5 w-5 text-indigo-500" /> Security Verification
                            </h3>
                            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-8 text-center">
                            <div className="mb-6 flex justify-center">
                                <div className="h-12 w-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                                    <Smartphone className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                                </div>
                            </div>
                            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Enter Authentication Code</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Enter the 6-digit code sent to your authenticator app to authorize this transaction.</p>

                            <form onSubmit={handleMfaSubmit}>
                                <div className="flex gap-2 justify-center mb-8">
                                    {mfaCode.map((digit, i) => (
                                        <input
                                            key={i}
                                            id={`mfa-${i}`}
                                            type="text"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleMfaChange(i, e.target.value)}
                                            className="w-10 h-12 text-center text-xl font-bold rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:border-indigo-500 focus:ring-0 transition-colors"
                                        />
                                    ))}
                                </div>
                                <button
                                    type="submit"
                                    disabled={isProcessing}
                                    className={`w-full py-3 rounded-xl text-white font-bold text-sm shadow-lg transition-all active:scale-95 ${isProcessing ? 'bg-indigo-400 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30'}`}
                                >
                                    {isProcessing ? 'Verifying...' : 'Confirm Transaction'}
                                </button>
                            </form>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-indigo-500" /> Initiate Disbursement
                            </h3>
                            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleInitialSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Project / Contract</label>
                                <select className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:border-indigo-500 focus:ring-indigo-500">
                                    <option>Select Project...</option>
                                    <option>Lagos ICT Hub Construction</option>
                                    <option>Kaduna Primary School Rehab</option>
                                    <option>Scholarship Fund Batch B</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Amount (₦)</label>
                                <input type="number" placeholder="0.00" className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:border-indigo-500 focus:ring-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Beneficiary Account</label>
                                <input type="text" placeholder="Account Number" className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:border-indigo-500 focus:ring-indigo-500" />
                            </div>
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isProcessing}
                                    className={`w-full py-3 rounded-xl text-white font-bold text-sm shadow-lg transition-all active:scale-95 ${isProcessing ? 'bg-indigo-400 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30'}`}
                                >
                                    {isProcessing ? 'Processing Request...' : 'Proceed to Authorization'}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
