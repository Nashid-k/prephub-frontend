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
        'operating-systems': '#4361EE', 
        'operating systems': '#4361EE',
        'os': '#4361EE',
        'system-design': '#F72585', 
        'system design': '#F72585',
        'networking': '#4CC9F0', 
        'computer-networking': '#4CC9F0',
        'devops': '#7209B7', 
        'devops-basics': '#7209B7',
        'engineering-practices': '#7209B7',
        'python': '#306998', 
        'django': '#092E20', 
        'flutter': '#02569B', 
        'dart': '#0175C2', 
        'nextjs': '#000000', 
        'next.js': '#000000',
        'next': '#000000',
        'golang': '#00ADD8', 
        'go': '#00ADD8',
        'angular': '#DD0031', 
        'java': '#F89820', 
        'c-programming': '#A8B9CC', 
        'c': '#A8B9CC',
        'csharp': '#68217A', 
        'c#': '#68217A',
        'html-css-combined': '#E34F26', 
        'html & css combined': '#E34F26',
        'html': '#E34F26',
        'css': '#1572B6',
    };

    // Darker variants for Light Mode (accessibility/contrast fixes)
    const lightModeMap = {
        'react': '#0077cd',
        'react.js': '#0077cd',
        'javascript': '#b58900', // Darker gold
        'dsa': '#d93025', // Darker red
        'typescript': '#0050b3', // Darker blue
        'networking': '#0079a0',
        'computer-networking': '#0079a0',
        'html-css-combined': '#c73e1d',
        'html': '#c73e1d',
        'css': '#0c5460',
        'c-programming': '#5c6b7f', // Darker slate
        'c': '#5c6b7f',
        'node': '#1e7e34',
        'nodejs': '#1e7e34',
        'node.js': '#1e7e34',
    };

    // If light mode and we have a high-contrast override, use it. 
    // Otherwise check generic colorMap.
    if (!isDark) {
        if (lightModeMap[normalizedSlug]) return lightModeMap[normalizedSlug];
        // If exact match not found, check if colorMap value is too light?
        // For now, rely on manual overrides.
    }

    return colorMap[normalizedSlug] || (isDark ? '#5e5ce6' : '#4e4cb8'); // Default indigo (darker in light mode)
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
        'operating-systems': '/images/topics/operating-systems.png',
        'operating systems': '/images/topics/operating-systems.png',
        'os': '/images/topics/operating-systems.png',
        'system-design': '/images/topics/system-design.png',
        'system design': '/images/topics/system-design.png',
        'networking': '/images/topics/networking.png',
        'computer-networking': '/images/topics/networking.png',
        'devops': '/images/topics/devops.png',
        'devops-basics': '/images/topics/devops.png',
        'engineering-practices': '/images/topics/devops.png',
        'python': '/images/python.png',
        'django': '/images/django.png',
        'flutter': '/images/flutter.png',
        'dart': '/images/dart.png',
        'nextjs': '/images/nextjs.png',
        'next.js': '/images/nextjs.png',
        'next': '/images/nextjs.png',
        'golang': '/images/golang.png',
        'go': '/images/golang.png',
        'angular': '/images/angular.png',
        'java': '/images/java.png',
        'c-programming': '/images/c.png',
        'c': '/images/c.png',
        'csharp': '/images/csharp.png',
        'c#': '/images/csharp.png',
        'html-css-combined': '/images/topics/html-css.png',
        'html & css combined': '/images/topics/html-css.png',
        'html': '/images/topics/html-css.png',
        'css': '/images/topics/html-css.png',
        'machine-learning': '/images/topics/machine-learning.png',
        'machine learning': '/images/topics/machine-learning.png',
        'ml': '/images/topics/machine-learning.png',
        'data-analyst': '/images/topics/data-analyst.png',
        'data analyst': '/images/topics/data-analyst.png',
        'data-analysis': '/images/topics/data-analyst.png',
    };

    return imageMap[normalizedSlug] || '/images/topics/dsa.svg';
};
