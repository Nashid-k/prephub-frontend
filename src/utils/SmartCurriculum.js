
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
        experienceLevels: {
            '0-1_year': ['html-css-combined', 'git-version-control', 'javascript', 'react'],
            '1-3_years': ['typescript', 'react', 'nextjs', 'dsa'],
            '3-5_years': ['system-design', 'algorithms', 'blind-75']
        },
        mustHave: ['html-css-combined', 'javascript', 'git-version-control']
    },
    'mern-fullstack': {
        experienceLevels: {
            '0-1_year': ['html-css-combined', 'git-version-control', 'javascript', 'react', 'nodejs', 'express', 'mongodb', 'postgresql'],
            '1-3_years': ['typescript', 'nextjs', 'data-structures', 'algorithms', 'blind-75', 'api-design'],
            '3-5_years': ['system-design', 'distributed-systems', 'aws-cloud', 'concurrency', 'caching-performance', 'security-engineering']
        },
        mustHave: ['html-css-combined', 'javascript', 'react', 'nodejs', 'mongodb']
    },
    'mean-fullstack': {
        experienceLevels: {
            '0-1_year': ['html-css-combined', 'git-version-control', 'javascript', 'angular', 'nodejs', 'express', 'mongodb', 'postgresql'],
            '1-3_years': ['typescript', 'data-structures', 'algorithms', 'blind-75', 'api-design'],
            '3-5_years': ['system-design', 'distributed-systems', 'aws-cloud', 'concurrency', 'security-engineering']
        },
        mustHave: ['html-css-combined', 'javascript', 'angular', 'nodejs', 'mongodb']
    },
    'python-fullstack': {
        experienceLevels: {
            '0-1_year': ['html-css-combined', 'git-version-control', 'javascript', 'python', 'django', 'postgresql'],
            '1-3_years': ['react', 'typescript', 'data-structures', 'algorithms', 'blind-75', 'mongodb'],
            '3-5_years': ['system-design', 'distributed-systems', 'aws-cloud', 'api-design']
        },
        mustHave: ['python', 'django', 'postgresql', 'algorithms']
    },
    'java-enterprise': {
        experienceLevels: {
            '0-1_year': ['html-css-combined', 'git-version-control', 'javascript', 'java', 'postgresql'],
            '1-3_years': ['mongodb', 'data-structures', 'algorithms', 'blind-75', 'api-design'],
            '3-5_years': ['system-design', 'distributed-systems', 'aws-cloud', 'concurrency', 'security-engineering']
        },
        mustHave: ['java', 'postgresql', 'algorithms', 'system-design']
    },
    'flutter-mobile': {
        experienceLevels: {
            '0-1_year': ['html-css-combined', 'git-version-control', 'dart', 'flutter'],
            '1-3_years': ['data-structures', 'algorithms', 'blind-75', 'api-design'],
            '3-5_years': ['aws-cloud', 'system-design', 'caching-performance']
        },
        mustHave: ['dart', 'flutter', 'data-structures']
    },
    'frontend-specialist': {
        experienceLevels: {
            '0-1_year': ['html-css-combined', 'git-version-control', 'javascript', 'react'],
            '1-3_years': ['typescript', 'nextjs', 'angular', 'data-structures', 'api-design'],
            '3-5_years': ['system-design', 'algorithms', 'caching-performance', 'code-quality', 'aws-cloud']
        },
        mustHave: ['html-css-combined', 'javascript', 'react']
    },
    'backend-specialist': {
        experienceLevels: {
            '0-1_year': ['git-version-control', 'javascript', 'nodejs', 'express', 'postgresql', 'mongodb'],
            '1-3_years': ['python', 'django', 'typescript', 'data-structures', 'algorithms', 'blind-75', 'api-design'],
            '3-5_years': ['system-design', 'distributed-systems', 'concurrency', 'caching-performance', 'security-engineering', 'reliability-observability', 'aws-cloud']
        },
        mustHave: ['nodejs', 'postgresql', 'algorithms', 'api-design']
    },
    'golang-backend': {
        experienceLevels: {
            '0-1_year': ['git-version-control', 'golang', 'postgresql'],
            '1-3_years': ['mongodb', 'data-structures', 'algorithms', 'blind-75', 'api-design', 'concurrency'],
            '3-5_years': ['system-design', 'distributed-systems', 'networking', 'caching-performance', 'aws-cloud']
        },
        mustHave: ['golang', 'postgresql', 'algorithms', 'concurrency']
    },
    'csharp-dotnet': {
        experienceLevels: {
            '0-1_year': ['git-version-control', 'csharp', 'dotnet', 'postgresql'],
            '1-3_years': ['data-structures', 'algorithms', 'blind-75', 'api-design'],
            '3-5_years': ['system-design', 'distributed-systems', 'aws-cloud']
        },
        mustHave: ['csharp', 'dotnet', 'algorithms']
    },
    'machine-learning-engineer': {
        experienceLevels: {
            '0-1_year': ['git-version-control', 'python', 'postgresql', 'data-structures'],
            '1-3_years': ['machine-learning', 'data-analyst', 'mongodb', 'algorithms'],
            '3-5_years': ['system-design', 'distributed-systems', 'aws-cloud', 'blind-75']
        },
        mustHave: ['python', 'machine-learning', 'algorithms']
    },
    'data-analyst': {
        experienceLevels: {
            '0-1_year': ['git-version-control', 'python', 'postgresql'],
            '1-3_years': ['data-analyst', 'machine-learning', 'mongodb', 'data-structures'],
            '3-5_years': ['aws-cloud', 'algorithms']
        },
        mustHave: ['python', 'data-analyst', 'postgresql']
    },
    'aws-cloud-architect': {
        experienceLevels: {
            '0-1_year': ['git-version-control', 'aws-cloud', 'networking', 'os'],
            '1-3_years': ['python', 'dsa', 'system-design', 'security-engineering'],
            '3-5_years': ['distributed-systems', 'concurrency', 'reliability-observability']
        },
        mustHave: ['aws-cloud', 'system-design']
    },
    'interview-prep': {
        experienceLevels: {
            '0-1_year': ['dsa', 'data-structures', 'algorithms', 'blind-75', 'python'],
            '1-3_years': ['system-design', 'git-version-control', 'networking', 'os', 'api-design'],
            '3-5_years': ['distributed-systems', 'concurrency', 'security-engineering']
        },
        mustHave: ['dsa', 'blind-75', 'algorithms', 'system-design']
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
        // Run topological sort
        visit(t.slug);
    });

    return result;
};

