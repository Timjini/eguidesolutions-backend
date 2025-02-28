const express = require('express');
const router = express.Router();
// const upload = require('../../multer-config'); 
const Channel = require('../../models/Channels');
const User = require('../../models/Users');
const Agency = require('../../models/Agency');
const Guide = require('../../models/Guide');
const Tour = require('../../models/Tours');
const { upload, uploadToS3 } = require('../../fileUploader');


router.post('/new_tour', async (req, res) => {
  try {
    const { title, description, guide, agency, price } = req.body;
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
      price: price,
    });

    await tour.save();

    const agencyTour = await Agency.findOne({ _id: agencyId });

    if (!agencyTour) {
      return res.status(404).json({ error: 'Agency not found' });
    }

    agencyTour.tours.push(tour);
    await agencyTour.save();

    res.status(201).json({ message: 'Tour created successfully', tour });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while creating the tour' });
  }
});

router.get('/agency_tours', async function (req, res) {
  const { agencyId } = req.query;
  const authToken = req.headers.authorization?.split(' ')[1];

  if (!authToken) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const user = await User.findOne({ authToken: authToken }).exec();

    if (user.type === 'admin' && agencyId === null || agencyId === undefined) {
      const allTours = await Tour.find();
      res.status(200).json({ message: 'All Tours', tours: allTours });
    } else {
      const agency = await Agency.findOne({
        $or: [
          { members: { _id: user._id } }, 
          { ownedAgency: user?.ownedAgency },
          { userAgency: user?.userAgency }
        ]
      }) || null;

      if (!agency) {
        return res.status(404).json({ message: 'Agency not found for the user' });
      }

      const tours = await Tour.find({ agency: agencyId || agency._id });
      const guides = await Guide.find({ agency: agency }).exec();
      const userIDs = guides.map(guide => guide.user);
      const users = await User.find({ _id: { $in: userIDs } }).exec();

      const serializedTours = await Promise.all(allTours.map(async (tour) => {
        return await TourSerializer.serialize(tour);
      }));


      res.status(200).json({ message: 'Agency Tours', tours: serializedTours, agency: agency, guide: users });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching the tour' });
  }
});



module.exports = router;    