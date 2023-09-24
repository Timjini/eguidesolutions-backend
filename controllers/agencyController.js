const Agency = require('../models/agency'); // Import your Agency model

// Controller function for creating an agency
async function createAgency(req, res) {
    try {
        const { name } = req.body; // You may have other fields in your agency creation request

        // Create a new agency document
        const agency = new Agency({
            name,
            owner: req.user._id, // Assuming you have user authentication and the user ID is available in req.user
            members: [req.user._id], // Add the owner as a member
            // Add other agency-specific fields here
        });

        // Save the agency to the database
        await agency.save();

        res.status(201).json({ message: 'Agency created successfully', agency });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {
    createAgency,
};
