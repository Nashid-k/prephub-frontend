
const DEPENDENCY_GRAPH = {
    'javascript': ['html-css-combined'],
    'typescript': ['javascript'],
    'react': ['javascript', 'html-css-combined'],
    'nextjs': ['react'],
    'angular': ['typescript', 'javascript'],
    'vue': ['javascript'],
    'nodejs': ['javascript'],
    'express': ['nodejs'],
    'mongodb': ['javascript'],
    'django': ['python'],
    'flask': ['python'],
    'fastapi': ['python'],
    'spring-boot': ['java'],
    'flutter': ['dart'],
    'system-design': ['database-design', 'api-design'],
    'distributed-systems': ['system-design'],
    'blind-75': ['data-structures'],
    'algorithms': ['data-structures']
};

const PATH_RULES = {
    'new-beginner': {
        include: ['html-css-combined', 'javascript', 'react'],
        exclude: [],
        mustHave: ['html-css-combined']
    },
    'mern-fullstack': {
        keywords: ['mongo', 'express', 'react', 'node', 'javascript', 'html', 'css', 'typescript'], 
        include: ['algorithms', 'blind-75', 'data-structures', 'git'],
        mustHave: ['html-css-combined', 'javascript'],
        exclude: ['python', 'java', 'csharp', 'flutter', 'dart', 'golang', 'angular', 'vue']
    },
    'mean-fullstack': {
        keywords: ['mongo', 'express', 'angular', 'node', 'javascript', 'html', 'css', 'typescript'], 
        include: ['git'],
        mustHave: ['html-css-combined', 'javascript', 'angular', 'nodejs', 'express', 'mongodb'],
        exclude: ['python', 'java', 'csharp', 'flutter', 'dart', 'golang', 'react', 'vue']
    },
    'python-fullstack': {
        keywords: ['python', 'django', 'flask', 'fastapi', 'html', 'css', 'javascript', 'react', 'postgres', 'sql', 'algorithm', 'structure', 'system', 'design'],
        mustHave: ['html-css-combined', 'javascript', 'python'],
        exclude: ['node', 'express', 'mongo', 'java', 'csharp']
    },
    'java-enterprise': {
        keywords: ['java', 'spring', 'html', 'css', 'javascript', 'angular', 'postgres', 'sql', 'algorithm', 'structure', 'system', 'design'],
        mustHave: ['html-css-combined', 'javascript', 'java'],
        exclude: ['node', 'express', 'python', 'react', 'vue']
    },
    'flutter-mobile': {
        keywords: ['flutter', 'dart', 'mobile', 'firebase', 'android', 'ios'],
        mustHave: ['dart', 'flutter'],
        exclude: ['html-css-combined', 'react', 'angular', 'vue', 'algorithm', 'structure', 'system']
    },
    'interview-prep': {
        keywords: ['structure', 'algorithm', 'system', 'design', 'network', 'os', 'operating', 'blind', 'dsa', 'interview', 'code'],
        mustHave: ['blind-75', 'algorithms'],
        exclude: ['react', 'angular', 'vue', 'html', 'css']
    },
    'frontend-specialist': {
        keywords: ['html', 'css', 'javascript', 'typescript', 'react', 'next', 'angular', 'vue', 'tailwind', 'ui', 'ux', 'algorithm', 'structure'],
        mustHave: ['html-css-combined', 'javascript'],
        exclude: ['python', 'java', 'csharp', 'golang', 'sql']
    },
    'backend-specialist': {
        keywords: ['node', 'express', 'mongo', 'postgres', 'sql', 'api', 'cache', 'redis', 'docker', 'system', 'design', 'algorithm', 'structure', 'microservice'],
        mustHave: ['api-design'],
        exclude: ['react', 'angular', 'vue', 'html', 'css']
    },
    'golang-backend': {
        keywords: ['golang', 'go-', 'postgres', 'sql', 'api', 'concurrency', 'docker', 'algorithm', 'structure', 'system'],
        mustHave: ['golang'],
        exclude: ['javascript', 'python', 'java']
    },
    'csharp-dotnet': {
        keywords: ['csharp', 'dotnet', '.net', 'postgres', 'sql', 'api', 'test', 'algorithm', 'structure'],
        mustHave: ['csharp'],
        exclude: ['javascript', 'python', 'java']
    },
    'systems-programming': {
        keywords: ['c-programming', 'rust', 'os', 'operating', 'network', 'kernel', 'embedded', 'algorithm', 'structure', 'low-level'],
        mustHave: ['c-programming', 'algorithms'],
        exclude: ['javascript', 'web', 'html']
    },
    'data-science': {
        keywords: ['python', 'pandas', 'numpy', 'scikit', 'matplotlib', 'seaborn', 'tensorflow', 'pytorch', 'data', 'analysis', 'statistics', 'sql', 'visualization', 'algorithm', 'machine-learning', 'ai'],
        mustHave: ['python', 'algorithms'],
        exclude: ['django', 'flask', 'node', 'react', 'css']
    },
    'game-development': {
        keywords: ['unity', 'unreal', 'godot', 'csharp', 'cpp', 'c-plus-plus', 'game', 'physics', 'graphics', 'shader', '3d', '2d', 'animation', 'algorithm'],
        mustHave: ['algorithms'],
        include: ['csharp'],
        exclude: ['html', 'css', 'react', 'web']
    }
};

const sortTopicsByDependency = (topics) => {
    const topicMap = new Map(topics.map(t => [t.slug, t]));
    const visited = new Set();
    const result = [];
    const tempVisited = new Set();

    const visit = (slug) => {
        if (tempVisited.has(slug) || visited.has(slug)) return;

        tempVisited.add(slug);

        const dependencies = DEPENDENCY_GRAPH[slug] || [];
        for (const depSlug of dependencies) {
            if (topicMap.has(depSlug)) {
                visit(depSlug);
            }
        }

        tempVisited.delete(slug);
        visited.add(slug);
        
        const topic = topicMap.get(slug);
        if (topic) result.push(topic);
    };

    topics.forEach(t => {
        if (t.slug !== 'dsa') {
            visit(t.slug);
        }
    });

    return result;
};

export const generateSmartPath = (allTopics, pathId) => {
    if (!pathId || pathId === 'all' || !PATH_RULES[pathId]) {
        return sortTopicsByDependency(allTopics); 
    }

    const rules = PATH_RULES[pathId];
    
    let filteredTopics = allTopics.filter(topic => {
        const slug = topic.slug.toLowerCase();
        
        if (rules.exclude && rules.exclude.some(ex => slug.includes(ex))) return false;
        if (rules.include && rules.include.includes(slug)) return true;
        if (rules.mustHave && rules.mustHave.includes(slug)) return true;
        if (rules.keywords) return rules.keywords.some(k => slug.includes(k));

        return false;
    });

    if (rules.mustHave) {
        rules.mustHave.forEach(mustSlug => {
            const alreadyIn = filteredTopics.find(t => t.slug === mustSlug);
            if (!alreadyIn) {
                const found = allTopics.find(t => t.slug === mustSlug);
                if (found) filteredTopics.push(found);
            }
        });
    }

    return sortTopicsByDependency(filteredTopics);
};

export const getPathMetadata = (pathId) => {
    return PATH_RULES[pathId] || {};
};

export const getNextRecommendation = (topics) => {
    if (!topics || topics.length === 0) return null;
    
    return topics.find(t => {
        const p = t.progress !== undefined ? t.progress : (t.completionPercentage || 0);
        return p < 100;
    }) || null;
};
