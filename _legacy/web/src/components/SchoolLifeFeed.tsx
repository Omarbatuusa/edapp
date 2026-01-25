import { MoreHorizontal, Heart, MessageCircle, Share2, GraduationCap, FlaskConical, Theater as DramaMasks, School, Music } from 'lucide-react';
import { FEED_ITEMS } from '../utils/mockFeed';

const IconMap: Record<string, any> = {
    GraduationCap: GraduationCap,
    FlaskConical: FlaskConical,
    DramaMasks: DramaMasks,
    School: School,
    Music: Music,
};

export default function SchoolLifeFeed() {
    return (
        <section className="flex flex-col gap-3 mb-4">
            <div className="px-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">School Life</h3>
            </div>

            {/* 
        Responsive Grid Container:
        - Mobile: grid-cols-1 (Vertical stack)
        - Tablet (md): grid-cols-2
        - Desktop (lg): grid-cols-3
        - XL: grid-cols-4
      */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4 md:px-6 pb-6">
                {FEED_ITEMS.map((item) => {
                    const IconComponent = IconMap[item.avatarIcon] || School;

                    return (
                        <div
                            key={item.id}
                            className="group w-full rounded-xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                        >
                            {/* Feed Header */}
                            <div className="flex items-center p-3 gap-3">
                                <div className="bg-primary/10 rounded-full size-10 flex items-center justify-center text-primary">
                                    <IconComponent className="h-6 w-6" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">{item.author}</span>
                                    <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">{item.role} • {item.time}</span>
                                </div>
                                <button className="ml-auto text-text-secondary-light dark:text-text-secondary-dark hover:text-slate-900 dark:hover:text-white transition">
                                    <MoreHorizontal className="h-6 w-6" />
                                </button>
                            </div>

                            {/* Feed Image */}
                            <div
                                className="w-full bg-slate-200 dark:bg-slate-800 aspect-video bg-cover bg-center transition-transform hover:scale-[1.02] duration-500"
                                style={{ backgroundImage: `url("${item.imageUrl}")` }}
                            >
                            </div>

                            {/* Feed Content */}
                            <div className="p-3 pb-4">
                                <div className="flex items-center gap-4 mb-3">
                                    <button className="flex items-center gap-1 text-slate-700 dark:text-slate-200 hover:text-red-500 transition-colors group/btn">
                                        <Heart className="h-6 w-6 group-hover/btn:fill-red-500 group-hover/btn:text-red-500 transition-colors" />
                                        <span className="text-sm font-medium">{item.likes}</span>
                                    </button>
                                    <button className="flex items-center gap-1 text-slate-700 dark:text-slate-200 hover:text-primary transition-colors group/btn">
                                        <MessageCircle className="h-6 w-6 group-hover/btn:text-primary transition-colors" />
                                        <span className="text-sm font-medium">{item.comments}</span>
                                    </button>
                                    <button className="ml-auto text-slate-700 dark:text-slate-200 hover:text-primary transition-colors">
                                        <Share2 className="h-6 w-6" />
                                    </button>
                                </div>
                                <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 line-clamp-3">
                                    {item.content.split(' ').map((word, i) =>
                                        word.startsWith('#') ? <span key={i} className="text-primary font-medium">{word} </span> : word + ' '
                                    )}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
