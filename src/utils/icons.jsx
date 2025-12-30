import {
    LuLayoutDashboard,
    LuBookOpen,
    LuTrendingUp,
    LuCode,
    LuTarget,
    LuHouse,
    LuDatabase,
    LuServer,
    LuFileCode,
    LuNetwork,
    LuBrainCircuit,
    LuLayers,
    LuBookmark
} from 'react-icons/lu';

export const getNavIcon = (label) => {
    switch (label.toLowerCase()) {
        case 'home': return <LuHouse />;
        case 'dashboard': return <LuLayoutDashboard />;
        case 'bookmarks': return <LuBookmark />;
        case 'progress': return <LuTrendingUp />;
        case 'compiler': return <LuCode />;
        default: return <LuBookOpen />;
    }
};

export const getTopicIcon = (slug) => {
    if (!slug) return <LuBookOpen />;

    switch (slug.toLowerCase()) {
        case 'mongodb': return <LuDatabase />;
        case 'express': return <LuServer />;
        case 'react': return <LuCode />;
        case 'nodejs':
        case 'node.js': return <LuServer />;
        case 'javascript': return <LuFileCode />;
        case 'typescript': return <LuFileCode />;
        case 'postgresql': return <LuDatabase />;
        case 'dsa': return <LuNetwork />;
        default: return <LuLayers />;
    }
};
