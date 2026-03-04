import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { InvitationsService, type Invitation } from '../services/invitations.service';
import { supabase } from '../lib/supabase';
import { Loader2, ShieldCheck, Building2, UserCircle, Briefcase, AlertCircle, Eye, EyeOff, CheckCircle2, XCircle, Mail } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

// Password validation rules
const PASSWORD_RULES = [
    { id: 'length', label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
    { id: 'upper', label: 'One uppercase letter (A-Z)', test: (p: string) => /[A-Z]/.test(p) },
    { id: 'lower', label: 'One lowercase letter (a-z)', test: (p: string) => /[a-z]/.test(p) },
    { id: 'number', label: 'One number (0-9)', test: (p: string) => /[0-9]/.test(p) },
    { id: 'symbol', label: 'One special character (!@#$...)', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

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
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Contractor State
    const [companyName, setCompanyName] = useState('');
    const [registrationNumber, setRegistrationNumber] = useState('');
    const [zone, setZone] = useState('NORTH_WEST');

    // Consultant State
    const [specialization, setSpecialization] = useState('');
    const [department, setDepartment] = useState('');
    const [region, setRegion] = useState('');

    const [submitting, setSubmitting] = useState(false);

    // Email confirmation modal state
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);

    useEffect(() => {
        if (!id) {
            setError('No invitation ID provided.');
            setLoading(false);
            return;
        }

        const verifyInvite = async () => {
            try {
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

    // Inline password validation
    const passwordValid = PASSWORD_RULES.every(rule => rule.test(password));
    const passwordsMatch = password.length > 0 && password === confirmPassword;
    const passwordTouched = password.length > 0;
    const confirmTouched = confirmPassword.length > 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!invitation || !id) return;

        // Validate password inline (shouldn't reach here, but safety net)
        if (!passwordValid) {
            setError('Please fix the password requirements above.');
            return;
        }

        if (!passwordsMatch) {
            setError('Passwords do not match.');
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

            // 3. Show email confirmation modal instead of auto-login
            setShowConfirmationModal(true);

        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error('Registration Error:', err);
            setError(err.message || 'An error occurred during registration. Please try again.');
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

    if (error && !invitation) {
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

    // Email Confirmation Modal
    if (showConfirmationModal) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950 flex items-center justify-center p-4 sm:p-8">
                <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 p-8 text-center">
                    <div className="mx-auto h-20 w-20 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center mb-6">
                        <Mail className="h-10 w-10 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Check Your Email</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                        A confirmation email has been sent to:
                    </p>
                    <p className="text-indigo-600 dark:text-indigo-400 font-semibold mb-6">
                        {invitation?.invitee_email}
                    </p>
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
                        <p className="text-sm text-amber-800 dark:text-amber-300">
                            <strong>Important:</strong> Please verify your email address by clicking the confirmation link in the email before logging in.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/auth/login')}
                        className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-sm"
                    >
                        Go to Login
                    </button>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                        Didn't receive it? Check your spam folder or contact your administrator.
                    </p>
                </div>
            </div>
        );
    }

    if (!invitation) return null;

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
                                            placeholder="Enter your company's legal name"
                                            className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all" />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                CAC Registration Number
                                                <span className="text-gray-400 dark:text-gray-500 font-normal ml-1">(optional)</span>
                                            </label>
                                            <input type="text" value={registrationNumber} onChange={e => setRegistrationNumber(e.target.value)} placeholder="e.g. RC-123456"
                                                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all" />
                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                Your Corporate Affairs Commission registration number. Can be added later.
                                            </p>
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

                        {/* 3. Security — with inline validation + show/hide toggle */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center border-b dark:border-gray-700 pb-2 mt-6">
                                <ShieldCheck className="w-5 h-5 mr-2 text-indigo-600" /> Security
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Set Password</label>
                                    <div className="relative">
                                        <input required type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                                            className={`w-full px-4 py-2.5 pr-10 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all ${passwordTouched && !passwordValid ? 'border-red-300 dark:border-red-600' : 'border-gray-200 dark:border-gray-700'}`} />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</label>
                                    <div className="relative">
                                        <input required type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                                            className={`w-full px-4 py-2.5 pr-10 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all ${confirmTouched && !passwordsMatch ? 'border-red-300 dark:border-red-600' : 'border-gray-200 dark:border-gray-700'}`} />
                                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {confirmTouched && !passwordsMatch && (
                                        <p className="text-xs text-red-500 flex items-center mt-1">
                                            <XCircle className="h-3 w-3 mr-1" /> Passwords do not match
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Inline password rules checklist */}
                            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
                                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">Password Requirements</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {PASSWORD_RULES.map(rule => {
                                        const passed = rule.test(password);
                                        return (
                                            <div key={rule.id} className={`flex items-center text-sm ${passed ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                                {passed ? <CheckCircle2 className="h-4 w-4 mr-2 flex-shrink-0" /> : <XCircle className="h-4 w-4 mr-2 flex-shrink-0" />}
                                                {rule.label}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="pt-6 border-t dark:border-gray-700 mt-8">
                            <button
                                type="submit"
                                disabled={submitting || !passwordValid || !passwordsMatch}
                                className="w-full flex items-center justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold tracking-wide"
                            >
                                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Complete Registration'}
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
