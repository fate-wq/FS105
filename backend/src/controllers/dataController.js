const { admindb } = require("../config/firebaseAdmin");
const { ref, get, set, update } = require("firebase/database");
const{db} = require('../config/firebase');

const setData = async (req, res) => {
    try {
        console.log(req.body);
        const { userId, ...jobDetails } = req.body;

        // Check if required fields are present
        if (!jobDetails.jobTitle || !jobDetails.workingLocation || !jobDetails.employmentType) {
            throw new Error("Job title, working location, and employment type are required.");
        }

        // Store data in the "JobPostings" collection
        const docRef = await admindb.collection("JobPostings").add(jobDetails);

        // Retrieve user record from database
        const userRef = ref(db, `users/${userId}`);
        const snapshot = await get(userRef);
        const userData = snapshot.val();

        // Check if the user record exists
        if (!userData) {
            throw new Error("User not found");
        }

        // Increment the job count
        const newJobCount = (userData.jobCount || 0) + 1;

        // Update user data with the new job count
        await update(userRef, {
            jobCount: newJobCount,
            jobPostings: (userData.jobPostings || []).concat({
                id: docRef.id,
                jobTitle: jobDetails.jobTitle
            })
        });

        res.status(200).json({ message: "Data Stored Successfully", id: docRef.id });
    } catch (error) {
        console.error("Error Storing Data", error);
        res.status(500).json({ error: "Error storing data" });
    }
};

const getJobs = async (queryParams) => {
    try {
        const { location, jobType, search  } = queryParams || {}; // Destructure queryParams or provide empty object
        const jobs = [];

        let query = admindb.collection("JobPostings");

        // Apply filters if location and/or jobType are provided
        if (location) {
            query = query.where("workingLocation", "==", location);
        }
        if (jobType) {
            query = query.where("employmentType", "==", jobType);
        }

        const snapshot = await query.get();

        if (snapshot.empty) {
            console.log('No matching documents.');
        }

        snapshot.forEach(doc => {
            const data = doc.data();
            // Filter by search term if provided
            if (search) {
                if (data.jobTitle.toLowerCase().includes(search.toLowerCase())) {
                    const { jobTitle, workingLocation, employmentType, ...jobDetails } = data;
                    jobs.push({
                        jobTitle,
                        workingLocation,
                        employmentType,
                        ...jobDetails
                    });
                }
            } else {
                const { jobTitle, workingLocation, employmentType, ...jobDetails } = data;
                jobs.push({
                    jobTitle,
                    workingLocation,
                    employmentType,
                    ...jobDetails
                });
            }
        });
        return jobs;
    } catch (error) {
        console.error("Error fetching jobs", error);
        throw error; // Propagate the error back to the caller
    }
};

const updateUserData = async (req, res) => {
    try {
        const userId = req.body.userId; 
        const userRef = ref(db, `users/${userId}`);

        // Retrieve existing user data
        const userSnapshot = await get(userRef);
        if (!userSnapshot.exists()) {
            return res.status(404).json({ error: "User not found" });
        }

        const existingUserData = userSnapshot.val();
        const updatedUserData = {
            ...existingUserData,
            ...req.body // Update with new data
        };

        // Update the user data in Realtime Database
        await update(userRef, updatedUserData);

        res.status(200).json({ message: "Profile updated successfully" });
    } catch (error) {
        console.error("Error updating user data", error);
        res.status(500).json({ error: "Error updating user data" });
    }
};

const populateUserData = async(req,res) => {
    try{
        const userId = req.body.userId; 
        const userRef = ref(db, `users/${userId}`);
        // Retrieve existing user data
        const userSnapshot = await get(userRef);
        if (!userSnapshot.exists()) {
            return res.status(404).json({ error: "User not found" });
        }
        const users = userSnapshot.val();
        res.json({users});
    }catch{
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Error fetching users' });
    }
};

const getUserData = async (req, res) => {
    try {
        const userId = req.session.userId; // Ensure you have userId in session
        const userRef = ref(db, `users/${userId}`);
        const userSnapshot = await get(userRef);

        if (!userSnapshot.exists()) {
            return res.status(404).json({ error: "User not found" });
        }

        const userData = userSnapshot.val();
        res.json(userData);
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ error: 'Error fetching user data' });
    }
};



module.exports = {
    setData,
    getJobs,
    updateUserData,
    populateUserData,
    getUserData
};
