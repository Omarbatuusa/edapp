import { useAuth } from '../context/AuthContext';
import StaffDashboard from './StaffDashboard';
import ParentDashboard from './ParentDashboard';
import EducatorDashboard from './EducatorDashboard';
import FoundationDashboard from './FoundationDashboard';
import SeniorDashboard from './SeniorDashboard';
import { Loader } from 'lucide-react';

interface DashboardRouterProps {
    onLogout: () => void;
}

export default function DashboardRouter({ onLogout }: DashboardRouterProps) {
    const { user, activeRole, hasCapability, isLoading } = useAuth();

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center"><Loader className="animate-spin" /></div>;
    }

    if (!user || !activeRole) {
        return <div className="p-10 text-center">Error: User role not loaded. <button onClick={onLogout} className="underline">Logout</button></div>;
    }

    console.log("DashboardRouter: Active Role:", activeRole.slug, "Scope:", activeRole.scope);

    // STRICT ROUTING - Top Down Priority
    switch (activeRole.slug) {
        case 'platform_admin':
        case 'tenant_admin':
        case 'admin':
        case 'principal':
        case 'hod':
        case 'staff':
        case 'bursar':
        case 'receptionist':
            return <StaffDashboard onLogout={onLogout} />;

        case 'educator':
        case 'teacher':
            return <EducatorDashboard onLogout={onLogout} onViewClass={() => { }} onViewAttendance={() => { }} />;

        case 'learner':
        case 'student':
            // Phase-based routing for learners
            const phase = user.phase || 'senior'; // Default to senior if missing
            if (phase === 'foundation' || user.grade?.startsWith('R') || ['1', '2', '3'].includes(user.grade || '')) {
                return (
                    <FoundationDashboard
                        studentName={user.first_name}
                        merits={0} // To be connected
                        onViewTasks={() => { }}
                        onViewFun={() => { }}
                        onLogout={onLogout}
                        onViewTimetable={() => { }}
                        onViewBadges={() => { }}
                        visibleModules={[]}
                    />
                );
            }
            return (
                <SeniorDashboard
                    studentName={user.first_name}
                    grade={user.grade || "Grade"}
                    onViewSubjects={() => { }}
                    onViewCareer={() => { }}
                    onViewTimetable={() => { }}
                    onViewResults={() => { }}
                    onLogout={onLogout}
                    visibleModules={[]}
                />
            );

        case 'parent':
        case 'guardian':
            return (
                <ParentDashboard
                    onOpenHub={() => { }}
                    onOpenAssignments={() => { }}
                    onOpenEmergency={() => { }}
                    onOpenSilentHelp={() => { }}
                    onOpenProfile={() => { }}
                    visibleModules={[]}
                />
            );

        default:
            // Fallback for unknown roles - DO NOT default to Parent. Show error or basic view.
            return (
                <div className="flex h-screen flex-col items-center justify-center gap-4">
                    <h2 className="text-xl font-bold">Unknown Role Context</h2>
                    <p>Your active role "{activeRole.slug}" does not have a mapped dashboard.</p>
                    <button onClick={onLogout} className="px-4 py-2 bg-red-600 text-white rounded">Logout</button>
                </div>
            );
    }
}
