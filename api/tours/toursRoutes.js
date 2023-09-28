const express = require('express');
const router = express.Router();
const upload = require('../../multer-config'); 
const Channel = require('../../models/Channels');
const User = require('../../models/Users');
const Agency = require('../../models/Agency');
const Guide = require('../../models/Guide');
const Tour = require('../../models/Tours');



router.post('/new_tour', upload.single('image'), async (req, res) => {
    try {
        // console.log(req)
        const { title, description,guide,agency,startingDate, endingDate } = req.body;
        const image = req.file.filename;

        const authToken = req.headers.authorization?.split(' ')[1];


        const tour = new Tour({
            title,
            description,
            photo: image, // Assuming req.file.filename contains the image URL
            guide: guide, // Use the provided guide _id
            agency: agency, // Use the provided
            starting_date: startingDate,
            ending_date: endingDate
        });

        // Save the tour document to the database
        await tour.save();

        const agencyTour = await Agency.findOne({_id: agency});

        console.log(agencyTour);
        // Update the user's profile to include this new tour (assuming you have a user-tour relationship)
        agencyTour.tours.push(tour);
        await agencyTour.save();

        res.status(201).json({ message: 'Tour created successfully', tour });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while creating the tour' });
    }
});

router.get('/agency_tours' , async function(req, res) {

    const authToken = req.headers.authorization?.split(' ')[1];
    if (!authToken) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const user = await User.findOne({ authToken: authToken }).exec();
        const agency = await Agency.findOne({owner: user._id});
        const tour = await Tour.find({agency: agency});
        const guides = await Guide.find({ agency: agency._id }).exec();
        const userIDs = guides.map(guide => guide.user);
        const users = await User.find({ _id: { $in: userIDs } }).exec();

        const tourWithGuides = {
            title: tour.title,
            description: tour.description,
            image: tour.image,
          };


        res.status(200).json({ message: 'Agency Tours' , tour: tour , agency : agency, guide: users });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching the tour' });
    }
});


module.exports = router;