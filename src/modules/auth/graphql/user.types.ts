import { GraphQLEnumType, GraphQLID, GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLString } from "graphql"

    export const gender_enum_type = new GraphQLEnumType({
        name: "gender",
        values: {
            male: { value: "male" },
            female: { value: "female" },
        }
    })

    export const userType = new GraphQLObjectType({
        name: "listUsers",
        fields: {
            _id: { type: GraphQLID },
            firstName: { type: GraphQLString },
            lastName: { type: GraphQLString },
            gender: { type: gender_enum_type },
            email: { type: GraphQLString },
        }
    })

    export const allUsersType = new GraphQLList(userType)