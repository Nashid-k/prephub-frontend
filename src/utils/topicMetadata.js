export const getTopicColor = (topicSlug, isDark = true) => {
    const normalizedSlug = topicSlug?.toLowerCase().trim() || '';

    // Express: white in dark mode, black in light mode
    if (normalizedSlug === 'express' || normalizedSlug === 'express.js') {
        return isDark ? '#FFFFFF' : '#1a1a1a';
    }

    const colorMap = {
        'mongodb': '#47A248',
        'mongo': '#47A248',
        'react': '#61DAFB',
        'react.js': '#61DAFB',
        'dsa': '#FF6B6B',
        'data structures & algorithms': '#FF6B6B',
        'node': '#339933',
        'nodejs': '#339933',
        'node.js': '#339933',
        'javascript': '#F7DF1E',
        'typescript': '#3178C6',
        'postgresql': '#336791',
        'postgres': '#336791',
    };
    return colorMap[normalizedSlug] || '#5e5ce6'; // Default indigo
};

export const getTopicImage = (topicSlug) => {
    const normalizedSlug = topicSlug?.toLowerCase().trim() || '';

    const imageMap = {
        'mongodb': '/images/topics/mongodb.svg',
        'mongo': '/images/topics/mongodb.svg',
        'express': '/images/topics/express.svg',
        'expressjs': '/images/topics/express.svg',
        'express.js': '/images/topics/express.svg',
        'react': '/images/topics/react.png',
        'reactjs': '/images/topics/react.png',
        'react.js': '/images/topics/react.png',
        'dsa': '/images/topics/dsa.svg',
        'data structures & algorithms': '/images/topics/dsa.svg',
        'data structures': '/images/topics/dsa.svg',
        'algorithms': '/images/topics/dsa.svg',
        'node': '/images/topics/nodejs.png',
        'nodejs': '/images/topics/nodejs.png',
        'node.js': '/images/topics/nodejs.png',
        'javascript': '/images/topics/javascript.png',
        'typescript': '/images/topics/typescript.png',
        'postgresql': '/images/topics/postgresql.svg',
        'postgres': '/images/topics/postgresql.svg',
    };

    return imageMap[normalizedSlug] || '/images/topics/dsa.svg';
};
