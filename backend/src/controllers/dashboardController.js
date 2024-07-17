const { db } = require('../config/firebase');
const { ref, onValue } = require('firebase/database');

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
}

module.exports = new RealtimeDashboardController();
