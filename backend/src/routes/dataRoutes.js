const express = require('express');
const {setData,updateUserData} = require('../controllers/dataController');

const router = express.Router();

router.post('/data',setData);

router.post('/updateProfile', updateUserData);

router.post('/jobPosting', async (req, res) => {
    const {
        userId,
        jobTitle,
        workingLocation,
        workingHours,
        employmentType,
        workingDaysPerWeek,
        paidBreak,
        breakDuration,
        hourlyRate,
        flatRate,
        weekdayRate,
        weekendRate,
        workingPeriodDays,
        dateOfCommencement,
        jobDescription1,
        jobDescription2,
        jobDescription3,
        jobDescription4,
        jobDescription5,
        jobRequirement1,
        jobRequirement2,
        jobRequirement3,
        additionalInfo
    } = req.body;

    try {
        await pool.query(
            `INSERT INTO jobPostings 
            (userId, jobTitle, workingLocation, workingHours, employmentType, workingDaysPerWeek, paidBreak, breakDuration, hourlyRate, flatRate, weekdayRate, weekendRate, workingPeriodDays, dateOfCommencement, jobDescription1, jobDescription2, jobDescription3, jobDescription4, jobDescription5, jobRequirement1, jobRequirement2, jobRequirement3, additionalInfo) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, jobTitle, workingLocation, workingHours, employmentType, workingDaysPerWeek, paidBreak, breakDuration, hourlyRate, flatRate, weekdayRate, weekendRate, workingPeriodDays, dateOfCommencement, jobDescription1, jobDescription2, jobDescription3, jobDescription4, jobDescription5, jobRequirement1, jobRequirement2, jobRequirement3, additionalInfo]
        );
        res.redirect('/employerDash');
    } catch (error) {
        console.error('Error posting job:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;