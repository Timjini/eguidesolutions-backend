
const Agency = require("../../models/Agency");
const Guide = require("../../models/Guide");
const UserProfile = require("../../models/UserProfile");
const User = require("../../models/Users");

class GuideSerializer {
  static async serialize(guide) {
        if (!guide) {
        return null;
        }
        const user = await User.findOne({_id: guide?.user});
        console.log("user id ", user._id)
        const userProfile = await UserProfile.findOne({user: user._id})
        console.log("user", userProfile);
        const agency = await Agency.findOne({_id: guide?.agency});
        console.log("agency," , agency);
        return {
            _id: guide?._id,
            name: user?.name,
            email: user?.email,
            phone: user?.phone,
            avatar:user?.avatar,
            rating: 3,
            comments:[
              "great tour with the guide", "had a lot of fun in this tour."
            ],
            agency_name: agency?.name,
            agency_image: agency?.image
        }
    }
}


module.exports = GuideSerializer;