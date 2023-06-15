const {Book, User} = require('../models');
const {signToken} = require('../utils/auth');
const {AuthenticationError} = require('apollo-server-express');

const resolvers = {
    Query: {
        me: async(parent, args, context) => {
            if(context.user){
              const user = await User.findById({_id: context.user._id});
              return user;
            } 
                throw new AuthenticationError('User is not logged in')
        }
    },
    Mutation: {
        login: async(parent, {email, password}) => {
            const user = await User.findOne({email});
            if(!user){
                throw new AuthenticationError('No user found with this email address')
            }
            const correctPw = await user.isCorrectPassword(password);
            if(!correctPw){
                throw new AuthenticationError('Not the correct password')
            }
            const token = signToken(user);
            return {token, user};

        },
        addUser: async(parent, {username, email, password}) => {
            const user = await User.create({username, email, password});
            const token = signToken(user);
            return {token, user};
        },
        saveBook: async(parent, args, context) => {
           if(context.user){
            const user = await User.findOneAndUpdate({_id: context.user._id},
                {$push: {savedBooks: args.bookData}}, {new: true});
             return user;
           }
           throw new AuthenticationError('You need to be logged in to create a book');
        },
        removeBook: async(parent, {bookId}, context) => {
            if(context.user){
               const removedBook =  await User.findOneAndUpdate({
                    _id: context.user._id
                }, 
                {$pull: {savedBooks: {bookId}}}, {new: true});
                return removedBook;
            }
            throw new AuthenticationError('User is not logged in')
        }
    }
};

module.exports = resolvers;

