import {
    Command,
    APIInteractionResponse,
    InteractionResponseType,
} from "cf-workers-discord";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

export const UnSubCommand: Command = {
    command: {
        name: "unsubscribe",
        description: "Unsubscribe to daily tech updates!",
        default_member_permissions: "8",
    },
    handler: async (ctx): Promise<APIInteractionResponse> => {
        const prisma = new PrismaClient({
            datasourceUrl: ctx.env.DATABASE_URL,
        }).$extends(withAccelerate());

        let userId = ctx.interaction.member?.user.id as any;

        const data = await prisma.user.findUnique({
            where: {
                userId: userId,
            },
        });

        if (!data) {
            return {
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    content: `You are not subscribed!`,
                },
            };
        }
        await prisma.user.delete({
            where: {
                userId: userId,
            },
        });
        return {
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
                content: `Now you are unsubscribed to daily tech updates!`,
            },
        };
    },
};

export default UnSubCommand;
