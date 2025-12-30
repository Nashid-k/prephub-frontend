import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { useTheme } from '../../context/ThemeContext';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

/**
 * Bar chart showing time spent per topic
 * @param {Array} topics - Array of {name, timeSpent (minutes)}
 */
const TimeSpentChart = ({ topics = [] }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const data = {
        labels: topics.map(t => t.name),
        datasets: [
            {
                label: 'Hours Studied',
                data: topics.map(t => Math.round((t.timeSpent || 0) / 60 * 10) / 10), // Convert to hours
                backgroundColor: isDark ? '#5e5ce6' : '#0a84ff',
                borderRadius: 8,
                barThickness: 40,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: isDark ? '#2c2c2e' : '#ffffff',
                titleColor: isDark ? '#ffffff' : '#000000',
                bodyColor: isDark ? '#ffffff' : '#000000',
                borderColor: isDark ? '#3a3a3c' : '#e5e5ea',
                borderWidth: 1,
                callbacks: {
                    label: (context) => {
                        const hours = context.parsed.y;
                        const minutes = topics[context.dataIndex]?.timeSpent || 0;
                        return `${hours}h ${minutes % 60}m`;
                    },
                },
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: isDark ? '#8e8e93' : '#3a3a3c',
                },
            },
            y: {
                grid: {
                    color: isDark ? '#3a3a3c' : '#e5e5ea',
                },
                ticks: {
                    color: isDark ? '#8e8e93' : '#3a3a3c',
                    callback: (value) => `${value}h`,
                },
            },
        },
    };

    if (topics.length === 0) {
        return (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                    No study time recorded yet. Keep learning!
                </Typography>
            </Paper>
        );
    }

    return (
        <Box>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
                Time Spent by Topic
            </Typography>
            <Box sx={{ height: 300 }}>
                <Bar data={data} options={options} />
            </Box>
        </Box>
    );
};

export default React.memo(TimeSpentChart);
