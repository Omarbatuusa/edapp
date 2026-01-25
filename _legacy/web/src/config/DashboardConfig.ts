import {
    LayoutDashboard,
    Users,
    GraduationCap,
    Gavel,
    FileText,
    CalendarCheck,
    School
} from 'lucide-react';

export interface DashboardTab {
    id: string;
    label: string;
    icon: any; // Lucide icon component
}

export type RoleScope = 'platform' | 'tenant' | 'branch' | 'phase' | 'grade' | 'class' | 'learner';

export const ADMIN_TABS: DashboardTab[] = [
    { id: 'home', label: 'Home', icon: LayoutDashboard },
    { id: 'staff', label: 'Staff', icon: Users },
    { id: 'students', label: 'Students', icon: GraduationCap },
    { id: 'discipline', label: 'Discipline', icon: Gavel },
    { id: 'reports', label: 'Reports', icon: FileText },
];

export const EDUCATOR_TABS: DashboardTab[] = [
    { id: 'home', label: 'Home', icon: LayoutDashboard },
    { id: 'my-class', label: 'My Class', icon: School },
    { id: 'discipline', label: 'Discipline', icon: Gavel },
    { id: 'assignments', label: 'Assignments', icon: FileText },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
];

export const LEARNER_TABS: DashboardTab[] = [
    { id: 'home', label: 'Home', icon: LayoutDashboard },
    { id: 'my-work', label: 'My Work', icon: FileText },
    { id: 'schedule', label: 'Schedule', icon: CalendarCheck },
];

// Mapping from Role Scope (or Role Slug) to Tab Configuration
export const getDashboardTabs = (scope: string): DashboardTab[] => {
    switch (scope) {
        case 'platform':
        case 'tenant':
        case 'branch':
            return ADMIN_TABS;
        case 'phase':
        case 'grade':
        case 'class':
            return EDUCATOR_TABS;
        case 'learner':
            return LEARNER_TABS;
        default:
            // Default fallback
            return EDUCATOR_TABS;
    }
};
