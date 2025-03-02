class UserProfileSerializer {
    static serialize(userProfile) {
      return {
        _id: userProfile._id,
        id: userProfile.id,
        country: userProfile.country ?? null,
        city: userProfile.city ?? null,
        address: userProfile.address ?? null,
        coordinates: userProfile.coordinates ?? { lat: null, lng: null },
        dob: userProfile.dob ?? null,
        department: userProfile.department ?? null,
        selectedLanguage: userProfile.selectedLanguage ?? null,
        timeZone: userProfile.timeZone ?? null,
        createdAt: userProfile.createdAt,
        updatedAt: userProfile.updatedAt,
      };
    }
  }
  
  module.exports = UserProfileSerializer;
  
  