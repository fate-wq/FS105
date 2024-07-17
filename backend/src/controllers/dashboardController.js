const { db } = require('../config/firebase');
const { ref, onValue, get } = require('firebase/database');

class RealtimeDashboardController {
    async getUsersCount(req, res) {
        try {
            const usersRef = ref(db, 'users');
            onValue(usersRef, (snapshot) => {
                const users = snapshot.val();
                const usersCount = Object.keys(users).length;
                res.json({ usersCount }); // Respond with JSON data
            }, {
                onlyOnce: true
            });
        } catch (error) {
            console.error('Error fetching users count:', error);
            res.status(500).json({ error: 'Error fetching users count' });
        }
    }
    async getAverageTimeSpent(req, res) {
        try {
            const sessionsRef = ref(db, 'sessions');
            const snapshot = await get(sessionsRef);
            const sessions = snapshot.val();
            
            if (sessions) {
                const loggedInDurations = [];
                const nonLoggedInDurations = [];

                Object.values(sessions).forEach(userSessions => {
                    if (userSessions['logged-in']) {
                        Object.values(userSessions['logged-in']).forEach(session => {
                            loggedInDurations.push(session.duration);
                        });
                    }
                    if (userSessions['non-logged-in']) {
                        Object.values(userSessions['non-logged-in']).forEach(session => {
                            nonLoggedInDurations.push(session.duration);
                        });
                    }
                });

                const totalLoggedInDuration = loggedInDurations.reduce((acc, duration) => acc + duration, 0);
                const totalNonLoggedInDuration = nonLoggedInDurations.reduce((acc, duration) => acc + duration, 0);

                const averageLoggedInDuration = loggedInDurations.length ? totalLoggedInDuration / loggedInDurations.length : 0;
                const averageNonLoggedInDuration = nonLoggedInDurations.length ? totalNonLoggedInDuration / nonLoggedInDurations.length : 0;

                res.json({ 
                    averageLoggedInDuration, 
                    averageNonLoggedInDuration,
                    loggedInDurations,
                    nonLoggedInDurations
                });
            } else {
                res.json({ 
                    averageLoggedInDuration: 0, 
                    averageNonLoggedInDuration: 0,
                    loggedInDurations: [], 
                    nonLoggedInDurations: [] 
                });
            }
        } catch (error) {
            console.error('Error fetching session data:', error);
            res.status(500).json({ error: 'Error fetching session data' });
        }
    }
}

module.exports = new RealtimeDashboardController();