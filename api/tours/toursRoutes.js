const express = require('express');
const router = express.Router();
// const upload = require('../../multer-config'); 
const Channel = require('../../models/Channels');
const User = require('../../models/Users');
const Agency = require('../../models/Agency');
const Guide = require('../../models/Guide');
const Tour = require('../../models/Tours');
const { upload, uploadToS3 } = require('../../fileUploader');



router.post('/new_tour',async (req, res) => {
    try {
        // console.log(req)
        const { title, description,guide,agency,startingDate, endingDate } = req.body;
        const file = req.file;
        const agencyId = req.body.agency
        const image = await uploadToS3(file);

        const authToken = req.headers.authorization?.split(' ')[1];


        const tour = new Tour({
            title,
            description,
            photo: image.file_name, 
            guide: guide, 
            agency: agency, 
            starting_date: startingDate,
            ending_date: endingDate
        });

        // Save the tour document to the database
        await tour.save();

        const agencyTour = await Agency.findOne({_id: agencyId});
        console.log(agencyTour);

        if (!agencyTour) {
            return res.status(404).json({ error: 'Agency not found' });
        }

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
        const tours = await Tour.find({agency: agency});
        const guides = await Guide.find({ agency: agency }).exec();
        const userIDs = guides.map(guide => guide.user);
        const users = await User.find({ _id: { $in: userIDs } }).exec();

        const toursWithGuides = tours.map((tour) => {
            return {
              title: tour.title,
              description: tour.description,
              image: `uploads/${tour.photo}`, 
              _id: tour._id,
            };
          });


        res.status(200).json({ message: 'Agency Tours' , tour: toursWithGuides , agency : agency, guide: users });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching the tour' });
    }
});


module.exports = router;    