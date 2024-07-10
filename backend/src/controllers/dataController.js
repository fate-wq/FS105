const { db } = require("../config/firebaseAdmin");

const setData = async (req, res) => {
    try {
        console.log(req.body);
        const docRef = await db.collection("JobPostings").add(req.body);
        res.status(200).json({ message: "Data Stored Successfully", id: docRef.id });
    } catch (error) {
        console.error("Error Storing Data", error);
        res.status(500).json({ error: "Error storing data:" });
    }
};

module.exports = {
    setData
};
