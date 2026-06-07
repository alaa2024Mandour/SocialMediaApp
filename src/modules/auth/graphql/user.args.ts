import { GraphQLID, GraphQLInt, GraphQLNonNull, GraphQLString } from 'graphql';
import { gender_enum_type } from './user.types';
export const getUserARG = {
    _id: { type: new GraphQLNonNull(GraphQLID) }
}

export const createUserARG = {
        userName: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
        cPassword: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: new GraphQLNonNull(GraphQLInt) },
        phone: { type: new GraphQLNonNull(GraphQLString) },
        gender: { type: new GraphQLNonNull(gender_enum_type) },
}

export const updateUserARG = {
        firstName: { type: GraphQLString  },
        lastName: { type: GraphQLString  },
        email: { type: GraphQLString },
        age: { type: GraphQLInt },
        phone: { type: GraphQLString },
        gender: { type: gender_enum_type },
}