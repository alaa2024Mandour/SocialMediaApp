import  UserFields  from '../auth/graphql/user.fields';
import {
    GraphQLObjectType,
    GraphQLSchema,
} from "graphql"



export const gql_schema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: "query",
        fields: {
            ...UserFields.query()
        }
    }),
    mutation: new GraphQLObjectType({
        name: "Mutation",
        description: "create",
        fields: {
            ...UserFields.mutation()
        }
    })
})

