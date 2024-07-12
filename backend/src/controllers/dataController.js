const { db } = require("../config/firebaseAdmin");

const setData = async (req, res) => {
    try {
        console.log(req.body);
        const jobDetails = req.body;

        // Check if required fields are present
        if (!jobDetails.jobTitle || !jobDetails.workingLocation || !jobDetails.employmentType) {
            throw new Error("Job title, working location, and employment type are required.");
        }

        // Store data in the "JobPostings" collection
        const docRef = await db.collection("JobPostings").add(jobDetails);

        res.status(200).json({ message: "Data Stored Successfully", id: docRef.id });
    } catch (error) {
        console.error("Error Storing Data", error);
        res.status(500).json({ error: "Error storing data" });
    }
};

const getJobs = async (req, res) => {
    try {
        const { location, jobType } = req.query;
        const jobs = [];

        let query = db.collection("JobPostings");

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
            // Extract relevant details for display or processing
            const { jobTitle, workingLocation, employmentType, ...jobDetails } = data;
            jobs.push({
                jobTitle,
                workingLocation,
                employmentType,
                ...jobDetails
            });
        });

        res.status(200).json(jobs);
    } catch (error) {
        console.error("Error fetching jobs", error);
        res.status(500).json({ error: "Error fetching jobs" });
    }
};


module.exports = {
    setData,
    getJobs
};
