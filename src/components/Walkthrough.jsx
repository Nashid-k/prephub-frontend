
import React, { useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

const Walkthrough = ({ run, onClose }) => {
    useEffect(() => {
        if (!run) return;

        const driverObj = driver({
            showProgress: true,
            animate: true,
            allowClose: false,
            doneBtnText: 'Get Started',
            nextBtnText: 'Next',
            prevBtnText: 'Previous',
            onDestroyStarted: () => {
                if (onClose) onClose();
                driverObj.destroy();
            },
            steps: [
                {
                    element: '#dashboard-header',
                    popover: {
                        title: 'Welcome to PrepHub! 🚀',
                        description: 'Your ultimate companion for mastering the MERN stack. Let\'s show you around.',
                        side: 'bottom',
                        align: 'start'
                    }
                },
                {
                    element: '#stats-overview',
                    popover: {
                        title: 'Track Your Progress 📊',
                        description: 'See your solved problems, current streak, and total study time at a glance.',
                        side: 'bottom'
                    }
                },
                {
                    element: '#study-topics',
                    popover: {
                        title: 'Structured Curriculum 📚',
                        description: 'Dive into meticulously organized topics from React Basics to System Design.',
                        side: 'top'
                    }
                },
                {
                    element: '#navbar-profile',
                    popover: {
                        title: 'Your Profile 👤',
                        description: 'Manage your settings, view your achievements, and log out here.',
                        side: 'bottom'
                    }
                }
            ]
        });

        driverObj.drive();

        return () => {
            driverObj.destroy();
        };
    }, [run, onClose]);

    return null;
};

export default Walkthrough;
