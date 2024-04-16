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

        let guildId = ctx.interaction.guild_id as any;

        const data = await prisma.subs.findUnique({
            where: {
                guildId,
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
        await prisma.subs.delete({
            where: {
                guildId,
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
