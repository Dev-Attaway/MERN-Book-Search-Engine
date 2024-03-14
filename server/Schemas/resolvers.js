const { User } = require("../models");
const { signToken, AuthenticationError } = require("../utils/auth");

const resolvers = {
  Query: {
    // By adding context to our query, we can retrieve the logged in user without specifically searching for them
    me: async (parent, args, context) => {
      if (context.user) {
        return await User.findOne({ _id: context.user._id });
      }
      throw AuthenticationError;
    },
  },

  Mutation: {
    createUser: async (parent, { username, email, password }) => {
      const newUser = await User.create({ username, email, password });
      const token = signToken(newUser);

      return { token, newUser };
    },
    login: async (parent, { email, password }) => {
      const potentialUser = await User.findOne({ email });

      if (!potentialUser) {
        throw AuthenticationError;
      }

      const correctPw = await potentialUser.isCorrectPassword(password);

      if (!correctPw) {
        throw AuthenticationError;
      }

      const token = signToken(potentialUser);
      return { token, potentialUser };
    },

    // Add a third argument to the resolver to access data in our `context`
    saveBook: async (parent, { input }, { user }) => {
      try {
        const updatedUser = await User.findOneAndUpdate(
          { _id: user._id },
          { $addToSet: { savedBooks: input } },
          { new: true, runValidators: true }
        );
        return updatedUser;
      } catch (err) {
        throw new Error(err.message);
      }
    },
    // Set up mutation so a logged in user can only remove their profile and no one else's
    deleteBook: async (parent, { bookId }, { user }) => {
      try {
        const updatedUser = await User.findOneAndUpdate(
          { _id: user._id },
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        );
        if (!updatedUser) {
          throw new Error("Couldn't find user with this id!");
        }
        return updatedUser;
      } catch (err) {
        throw new Error(err.message);
      }
    },
  },
};

module.exports = resolvers;
