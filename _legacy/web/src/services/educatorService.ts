import { get, post } from './api';

export interface Student {
    id: string;
    first_name: string;
    last_name: string;
    grade: string;
    attendance: number;
    average: number;
    avatar: string;
}

export interface ClassListResponse {
    className: string;
    students: Student[];
}

export interface AttendanceRecord {
    studentId: string;
    status: 'Present' | 'Absent' | 'Late';
}

export const educatorService = {
    getClassList: async (): Promise<ClassListResponse> => {
        return get('/educator/class');
    },

    submitAttendance: async (date: string, records: AttendanceRecord[]): Promise<{ status: string; message: string }> => {
        return post('/educator/attendance', { date, records });
    }
};
