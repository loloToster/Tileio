import { Adapter, AdapterAccount } from "next-auth/adapters"
import { PrismaClient } from "@prisma/client"

class Database extends PrismaClient {
  nextAuthAdapter(): Adapter {
    return {
      createUser: data => this.user.create({ data }),
      getUser: id => this.user.findUnique({ where: { id } }),
      getUserByEmail: email => this.user.findUnique({ where: { email } }),
      getUserByAccount: async ({ provider, providerAccountId }) => {
        const account = await this.account.findUnique({
          where: {
            providerId_providerAccountId: {
              providerId: provider,
              providerAccountId
            }
          },
          select: { user: true }
        })

        return account?.user ?? null
      },
      updateUser: ({ id, ...data }) =>
        this.user.update({ where: { id }, data }),
      deleteUser: id => this.user.delete({ where: { id } }),
      linkAccount: data =>
        this.account.create({
          data: {
            providerType: data.type,
            providerId: data.provider,
            providerAccountId: data.providerAccountId,
            user: { connect: { id: data.userId } }
          }
        }) as unknown as AdapterAccount,
      unlinkAccount: ({ provider, providerAccountId }) =>
        this.account.delete({
          where: {
            providerId_providerAccountId: {
              providerId: provider,
              providerAccountId
            }
          }
        }) as unknown as AdapterAccount,
      getSessionAndUser: async sessionToken => {
        const userAndSession = await this.session.findUnique({
          where: { sessionToken },
          include: { user: true }
        })
        if (!userAndSession) return null
        const { user, ...session } = userAndSession
        return { user, session }
      },
      createSession: ({ sessionToken, userId, expires }) =>
        this.session.create({
          data: { sessionToken, expires, user: { connect: { id: userId } } }
        }),
      updateSession: data =>
        this.session.update({
          where: { sessionToken: data.sessionToken },
          data
        }),
      deleteSession: sessionToken =>
        this.session.delete({ where: { sessionToken } })
    }
  }
}

const db = new Database()

export default db
