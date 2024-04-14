import { Command, APIInteractionResponse, InteractionResponseType, ChannelType, APIGuildChannelResolvable, APIUserInteractionDataResolved, APIUser, APIGuildChannel, TextChannelType } from 'cf-workers-discord';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate'

export const SubCommand: Command = {
    command: {
        name: "subscribe",
        description: "Subscribe to daily tech updates!",
        options: [
            {
                name: "channel",
                description: "Select a channel to receive updates",
                type: 7,
                required: true,
                channel_types: [ChannelType.GuildText, ChannelType.GuildAnnouncement]
            }
        ]
    },
    handler: async (ctx): Promise<APIInteractionResponse> => {
        
        const channel = (ctx.interaction.data as any).options[0].value;
        const prisma = new PrismaClient({
            //datasourceUrl: env.DATABASE_URL
            datasourceUrl: "prisma://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfa2V5IjoiYmVhZDYzMDQtZTQ0OC00Mzk3LTlhMTYtYzVkNDlmNzZiNDA4IiwidGVuYW50X2lkIjoiOTZiZjkwY2JhZGRiZGI0MjYzYWNhNDgyNzA1ZDI0ZDY2Njg3NTUyZWIzMTY4OTRmYzU5ZmFmMWZkYzNhYzc5OSIsImludGVybmFsX3NlY3JldCI6Ijg5YjRlNTNhLWM0NjQtNDViZC1hNTQ4LWMwMjU0NWU2YmUyNiJ9.qlBUS6EZp15jejv0CLjeGSC5kzkP3qZLBWLRcVYcyUQ",
        }).$extends(withAccelerate());

        if (!channel) {
            return {
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    content: `Please select a valid channel!`,
                },
            };
        }

        let userId = ctx.interaction.member?.user.id as any
        
        const data = await prisma.user.findUnique({
            where: {
                userId: userId,
            }
        });
        
        if (data) {
            return {
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    content: `You are already subscribed!`,
                },
            };
        }
        await prisma.user.create({
            data: {
                userId: userId,
                channelId: channel
            }
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