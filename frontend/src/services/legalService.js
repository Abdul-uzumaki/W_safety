import bnsData from './bns_model.json';

/**
 * Returns all BNS issues related to women's safety extracted from the dataset
 */
export const getBnsIssues = () => {
    return bnsData;
};

/**
 * Returns detailed laws for a set of IDs
 * @param {Array} ids - Array of section IDs (e.g., ['bns_63', 'bns_78'])
 */
export const getLawDetails = (ids) => {
    if (!ids || (Array.isArray(ids) && ids.length === 0)) return [];
    const idArray = Array.isArray(ids) ? ids : [ids];
    return bnsData.filter(issue => idArray.includes(issue.id));
};

/**
 * A simulated AI model that matches user description to BNS legal issues
 * In a real app, this would call a backend vector-search or LLM
 * @param {string} description - The user's incident report description
 */
export const matchIssueToBns = (description) => {
    if (!description || description.length < 5) return [];

    const input = description.toLowerCase();

    // Keyword weights for better matching
    const matches = bnsData.map(issue => {
        let score = 0;
        const label = issue.label.toLowerCase();
        const desc = issue.description.toLowerCase();

        // Match label words
        label.split(/[\s,.]+/).forEach(word => {
            if (word.length > 3 && input.includes(word)) score += 5;
        });

        // Match specific high-value keywords in description or label
        const keywordWeights = [
            { word: 'rape', weight: 15 },
            { word: 'harassment', weight: 10 },
            { word: 'stalking', weight: 10 },
            { word: 'voyeurism', weight: 10 },
            { word: 'marriage', weight: 8 },
            { word: 'dowry', weight: 15 },
            { word: 'cruelty', weight: 12 },
            { word: 'wife', weight: 8 },
            { word: 'threat', weight: 5 },
            { word: 'force', weight: 5 },
            { word: 'privacy', weight: 8 },
            { word: 'modesty', weight: 12 },
            { word: 'miscarriage', weight: 15 },
            { word: 'trafficking', weight: 15 }
        ];

        keywordWeights.forEach(k => {
            if (input.includes(k.word)) {
                if (label.includes(k.word)) score += k.weight;
                if (desc.includes(k.word)) score += k.weight / 2;
            }
        });

        return { ...issue, score };
    });

    // Sort by score and filter out low matches
    return matches
        .filter(m => m.score >= 5)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);
};

/**
 * Returns filing steps for a specific issue
 */
export const getFilingSteps = (issueId) => {
    const issue = bnsData.find(i => i.id === issueId);
    return issue ? issue.filingSteps : [];
};

