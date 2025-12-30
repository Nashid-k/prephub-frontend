import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import { useTheme } from '../../context/ThemeContext';

/**
 * GitHub-style activity heatmap showing study consistency
 * @param {Array} studyDates - Array of date strings when user studied
 */
const StudyHeatmap = ({ studyDates = [] }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    // Generate last 12 weeks (84 days)
    const weeks = 12;
    const days = weeks * 7;
    const today = new Date();
    const heatmapData = [];

    // Create date map for quick lookup
    const dateMap = new Set(studyDates.map(d => new Date(d).toDateString()));

    // Generate grid data
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toDateString();
        heatmapData.push({
            date: dateStr,
            active: dateMap.has(dateStr),
            dayOfWeek: date.getDay(),
        });
    }

    // Group by weeks
    const weekGroups = [];
    for (let i = 0; i < heatmapData.length; i += 7) {
        weekGroups.push(heatmapData.slice(i, i + 7));
    }

    const getColor = (isActive) => {
        if (!isActive) {
            return isDark ? '#1c1c1e' : '#ebedf0';
        }
        return isDark ? '#30d158' : '#40c463';
    };

    return (
        <Box>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
                Study Activity (Last {weeks} Weeks)
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, overflowX: 'auto' }}>
                {weekGroups.map((week, weekIdx) => (
                    <Box key={weekIdx} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {week.map((day, dayIdx) => (
                            <Tooltip
                                key={dayIdx}
                                title={`${day.date}${day.active ? ' ✓' : ''}`}
                                arrow
                            >
                                <Box
                                    sx={{
                                        width: 12,
                                        height: 12,
                                        borderRadius: 0.5,
                                        background: getColor(day.active),
                                        cursor: 'pointer',
                                        transition: 'transform 0.2s',
                                        '&:hover': {
                                            transform: 'scale(1.2)',
                                        },
                                    }}
                                />
                            </Tooltip>
                        ))}
                    </Box>
                ))}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                    Less
                </Typography>
                {[false, true].map((active, idx) => (
                    <Box
                        key={idx}
                        sx={{
                            width: 12,
                            height: 12,
                            borderRadius: 0.5,
                            background: getColor(active),
                        }}
                    />
                ))}
                <Typography variant="caption" color="text.secondary">
                    More
                </Typography>
            </Box>
        </Box>
    );
};

export default React.memo(StudyHeatmap);
