import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { InvitationsService, type Invitation } from '../services/invitations.service';
import { supabase } from '../lib/supabase';
import { Loader2, ShieldCheck, Building2, UserCircle, Briefcase, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function InviteResolutionPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user: currentUser, logout } = useAuth();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [invitation, setInvitation] = useState<Invitation | null>(null);

    // Core Form State
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Contractor State
    const [companyName, setCompanyName] = useState('');
    const [registrationNumber, setRegistrationNumber] = useState('');
    const [zone, setZone] = useState('NORTH_WEST');

    // Consultant State
    const [specialization, setSpecialization] = useState('');
    const [department, setDepartment] = useState('');
    const [region, setRegion] = useState('');

    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!id) {
            setError('No invitation ID provided.');
            setLoading(false);
            return;
        }

        const verifyInvite = async () => {
            try {
                // If a user is already logged in, log them out automatically
                // Because accepting an invite requires creating a NEW auth account
                if (currentUser) {
                    await logout();
                }

                const invite = await InvitationsService.getPendingInvitation(id);
                setInvitation(invite);
            } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
                console.error('Failed to verify invite:', err);
                setError(err.message || 'This invitation is invalid or has already been accepted.');
            } finally {
                setLoading(false);
            }
        };

        verifyInvite();
    }, [id, currentUser, logout]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!invitation || !id) return;

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }
        if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
            setError('Password must contain uppercase, lowercase, and a number.');
            return;
        }

        setError(null);
        setSubmitting(true);

        try {
            // 1. Create Auth Account in Supabase
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: invitation.invitee_email,
                password: password,
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error('User creation failed.');

            // 2. Submit the detailed profile to our custom RPC
            await InvitationsService.acceptInvitationWithDetails({
                invitationId: id,
                authUserId: authData.user.id,
                fullName,
                phone,
                role: invitation.role,
                contractorData: invitation.role === 'CONTRACTOR' ? { companyName, registrationNumber, zone } : undefined,
                consultantData: invitation.role === 'CONSULTANT' ? { specialization, department, region } : undefined,
            });

            // 3. Re-login manually to ensure session is perfectly synced
            await supabase.auth.signInWithPassword({
                email: invitation.invitee_email,
                password: password,
            });

            // 4. Redirect based on role
            navigate(invitation.role === 'CONTRACTOR' ? '/dashboard/contractor' : '/dashboard/consultant');

        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error('Registration Error:', err);
            setError(err.message || 'An error occurred during registration. Please try again.');

            // Cleanup auth if RPC failed
            // Note: In a real production app, we'd need a robust way to rollback
            // the auth account if the RPC fails so they can retry.
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                <h2 className="text-xl font-medium text-gray-900">Verifying Invitation...</h2>
            </div>
        );
    }

    if (error || !invitation) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border-t-4 border-red-500">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Link</h2>
                    <p className="text-gray-600 mb-6">{error || 'This invitation link is invalid or expired.'}</p>
                    <button
                        onClick={() => navigate('/auth/login')}
                        className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950 flex items-center justify-center p-4 sm:p-8 transition-colors">
            <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 transition-colors">
                {/* Header */}
                <div className="bg-indigo-600 p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
                    <div className="flex items-center space-x-3 mb-2 relative z-10">
                        <ShieldCheck className="w-8 h-8 text-indigo-200" />
                        <h1 className="text-2xl font-bold tracking-tight">Accept Your Invitation</h1>
                    </div>
                    <p className="text-indigo-100 relative z-10">
                        You have been invited to join the platform as a <strong>{invitation.role}</strong>.
                    </p>
                </div>

                {/* Body */}
                <div className="p-8">
                    <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Account Email</p>
                            <p className="text-gray-900 dark:text-white font-semibold">{invitation.invitee_email}</p>
                        </div>
                        <div className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold tracking-wider">
                            {invitation.role}
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-xl flex items-start space-x-3 text-red-700 dark:text-red-400">
                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-balance">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* 1. Core Information */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center border-b dark:border-gray-700 pb-2">
                                <UserCircle className="w-5 h-5 mr-2 text-indigo-600" /> Personal Identity
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                                    <input required type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                                    <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all" />
                                </div>
                            </div>
                        </div>

                        {/* 2. Role Specific Information */}
                        {invitation.role === 'CONTRACTOR' && (
                            <div className="animate-in slide-in-from-bottom-2 fade-in duration-500">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center border-b dark:border-gray-700 pb-2">
                                    <Building2 className="w-5 h-5 mr-2 text-indigo-600" /> Company Details
                                </h3>
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Company Name</label>
                                        <input required type="text" value={companyName} onChange={e => setCompanyName(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all" />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Registration Number</label>
                                            <input required type="text" value={registrationNumber} onChange={e => setRegistrationNumber(e.target.value)} placeholder="e.g. RC-123456"
                                                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Geographic Zone</label>
                                            <select value={zone} onChange={e => setZone(e.target.value)}
                                                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all appearance-none cursor-pointer">
                                                <option value="NORTH_WEST">North West</option>
                                                <option value="NORTH_EAST">North East</option>
                                                <option value="NORTH_CENTRAL">North Central</option>
                                                <option value="SOUTH_WEST">South West</option>
                                                <option value="SOUTH_EAST">South East</option>
                                                <option value="SOUTH_SOUTH">South South</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {invitation.role === 'CONSULTANT' && (
                            <div className="animate-in slide-in-from-bottom-2 fade-in duration-500">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center border-b dark:border-gray-700 pb-2">
                                    <Briefcase className="w-5 h-5 mr-2 text-indigo-600" /> Professional Expertise
                                </h3>
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Specialization</label>
                                        <input required type="text" value={specialization} onChange={e => setSpecialization(e.target.value)} placeholder="e.g. Structural Engineering"
                                            className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all" />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Department</label>
                                            <input required type="text" value={department} onChange={e => setDepartment(e.target.value)}
                                                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Region</label>
                                            <input required type="text" value={region} onChange={e => setRegion(e.target.value)}
                                                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 3. Security */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center border-b dark:border-gray-700 pb-2 mt-6">
                                <ShieldCheck className="w-5 h-5 mr-2 text-indigo-600" /> Security
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Set Password</label>
                                    <input required type="password" value={password} onChange={e => setPassword(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</label>
                                    <input required type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all" />
                                </div>
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="pt-6 border-t dark:border-gray-700 mt-8">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full flex items-center justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 transition-all font-bold tracking-wide"
                            >
                                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Complete Registration & Enter Dashboard'}
                            </button>
                            <p className="text-xs text-center text-gray-500 mt-4">
                                By completing registration, you agree to the Platform Terms of Service and Privacy Policy.
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
