import type { GraphQLContext } from './context.js'

import type { GraphQLResolveInfo } from 'graphql'
import { getUserById, getSkillsByUserId, listAllSkills } from '../services/skills.js'
import { loginUser, registerUser, forgotPassword, verifyResetViaSecurityQuestion } from '../services/auth.js'


export const resolvers = {
  Query: {
    me: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      if (!ctx.user) return null
      return getUserById(ctx.user.id)
    },
    availableSkills: async () => {
      return listAllSkills()
    },
  },
  User: {
    skills: async (parent: { id: string }) => {
      return getSkillsByUserId(parent.id)
    },
  },
  Mutation: {
    register: async (
      _: unknown,
      args: {
        username: string
        email: string
        password: string
        securityQuestionId: string
        securityAnswer: string
        skillIds: string[]
      },
    ) => {
      return registerUser(args)
    },
    login: async (
      _: unknown,
      args: { emailOrUsername: string; password: string },
      __: unknown,
      ___: GraphQLResolveInfo,
    ) => {
      return loginUser(args)
    },
    forgotPassword: async (
      _: unknown,
      args: { email: string },
    ) => {
      return forgotPassword(args.email)
    },
    verifySecurityQuestionAndResetPassword: async (
      _: unknown,
      args: {
        email: string
        securityAnswer: string
        newPassword: string
        securityQuestionId: string
      },
    ) => {
      return verifyResetViaSecurityQuestion(args)
    },
  },
}

