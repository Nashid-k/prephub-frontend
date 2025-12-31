import React, { useMemo, useState } from 'react';
import { Box, Typography, Tooltip, Chip, useTheme as useMuiTheme, IconButton } from '@mui/material';
import { LocalFireDepartment, CalendarMonth, ChevronLeft, ChevronRight } from '@mui/icons-material';

/**
 * Monthly activity heatmap showing study consistency
 * @param {Array} studyDates - Array of date strings when user studied
 */
const StudyHeatmap = ({ studyDates = [] }) => {
    const theme = useMuiTheme();
    const isDark = theme.palette.mode === 'dark';

    // State for current viewing month/year
    const [viewDate, setViewDate] = useState(new Date());

    const { heatmapData, weekGroups, monthLabel, streakInfo, isCurrentMonth } = useMemo(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();

        // Get first and last day of the month
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();

        // Create date map for quick lookup
        const dateMap = new Set(studyDates.map(d => new Date(d).toDateString()));

        // Generate calendar data
        const data = [];

        // Get day of week for first day (0 = Sunday, 1 = Monday, etc.)
        const startDayOfWeek = firstDay.getDay();

        // Add empty cells for days before the month starts
        for (let i = 0; i < startDayOfWeek; i++) {
            data.push({
                date: null,
                dateStr: '',
                active: false,
                dayOfWeek: i,
                isEmpty: true
            });
        }

        // Add all days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateStr = date.toDateString();
            data.push({
                date: date,
                dateStr: dateStr,
                active: dateMap.has(dateStr),
                dayOfWeek: date.getDay(),
                isEmpty: false
            });
        }

        // Group by weeks (7 days per week)
        const groups = [];
        for (let i = 0; i < data.length; i += 7) {
            groups.push(data.slice(i, i + 7));
        }

        // Get month label
        const label = firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        // Calculate streak (only for current month and past)
        const today = new Date();
        const todayStr = today.toDateString();
        let currentStreak = 0;
        let maxStreak = 0;
        let tempStreak = 0;

        // Only calculate if viewing current month or earlier
        const now = new Date();
        if (year <= now.getFullYear() && month <= now.getMonth()) {
            // Count from most recent backwards
            const allDates = [];
            for (let i = 0; i <= 365; i++) {
                const d = new Date(now);
                d.setDate(d.getDate() - i);
                allDates.push({
                    dateStr: d.toDateString(),
                    active: dateMap.has(d.toDateString())
                });
            }

            for (let i = 0; i < allDates.length; i++) {
                if (allDates[i].active) {
                    tempStreak++;
                    if (i === 0 || currentStreak > 0) {
                        currentStreak = tempStreak;
                    }
                    maxStreak = Math.max(maxStreak, tempStreak);
                } else {
                    if (currentStreak === 0) {
                        tempStreak = 0;
                    }
                }
            }
        }

        const totalActiveDays = data.filter(d => d.active).length;

        // Check if this is the current month
        const isCurrent = year === now.getFullYear() && month === now.getMonth();

        return {
            heatmapData: data,
            weekGroups: groups,
            monthLabel: label,
            streakInfo: { currentStreak, maxStreak, totalActiveDays },
            isCurrentMonth: isCurrent
        };
    }, [studyDates, viewDate]);

    const getColor = (isActive) => {
        if (!isActive) {
            return isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
        }
        return isDark
            ? 'linear-gradient(135deg, #30d158 0%, #32d74b 100%)'
            : 'linear-gradient(135deg, #34c759 0%, #30d158 100%)';
    };

    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const handlePreviousMonth = () => {
        setViewDate(prevDate => {
            const newDate = new Date(prevDate);
            newDate.setMonth(newDate.getMonth() - 1);
            return newDate;
        });
    };

    const handleNextMonth = () => {
        if (!isCurrentMonth) {
            setViewDate(prevDate => {
                const newDate = new Date(prevDate);
                newDate.setMonth(newDate.getMonth() + 1);
                return newDate;
            });
        }
    };

    return (
        <Box>
            {/* Header with Stats */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                        sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #5e5ce620 0%, #5e5ce610 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid',
                            borderColor: '#5e5ce630',
                        }}
                    >
                        <CalendarMonth sx={{ color: '#5e5ce6', fontSize: 24 }} />
                    </Box>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                            Study Activity
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconButton
                                size="small"
                                onClick={handlePreviousMonth}
                                sx={{
                                    bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                                    '&:hover': {
                                        bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                                    },
                                }}
                            >
                                <ChevronLeft sx={{ fontSize: 18 }} />
                            </IconButton>
                            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 140, textAlign: 'center', fontWeight: 600 }}>
                                {monthLabel}
                            </Typography>
                            <IconButton
                                size="small"
                                onClick={handleNextMonth}
                                disabled={isCurrentMonth}
                                sx={{
                                    bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                                    '&:hover': {
                                        bgcolor: isCurrentMonth ? 'transparent' : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'),
                                    },
                                    '&.Mui-disabled': {
                                        opacity: 0.3,
                                    },
                                }}
                            >
                                <ChevronRight sx={{ fontSize: 18 }} />
                            </IconButton>
                        </Box>
                    </Box>
                </Box>

                {/* Stats Chips */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Chip
                        icon={<LocalFireDepartment sx={{ fontSize: 18 }} />}
                        label={`${streakInfo.currentStreak} day streak`}
                        sx={{
                            bgcolor: streakInfo.currentStreak > 0 ? '#ff9f0a20' : 'rgba(128,128,128,0.1)',
                            color: streakInfo.currentStreak > 0 ? '#ff9f0a' : 'text.secondary',
                            fontWeight: 700,
                            borderRadius: '12px',
                            height: 36,
                            '& .MuiChip-icon': {
                                color: streakInfo.currentStreak > 0 ? '#ff9f0a' : 'text.secondary',
                            }
                        }}
                    />
                    <Chip
                        label={`${streakInfo.totalActiveDays} days this month`}
                        sx={{
                            bgcolor: '#5e5ce620',
                            color: '#5e5ce6',
                            fontWeight: 700,
                            borderRadius: '12px',
                            height: 36,
                        }}
                    />
                </Box>
            </Box>

            {/* Heatmap Grid */}
            <Box sx={{ overflowX: 'auto', pb: 2 }}>
                <Box sx={{ minWidth: 400 }}>
                    {/* Day of Week Headers */}
                    <Box sx={{ display: 'flex', gap: '3px', mb: 2 }}>
                        {dayLabels.map((day, idx) => (
                            <Box key={idx} sx={{ flex: 1, textAlign: 'center', minWidth: 40 }}>
                                <Typography variant="caption" sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 600 }}>
                                    {day}
                                </Typography>
                            </Box>
                        ))}
                    </Box>

                    {/* Heatmap Cells */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        {weekGroups.map((week, weekIdx) => (
                            <Box key={weekIdx} sx={{ display: 'flex', gap: '3px' }}>
                                {week.map((day, dayIdx) => {
                                    if (day.isEmpty) {
                                        return <Box key={dayIdx} sx={{ flex: 1, minWidth: 40, height: 40 }} />;
                                    }

                                    return (
                                        <Tooltip
                                            key={dayIdx}
                                            title={
                                                <Box sx={{ textAlign: 'center', py: 0.5 }}>
                                                    <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
                                                        {day.date.toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ fontSize: '0.7rem', opacity: 0.8 }}>
                                                        {day.active ? '✓ Studied' : 'No activity'}
                                                    </Typography>
                                                </Box>
                                            }
                                            arrow
                                            placement="top"
                                        >
                                            <Box
                                                sx={{
                                                    flex: 1,
                                                    minWidth: 40,
                                                    height: 40,
                                                    borderRadius: '8px',
                                                    background: getColor(day.active),
                                                    border: '1px solid',
                                                    borderColor: day.active
                                                        ? (isDark ? 'rgba(48, 209, 88, 0.3)' : 'rgba(52, 199, 89, 0.3)')
                                                        : 'transparent',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1)',
                                                    boxShadow: day.active ? '0 2px 8px rgba(48, 209, 88, 0.2)' : 'none',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    '&:hover': {
                                                        transform: 'scale(1.1)',
                                                        boxShadow: day.active
                                                            ? '0 4px 12px rgba(48, 209, 88, 0.4)'
                                                            : '0 2px 8px rgba(0, 0, 0, 0.1)',
                                                        zIndex: 10,
                                                    },
                                                }}
                                            >
                                                <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                                                    {day.date.getDate()}
                                                </Typography>
                                            </Box>
                                        </Tooltip>
                                    );
                                })}
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Box>

            {/* Legend */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 3, justifyContent: 'flex-end' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                    Less
                </Typography>
                {[false, true].map((active, idx) => (
                    <Box
                        key={idx}
                        sx={{
                            width: 20,
                            height: 20,
                            borderRadius: '4px',
                            background: getColor(active),
                            border: '1px solid',
                            borderColor: active
                                ? (isDark ? 'rgba(48, 209, 88, 0.3)' : 'rgba(52, 199, 89, 0.3)')
                                : 'transparent',
                        }}
                    />
                ))}
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                    More
                </Typography>
            </Box>
        </Box>
    );
};

export default React.memo(StudyHeatmap);
