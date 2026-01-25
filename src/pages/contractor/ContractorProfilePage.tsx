import { useEffect, useState } from 'react';
import { getContractorProfile } from '../../services/contractor';
import type { ContractorProfile } from '../../services/contractor';
import {
    Building2, Mail, Phone, MapPin, Calendar, Users,
    TrendingUp, TrendingDown, Minus, Star, Shield, Clock,
    CheckCircle, AlertTriangle, ExternalLink, Briefcase
} from 'lucide-react';

export default function ContractorProfilePage() {
    const [profile, setProfile] = useState<ContractorProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            setIsLoading(true);
            try {
                const data = await getContractorProfile();
                setProfile(data);
            } catch (error) {
                console.error('Failed to load profile', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const formatMoney = (amount: number) => {
        if (amount >= 1000000000) {
            return `₦${(amount / 1000000000).toFixed(1)}B`;
        }
        if (amount >= 1000000) {
            return `₦${(amount / 1000000).toFixed(0)}M`;
        }
        return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);
    };

    const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
        switch (trend) {
            case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
            case 'down': return <TrendingDown className="h-4 w-4 text-green-500" />; // down for response time is good
            case 'stable': return <Minus className="h-4 w-4 text-gray-400" />;
        }
    };

    const getCertStatusStyle = (status: string) => {
        switch (status) {
            case 'VALID': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900/50';
            case 'EXPIRING': return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-900/50';
            case 'EXPIRED': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900/50';
            default: return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700/50 dark:text-gray-400 dark:border-gray-600';
        }
    };

    if (isLoading || !profile) {
        return (
            <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
                <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>)}
                </div>
                <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header Card */}
            <div className="glass-card rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Banner */}
                <div className="h-24 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 relative">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.08%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
                </div>

                {/* Profile Info */}
                <div className="px-6 pb-6 -mt-12 relative">
                    <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                        {/* Avatar */}
                        <div className="h-24 w-24 rounded-2xl bg-white dark:bg-gray-800 shadow-lg border-4 border-white dark:border-gray-800 flex items-center justify-center overflow-hidden">
                            {profile.logo ? (
                                <img src={profile.logo} alt={profile.companyName} className="h-full w-full object-cover" />
                            ) : (
                                <Building2 className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
                            )}
                        </div>

                        {/* Company Details */}
                        <div className="flex-1 pt-2">
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{profile.companyName}</h1>
                                <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/30 px-2 py-1 rounded-full">
                                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                    <span className="text-sm font-bold text-yellow-700 dark:text-yellow-400">{profile.overallRating}</span>
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Reg: {profile.registrationNumber}</p>
                        </div>

                        {/* Quick Stats */}
                        <div className="flex gap-6 text-center">
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{profile.totalProjectsCompleted}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Projects</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatMoney(profile.totalContractValue)}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">Total Value</p>
                            </div>
                        </div>
                    </div>

                    {/* Contact & Details Row */}
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                            <Mail className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                            <span>{profile.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                            <Phone className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                            <span>{profile.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                            <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                            <span>Est. {profile.establishedYear}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                            <Users className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                            <span>{profile.employeeCount} Employees</span>
                        </div>
                    </div>

                    <div className="mt-4 flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <MapPin className="h-4 w-4 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                        <span>{profile.address}</span>
                    </div>

                    {/* Specializations */}
                    <div className="mt-4 flex flex-wrap gap-2">
                        {profile.specializations.map((spec, i) => (
                            <span key={i} className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full text-xs font-medium">
                                {spec}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {profile.performanceMetrics.map((metric, i) => (
                    <div key={i} className="glass-card rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{metric.label}</span>
                            {getTrendIcon(metric.trend)}
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-gray-900 dark:text-white">{metric.value}</span>
                            <span className="text-gray-500 dark:text-gray-400">{metric.unit}</span>
                        </div>
                        <p className={`text-xs mt-2 font-medium ${metric.trend === 'stable' ? 'text-gray-400 dark:text-gray-500' : 'text-green-600 dark:text-green-400'}`}>
                            {metric.change} vs last quarter
                        </p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Certifications */}
                <div className="glass-card rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Shield className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Certifications</h2>
                    </div>
                    <div className="space-y-3">
                        {profile.certifications.map((cert) => (
                            <div key={cert.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                                <div className="flex items-start gap-3">
                                    <div className={`p-2 rounded-lg ${cert.status === 'VALID' ? 'bg-green-100 dark:bg-green-900/30' : cert.status === 'EXPIRING' ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                                        {cert.status === 'VALID' ? (
                                            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                                        ) : cert.status === 'EXPIRING' ? (
                                            <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                        ) : (
                                            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white">{cert.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{cert.issuer}</p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                            Expires: {new Date(cert.expiryDate).toLocaleDateString('en-NG', { dateStyle: 'medium' })}
                                        </p>
                                    </div>
                                </div>
                                <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase border ${getCertStatusStyle(cert.status)}`}>
                                    {cert.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Project Portfolio */}
                <div className="glass-card rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Briefcase className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Projects</h2>
                        </div>
                        <button className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center gap-1">
                            View All <ExternalLink className="h-3 w-3" />
                        </button>
                    </div>
                    <div className="space-y-3">
                        {profile.portfolio.map((project) => (
                            <div key={project.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-500/50 transition-colors cursor-pointer">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white">{project.title}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                                            <MapPin className="h-3 w-3" /> {project.location}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/30 px-2 py-0.5 rounded-full">
                                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                        <span className="text-xs font-bold text-yellow-700 dark:text-yellow-400">{project.rating}</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{formatMoney(project.value)}</span>
                                    <span className="text-xs text-gray-400 dark:text-gray-500">
                                        Completed {new Date(project.completedDate).toLocaleDateString('en-NG', { month: 'short', year: 'numeric' })}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* About Section */}
            <div className="glass-card rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">About Us</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{profile.description}</p>
            </div>
        </div>
    );
}
