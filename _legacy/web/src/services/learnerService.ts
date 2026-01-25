import { get } from './api';

export interface TimeTableItem {
    time: string;
    subject: string;
    room: string;
    type: string;
    color: string;
}

export interface Assignment {
    id: number;
    subject: string;
    title: string;
    description: string;
    dueDate: string;
    status: string;
    urgent: boolean;
}

export interface SubjectResult {
    name: string;
    mark: number;
    symbol: string;
    trend: string;
    teacher: string;
}

export interface ResultsData {
    term: string;
    year: string;
    average: number;
    subjects: SubjectResult[];
}

export interface Badge {
    id: number;
    name: string;
    desc: string;
    icon: string;
    unlocked: boolean;
    date?: string;
    progress?: string;
}

export interface BadgesData {
    totalMerits: number;
    badges: Badge[];
}

export const learnerService = {
    getTimetable: async (): Promise<{ date: string; schedule: TimeTableItem[] }> => {
        return get('/academic/timetable');
    },

    getResults: async (): Promise<ResultsData> => {
        return get('/academic/results');
    },

    getAssignments: async (): Promise<Assignment[]> => {
        return get('/academic/assignments');
    },

    getBadges: async (): Promise<BadgesData> => {
        return get('/gamification/badges');
    }
};
