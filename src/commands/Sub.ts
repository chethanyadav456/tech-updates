import { Command, APIInteractionResponse, InteractionResponseType, ChannelType, APIGuildChannelResolvable, APIUserInteractionDataResolved, APIUser, APIGuildChannel, TextChannelType, PermissionFlagsBits } from 'cf-workers-discord';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate'

export const SubCommand: Command = {
    command: {
        name: "subscribe",
        description: "Subscribe to daily tech updates!",
        default_member_permissions: "8",
        options: [
            {
                name: "channel",
                description: "Select a channel to receive updates",
                type: 7,
                required: true,
                channel_types: [ChannelType.GuildText, ChannelType.GuildAnnouncement],
            },
        ],
    },
    handler: async (ctx): Promise<APIInteractionResponse> => {
        const channel = (ctx.interaction.data as any).options[0].value;
        const prisma = new PrismaClient({
            datasourceUrl: ctx.env.DATABASE_URL,
        }).$extends(withAccelerate());

        if (!channel) {
            return {
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    content: `Please select a valid channel!`,
                },
            };
        }

        let guildId = ctx.interaction.guild_id as any;

        const data = await prisma.subs.findUnique({
            where: {
                guildId,
            },
        });

        if (data) {
            return {
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    content: `This server is already subscribed to <#${data.channelId}>!`,
                },
            };
        }
        await prisma.subs.create({
            data: {
                guildId,
                channelId: channel,
            },
        });
        return {
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
                content: `Now you are subscribed to daily tech updates in <#${channel}>!`,
            },
        };
    },
};

export default SubCommand;