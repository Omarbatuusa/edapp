import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import RoleSelection, { type UserRole } from './RoleSelection';
import ApplyLanding from './ApplyLanding';
import LoginForm from './LoginForm';
import ParentDashboard from './ParentDashboard';
import FoundationDashboard from './FoundationDashboard';
import SeniorDashboard from './SeniorDashboard';
import CommunicationHub from './CommunicationHub';
import HomeworkAssignments from './HomeworkAssignments';
import EmergencyAlert from './EmergencyAlert';
import SilentHelp from './SilentHelp';
import UserProfile from './UserProfile';
import Footer from './Footer';
import StaffDashboard from './StaffDashboard';
import EducatorDashboard from './EducatorDashboard';
import DashboardRouter from './DashboardRouter';
import TimetableView from './TimetableView';
import ResultsView from './ResultsView';
import BadgesView from './BadgesView';
import MyClassView from './MyClassView';
import AttendanceView from './AttendanceView';
import { type Tenant } from '../utils/mockData';
import { getTenantByDomain } from '../services/tenantService';

type Step = 'role' | 'login' | 'dashboard' | 'hub' | 'assignments' | 'profile' | 'timetable' | 'results' | 'badges' | 'class' | 'attendance';

export default function TenantLanding() {
    const [step, setStep] = useState<Step>('role');
    const [role, setRole] = useState<UserRole | null>(null);

    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [loadingTenant, setLoadingTenant] = useState(true);

    useEffect(() => {
        const fetchTenant = async () => {
            try {
                const hostname = window.location.hostname;
                // For dev/test, fallback to lakewood if localhost, else use hostname
                const domain = (hostname === 'localhost' || hostname === '127.0.0.1')
                    ? 'lakewood.edapp.co.za'
                    : hostname;

                const data = await getTenantByDomain(domain);
                if (data) {
                    setTenant(data);
                } else {
                    console.error("Tenant not found for domain:", domain);
                    // Handle error state or redirect
                }
            } catch (err) {
                console.error("Failed to load tenant", err);
            } finally {
                setLoadingTenant(false);
            }
        };
        fetchTenant();
    }, []);

    // Load state from localStorage on mount
    useEffect(() => {
        const savedRole = localStorage.getItem('edapp_user_role') as UserRole | null;
        const savedStep = localStorage.getItem('edapp_step') as Step | null;

        if (savedRole) {
            setRole(savedRole);
        }

        if (savedStep && ['dashboard', 'hub', 'assignments', 'profile'].includes(savedStep)) {
            setStep(savedStep);
        } else if (savedRole) {
            // If we have a role but no dashboard step, go to login or stay at role?
            // User likely wants to be at login if they selected a role but didn't finish login, 
            // OR if they finished login (auth token logic would be here in real app).
            // For now, if role exists, assume they might be at login step.
            const isLoggedIn = localStorage.getItem('edapp_is_logged_in') === 'true';
            if (isLoggedIn) {
                setStep('dashboard');
            } else {
                setStep('login');
            }
        }
    }, []);

    // Effect to save important state changes
    useEffect(() => {
        if (role) {
            localStorage.setItem('edapp_user_role', role);
        } else {
            localStorage.removeItem('edapp_user_role');
        }
    }, [role]);

    useEffect(() => {
        if (['dashboard', 'hub', 'assignments', 'profile', 'timetable', 'results', 'badges', 'class', 'attendance'].includes(step)) {
            localStorage.setItem('edapp_is_logged_in', 'true');
            localStorage.setItem('edapp_step', step);
        } else {
            localStorage.removeItem('edapp_step');
            if (step === 'role') {
                localStorage.removeItem('edapp_is_logged_in');
            }
        }
    }, [step]);

    // Overlay states
    const [showEmergency, setShowEmergency] = useState(false);
    const [showSilentHelp, setShowSilentHelp] = useState(false);

    // Phase State (Mocked for now, in real app comes from User Profile)
    const [studentPhase, setStudentPhase] = useState<'foundation' | 'senior'>('foundation');
    const { user } = useAuth();

    useEffect(() => {
        if (user && user.phase) {
            setStudentPhase(user.phase as 'foundation' | 'senior');
        }
    }, [user]);

    // Quick toggle for demo purposes (Phase switcher hidden or temporary)
    // To demo, we might want to toggle this based on some hidden trigger or just hardcode for valid verification.

    const handleRoleSelect = (selectedRole: UserRole) => {
        setRole(selectedRole);
        // If Role is student, maybe we can simulate phase detection here?
        // For demo: set phase randomly or default.
        setStep('login');
    };

    const handleBackToRole = () => {
        setStep('role');
        setRole(null);
    };

    const handleLoginSuccess = () => {
        setStep('dashboard');
    };

    const handleOpenHub = () => setStep('hub');
    const handleOpenAssignments = () => setStep('assignments');
    const handleOpenProfile = () => setStep('profile');
    const handleOpenTimetable = () => setStep('timetable');
    const handleOpenResults = () => setStep('results');
    const handleOpenBadges = () => setStep('badges');
    const handleOpenClass = () => setStep('class');
    const handleOpenAttendance = () => setStep('attendance');
    const handleOpenEmergency = () => setShowEmergency(true);
    const handleOpenSilentHelp = () => setShowSilentHelp(true);
    const handleBackToDashboard = () => setStep('dashboard');

    const handleLogout = () => {
        setStep('role');
        setRole(null);
        localStorage.removeItem('edapp_user_role');
        localStorage.removeItem('edapp_is_logged_in');
        localStorage.removeItem('edapp_step');
    };

    // Main Render Flow matches original App.tsx logic minus Search

    // SAFEGUARD: If in dashboard mode but tenant is not ready, show loader or nothing
    if (['dashboard', 'hub', 'assignments', 'profile', 'timetable', 'results', 'badges', 'class', 'attendance'].includes(step)) {
        if (!tenant) {
            if (loadingTenant) {
                return (
                    <div className="flex justify-center items-center h-screen">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                );
            }
            return null;
        }

        // Delegate all Dashboard Routing to the dedicated Router
        return <DashboardRouter onLogout={handleLogout} />;
    }

    // Dev Helper: Phase Toggler (Only visible in dev or if needed for demo)
    const togglePhase = () => {
        setStudentPhase(prev => prev === 'foundation' ? 'senior' : 'foundation');
    };

    return (
        <main className="flex flex-col w-full min-h-screen relative">
            <div className="flex-1 flex flex-col w-full max-w-md mx-auto px-4 py-6 justify-center">
                {loadingTenant && (
                    <div className="flex justify-center items-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                )}

                {!loadingTenant && !tenant && (
                    <div className="text-center text-red-500">
                        School not found. Please check the URL.
                    </div>
                )}

                {/* Portal Routing */}
                {!loadingTenant && tenant && tenant.portalType === 'apply' && (
                    <ApplyLanding />
                )}

                {!loadingTenant && tenant && (!tenant.portalType || tenant.portalType === 'login') && step === 'role' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-4 text-center">
                            <p className="text-sm text-primary font-medium bg-primary/10 inline-block px-3 py-1 rounded-full">
                                {tenant.name}
                            </p>
                        </div>
                        <RoleSelection onRoleSelect={handleRoleSelect} />
                    </div>
                )}

                {step === 'login' && role && tenant && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <LoginForm
                            role={role}
                            schoolName={tenant.name}
                            tenantId={tenant.id}
                            onBack={handleBackToRole}
                            onLoginSuccess={handleLoginSuccess}
                        />
                        {/* Apply Now Link */}
                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Not a current student or parent?{' '}
                                <a href="#" className="font-bold text-primary hover:underline">
                                    Apply Now
                                </a>
                            </p>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </main>
    );
}
