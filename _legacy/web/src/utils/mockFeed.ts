export interface FeedItem {
    id: string;
    author: string;
    role: string;
    time: string;
    content: string;
    tags: string[];
    imageUrl: string;
    likes: number;
    comments: number;
    avatarIcon: string;
}

export const FEED_ITEMS: FeedItem[] = [
    {
        id: '1',
        author: 'St. Marks High',
        role: 'Sports Dept',
        time: '4h ago',
        content: 'First Team Rugby wins the regional derby! 🏉 What a match against our rivals. Proud of the boys for bringing the trophy home!',
        tags: ['#StMarksPride', '#Rugby'],
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDZ6wmQYBh427F170BJNOQWWDNDW6tu96MgNKaoJ29X79oALVWJ6HzcGlnk8n_O8fmVlByhSzNKBphA7wHp8ZA67D8zIwexgchGOSad100tZ1Jl1iAP6NAtZHLIyJALCYo4RW78E-F1BX9vnlT3kdKfNzwWodaoSQEMLNzx1om74NSppGbaZjcjAkQp63Yi4612bXfmcYycsUiWhxbhUzWZvms9M8q9m37Ek0D7m0E3Oa45-tow4w6QF3fPy_JgxOniINUIeVZDip8',
        likes: 124,
        comments: 8,
        avatarIcon: 'GraduationCap'
    },
    {
        id: '2',
        author: 'St. Marks High',
        role: 'Science Club',
        time: '6h ago',
        content: 'Our Science Fair was a huge success! Look at these amazing projects from our Grade 10s. The future is bright! 🧪🔬',
        tags: ['#ScienceFair', '#Innovation'],
        imageUrl: 'https://images.unsplash.com/photo-1564325724739-bae0bd08762c?auto=format&fit=crop&q=80&w=1000',
        likes: 89,
        comments: 12,
        avatarIcon: 'FlaskConical'
    },
    {
        id: '3',
        author: 'St. Marks High',
        role: 'Drama Society',
        time: '1d ago',
        content: 'Rehearsals for "The Lion King" are in full swing. Tickets go on sale next week! 🦁🎭 Don\'t miss out.',
        tags: ['#Drama', '#SchoolPlay'],
        imageUrl: 'https://images.unsplash.com/photo-1503095392269-27528ca388ec?auto=format&fit=crop&q=80&w=1000',
        likes: 156,
        comments: 24,
        avatarIcon: 'DramaMasks'
    },
    {
        id: '4',
        author: 'St. Marks High',
        role: 'Principal',
        time: '2d ago',
        content: 'Reminder: Parent-Teacher meetings are scheduled for next Tuesday. Please book your slots via the Academics tab.',
        tags: ['#Announcement', '#Parents'],
        imageUrl: 'https://images.unsplash.com/photo-1577896334614-5398dbe2b24c?auto=format&fit=crop&q=80&w=1000',
        likes: 45,
        comments: 3,
        avatarIcon: 'School'
    },
    {
        id: '5',
        author: 'St. Marks High',
        role: 'Music Dept',
        time: '3d ago',
        content: 'The Choir won Gold at the National Eisteddfod! 🏆🎵 Listening to their voices gives us chills every time.',
        tags: ['#Choir', '#Gold'],
        imageUrl: 'https://images.unsplash.com/photo-1514320291940-bf7f62d18917?auto=format&fit=crop&q=80&w=1000',
        likes: 210,
        comments: 35,
        avatarIcon: 'Music'
    }
];
