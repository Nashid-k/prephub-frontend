
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
            '3-5_years': ['system-design', 'security', 'performance']
        },
        mustHave: ['html-css-combined', 'javascript', 'git-version-control']
    },
    'mern-fullstack': {
        experienceLevels: {
            '0-1_year': ['html-css-combined', 'git-version-control', 'javascript', 'react', 'nodejs', 'express', 'mongodb'],
            '1-3_years': ['typescript', 'nextjs', 'dsa', 'algorithms', 'testing', 'redis-caching'],
            '3-5_years': ['system-design', 'distributed-systems', 'microservices', 'advanced-security', 'performance', 'aws-cloud']
        },
        mustHave: ['html-css-combined', 'javascript', 'dsa', 'mern-stack']
    },
    'mean-fullstack': {
        experienceLevels: {
            '0-1_year': ['html-css-combined', 'git-version-control', 'javascript', 'angular', 'nodejs', 'express', 'mongodb'],
            '1-3_years': ['typescript', 'rxjs', 'dsa', 'algorithms', 'testing'],
            '3-5_years': ['system-design', 'distributed-systems', 'microservices', 'performance', 'aws-cloud']
        },
        mustHave: ['html-css-combined', 'javascript', 'angular', 'nodejs'] 
    },
    'python-fullstack': {
        experienceLevels: {
            '0-1_year': ['html-css-combined', 'git-version-control', 'javascript', 'python', 'django', 'sql'],
            '1-3_years': ['react', 'flask', 'fastapi', 'dsa', 'algorithms', 'docker'],
            '3-5_years': ['system-design', 'distributed-systems', 'microservices', 'aws-cloud']
        },
        mustHave: ['python', 'django', 'javascript']
    },
    'java-enterprise': {
        experienceLevels: {
            '0-1_year': ['html-css-combined', 'git-version-control', 'javascript', 'java', 'spring-boot', 'sql'],
            '1-3_years': ['angular', 'hibernate', 'dsa', 'algorithms', 'docker', 'junit'],
            '3-5_years': ['system-design', 'distributed-systems', 'microservices', 'aws-cloud']
        },
        mustHave: ['java', 'spring-boot', 'sql']
    },
    'flutter-mobile': {
        experienceLevels: {
            '0-1_year': ['git-version-control', 'dart', 'flutter', 'firebase'],
            '1-3_years': ['state-management', 'native-integrations', 'dsa', 'algorithms', 'testing'],
            '3-5_years': ['system-design', 'mobile-architecture', 'ci-cd', 'performance', 'aws-cloud']
        },
        mustHave: ['dart', 'flutter', 'dsa']
    },
    'frontend-specialist': {
        experienceLevels: {
            '0-1_year': ['html-css-combined', 'git-version-control', 'javascript', 'react', 'tailwind'],
            '1-3_years': ['typescript', 'nextjs', 'vue', 'testing', 'accessibility', 'state-management'],
            '3-5_years': ['system-design', 'web-performance', 'micro-frontends', 'security', 'aws-cloud']
        },
        mustHave: ['html-css-combined', 'javascript', 'react']
    },
    'backend-specialist': {
        experienceLevels: {
            '0-1_year': ['git-version-control', 'javascript', 'nodejs', 'express', 'sql', 'mongodb'],
            '1-3_years': ['typescript', 'postgres', 'redis', 'docker', 'dsa', 'testing'],
            '3-5_years': ['system-design', 'distributed-systems', 'microservices', 'kubernetes', 'aws-cloud']
        },
        mustHave: ['nodejs', 'sql', 'api-design']
    },
    'golang-backend': {
        experienceLevels: {
            '0-1_year': ['git-version-control', 'golang', 'sql', 'docker'],
            '1-3_years': ['grpc', 'microservices', 'dsa', 'concurrency', 'postgres'],
            '3-5_years': ['system-design', 'distributed-systems', 'kubernetes', 'aws-cloud']
        },
        mustHave: ['golang', 'sql']
    },
    'csharp-dotnet': {
        experienceLevels: {
            '0-1_year': ['git-version-control', 'csharp', 'dotnet', 'sql', 'html-css-combined'],
            '1-3_years': ['entity-framework', 'dsa', 'azure', 'testing', 'microservices'],
            '3-5_years': ['system-design', 'distributed-systems', 'cloud-architecture', 'performance', 'aws-cloud']
        },
        mustHave: ['csharp', 'dotnet']
    },
    'machine-learning-engineer': {
        experienceLevels: {
            '0-1_year': ['git-version-control', 'python', 'sql', 'statistics', 'pandas', 'numpy'],
            '1-3_years': ['machine-learning', 'data-analyst', 'algorithms', 'data-visualization', 'docker'],
            '3-5_years': ['deep-learning', 'distributed-systems', 'aws-cloud', 'mlops', 'system-design']
        },
        mustHave: ['python', 'machine-learning', 'math']
    },
    'data-analyst': {
        experienceLevels: {
            '0-1_year': ['git-version-control', 'python', 'sql', 'excel-advanced', 'statistics'],
            '1-3_years': ['data-analyst', 'pandas', 'visualization-libs', 'tableau-powerbi'],
            '3-5_years': ['machine-learning', 'big-data', 'aws-cloud', 'data-modeling']
        },
        mustHave: ['python', 'sql', 'data-analyst']
    },
    'aws-cloud-architect': {
        experienceLevels: {
            '0-1_year': ['git-version-control', 'linux-basics', 'networking-basics', 'aws-cloud'],
            '1-3_years': ['docker', 'kubernetes', 'terraform', 'python', 'dsa'],
            '3-5_years': ['system-design', 'distributed-systems', 'security-specialty', 'advanced-networking']
        },
        mustHave: ['aws-cloud', 'linux-basics']
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
