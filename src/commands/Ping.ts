import { Command, APIInteractionResponse, InteractionResponseType } from 'cf-workers-discord';


export const PingCommand: Command = {
    command: {
        name: "ping",
        description: "A simple ping command",
    },
    handler: async (ctx): Promise<APIInteractionResponse> => {

        return {
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
                content: `Pong! Latency: ${Date.now() -
                    Math.round(Number(ctx.interaction.id) / 4194304 + 1420070400000)
                    }ms (rounded to nearest integer)`,
            },
        };
    },
};

export default PingCommand;