export const generateSmartPath = (allTopics, pathId, experienceLevel = '0-1_year') => {
    if (!pathId || pathId === 'all' || !PATH_RULES[pathId]) {
        return sortTopicsByDependency(allTopics); 
    }

    const rules = PATH_RULES[pathId];
    let selectedSlugs = new Set();

    // 1. Get topics based on experience level
    if (rules.experienceLevels) {
        // Add current level topics
        if (rules.experienceLevels[experienceLevel]) {
             rules.experienceLevels[experienceLevel].forEach(slug => selectedSlugs.add(slug));
        }
        
        // Add previous levels (cumulative learning)
        if (experienceLevel === '1-3_years') {
             rules.experienceLevels['0-1_year']?.forEach(slug => selectedSlugs.add(slug));
        } else if (experienceLevel === '3-5_years') {
             rules.experienceLevels['0-1_year']?.forEach(slug => selectedSlugs.add(slug));
             rules.experienceLevels['1-3_years']?.forEach(slug => selectedSlugs.add(slug));
        }
    }

    // 2. Add must haves (if not already included)
    if (rules.mustHave) {
        rules.mustHave.forEach(slug => selectedSlugs.add(slug));
    }

    // 3. Filter allTopics based on selected slugs
    let filteredTopics = allTopics.filter(topic => {
        // Also support partial matching/keywords if needed, but strict slug matching is safer for tiered
        return selectedSlugs.has(topic.slug);
    });

    // 4. Fallback: If no experienceLevels defined (legacy), use old logic (keywords inclusion)
    if (!rules.experienceLevels && rules.keywords) {
         filteredTopics = allTopics.filter(topic => {
            const slug = topic.slug.toLowerCase();
            if (rules.exclude && rules.exclude.some(ex => slug.includes(ex))) return false;
            if (rules.include && rules.include.includes(slug)) return true;
            if (rules.mustHave && rules.mustHave.includes(slug)) return true;
            if (rules.keywords) return rules.keywords.some(k => slug.includes(k));
            return false;
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
