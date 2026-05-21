import { gql } from 'graphql-tag'

export const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    email: String!
    skills: [Skill!]!
  }

  type Skill {
    id: ID!
    name: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    me: User
    availableSkills: [Skill!]!
  }

  type Mutation {
    register(
      username: String!
      email: String!
      password: String!
      securityQuestionId: ID!
      securityAnswer: String!
      skillIds: [ID!]!
    ): AuthPayload!

    login(emailOrUsername: String!, password: String!): AuthPayload!

    forgotPassword(email: String!): Boolean!

    verifySecurityQuestionAndResetPassword(
      email: String!
      securityAnswer: String!
      newPassword: String!
      securityQuestionId: ID!
    ): Boolean!
  }
`

