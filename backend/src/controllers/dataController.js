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
        const jobs = [];
        const snapshot = await db.collection("JobPostings").get();
        console.log("Snapshot size:", snapshot.size); // Log snapshot size

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
        return jobs
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
