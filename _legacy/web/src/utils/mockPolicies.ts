
export interface Policy {
    id: string;
    title: string;
    category: 'Conduct' | 'Academic' | 'Uniform' | 'Safety' | 'Device';
    version: string;
    content: string; // HTML or Text
    effectiveDate: string;
    requiredAck: boolean; // Does user need to sign?
}

export interface BehaviourCategory {
    id: string;
    name: string;
    type: 'merit' | 'demerit';
    points: number;
    color: string;
}

export const MOCK_POLICIES: Policy[] = [
    {
        id: 'p1',
        title: 'Student Code of Conduct',
        category: 'Conduct',
        version: '2025.1',
        content: '<p>Respect for others is our core value...</p>',
        effectiveDate: '2025-01-01',
        requiredAck: true,
    },
    {
        id: 'p2',
        title: 'Uniform & Appearance',
        category: 'Uniform',
        version: '1.0',
        content: '<p>Blazers must be worn at all times...</p>',
        effectiveDate: '2025-01-01',
        requiredAck: false,
    },
    {
        id: 'p3',
        title: 'Acceptable IT Use',
        category: 'Device',
        version: '1.2',
        content: '<p>Devices are for learning purposes only...</p>',
        effectiveDate: '2025-01-15',
        requiredAck: true,
    }
];

export const MOCK_BEHAVIOUR_CATEGORIES: BehaviourCategory[] = [
    { id: 'b1', name: 'Academic Excellence', type: 'merit', points: 5, color: 'bg-green-100 text-green-800' },
    { id: 'b2', name: 'Waitering / Service', type: 'merit', points: 3, color: 'bg-green-100 text-green-800' },
    { id: 'b3', name: 'Late Coming', type: 'demerit', points: -1, color: 'bg-yellow-100 text-yellow-800' },
    { id: 'b4', name: 'Uniform Violation', type: 'demerit', points: -1, color: 'bg-yellow-100 text-yellow-800' },
    { id: 'b5', name: 'Disruptive Behaviour', type: 'demerit', points: -3, color: 'bg-red-100 text-red-800' },
    { id: 'b6', name: 'Bullying (Zero Tolerance)', type: 'demerit', points: -10, color: 'bg-red-100 text-red-800' },
];
