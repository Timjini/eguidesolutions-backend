class UserSerializer {
    static serialize(user) {
      return {
        _id: user._id,
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        phone: user.phone,
        status: user.status,
        type: user.type,
        username: user.username,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    }
  }
  
  module.exports = UserSerializer;
  