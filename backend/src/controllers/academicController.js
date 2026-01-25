const academicController = {
    // GET /v1/academic/timetable
    getTimetable: async (req, res) => {
        try {
            // Mock Timetable
            res.json({
                date: new Date().toISOString(),
                schedule: [
                    { time: '08:00', subject: 'Mathematics', room: 'Rm 12', type: 'Core', color: 'bg-blue-100 text-blue-700' },
                    { time: '09:00', subject: 'English HL', room: 'Rm 4', type: 'Language', color: 'bg-pink-100 text-pink-700' },
                    { time: '10:30', subject: 'Phys Sci', room: 'Lab 2', type: 'Elective', color: 'bg-indigo-100 text-indigo-700' }
                ]
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server Error' });
        }
    },

    // GET /v1/academic/results
    getResults: async (req, res) => {
        const results = {
            term: "Term 3",
            year: "2025",
            average: 72,
            subjects: [
                { name: "Mathematics", mark: 78, symbol: "B", trend: "up", teacher: "Mr. Dlamini" },
                { name: "English HL", mark: 82, symbol: "A", trend: "up", teacher: "Mrs. Smith" }
            ]
        };
        res.json(results);
    },

    // GET /v1/academic/assignments
    getAssignments: async (req, res) => {
        try {
            // Mock Assignments
            const assignments = [
                {
                    id: '1',
                    title: 'Poetry Analysis',
                    subject: 'English',
                    dueDate: '2026-10-24',
                    status: 'Active',
                    description: 'Analyze "The Road Not Taken".',
                    urgent: true
                },
                {
                    id: '2',
                    title: 'Quadratic Equations',
                    subject: 'Mathematics',
                    dueDate: '2026-10-26',
                    status: 'Active',
                    description: 'Complete Exercise 5.1.',
                    urgent: false
                }
            ];
            res.json(assignments);
        } catch (err) {
            console.error("Get Assignments Error:", err);
            res.status(500).json({ error: 'Failed to fetch assignments' });
        }
    }
};

module.exports = academicController;
