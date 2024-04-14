import { Command, APIInteractionResponse, InteractionResponseType, ButtonStyle } from "cf-workers-discord";


export const HelpCommand: Command = {
    command: {
        name: "help",
        description: "List all commands",
    },

    handler: async (ctx): Promise<APIInteractionResponse> => {

        return {
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
                embeds: [
                    {
                        title: "Help",
                        description:
                            "Ena your best techie helps you with the following commands:",
                        fields: [
                            {
                                name: "</ping:1229139731636293813>",
                                value: "Ping the bot",
                            },
                            {
                                name: "</Subscribe:1229139731678236813>",
                                value: "Subscribe to daily tech updates",
                            },
                            {
                                name: "</Unsubscribe:1229139731653066792>",
                                value: "Unsubscribe from daily tech updates",
                            },
                        ],
                        color: 0x36393e,
                    },
                ],
                components: [
                    {
                        type: 1,
                        components: [
                            {
                                type: 2,
                                style: ButtonStyle.Link,
                                label: "Invite Me",
                                url: "https://discord.com/oauth2/authorize?client_id=956662165698383972&permissions=533113338961&scope=bot+applications.commands",
                            },
                            {
                                type: 2,
                                style: ButtonStyle.Link,
                                label: "Support Server",
                                url: "https://discord.gg/StFRrKrCcZ",
                            },
                            {
                                type: 2,
                                style: ButtonStyle.Link,
                                label: "GitHub",
                                url: "https://github.com/chethanyadav456/tech-updates",
                            },
                        ],
                    },
                ],
            },
        };
    },
}