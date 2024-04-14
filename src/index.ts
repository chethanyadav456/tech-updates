import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { createApplicationCommandHandler, Permissions } from 'cf-workers-discord'
import command from "./commands/index";

export interface Env {
    DATABASE_URL: string;
    TELEGRAM_BOT_TOKEN: string;
    DISCORD_BOT_TOKEN: string;
    PUBLIC_KEY: string;
    APPLICATION_ID: string;
    TECHCRUNCH_API_URL: string;
    DISCORD_WEBHOOK_URL: string;
}

type tc_article = {
    id: any;
    link: any;
    title: {
        rendered: any;
    };
}

async function fetchData(url: string): Promise<tc_article[]> {
    const response = await fetch(url);
    const data = await response.json() as tc_article[];
    return data;
}

let applicationCommandHandler: (request: Request) => any;

// Main function to fetch and update data
async function fetchAndUpdateData(env: Env) {
    try {
        const prisma = new PrismaClient({
            datasourceUrl: env.DATABASE_URL
        }).$extends(withAccelerate());

        await prisma.$connect();
        const data = await fetchData(env.TECHCRUNCH_API_URL);
        const sentArticleIds = await prisma.tc_article.findMany();
        const users = await prisma.user.findMany();

        if (!data) {
            return new Response("No data found", { status: 404 });
        }

        await Promise.all(data.map(async (article) => {
            const isArticleSent = sentArticleIds.find((a) => a.atitleId === article.id);
            if (!isArticleSent) {
                await prisma.tc_article.create({
                    data: {
                        atitleId: article.id
                    }
                });
                const myEmbed = {
                    title: article.title.rendered,
                    url: article.link,
                    footer: `ID - ${article.id}`,
                };

                const message = `📰 | ${readable(myEmbed.title)}\n${myEmbed.url}`;

                await sendToTelegram(
                    message,
                    env.TELEGRAM_BOT_TOKEN,
                    "@dailytechneuz",
                    "HTML"
                );
                // await sendToTelegram(`📰 | ${myEmbed.title} ${myEmbed.url}`, env.TELEGRAM_BOT_TOKEN, "@dailytechneuz");

                await Promise.all(users.map(async (user) => {
                    if (!user.channelId) {
                        return new Response("No channel or chat id found", { status: 400 });
                    }
                    await sendToDiscord({
                        content: `📰 | ${myEmbed.title}\n${myEmbed.url}`,
                    }, user.channelId, env.DISCORD_BOT_TOKEN);
                }));
            } else {
                return new Response("Article already sent", { status: 400 });
            }
        }));
        await prisma.$disconnect(); // Disconnect from the database
        await fetch(env.DISCORD_WEBHOOK_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                content: `Data updated at <t:${Math.floor(Date.now() / 1000)}:R>`,
            }),
        });
        return new Response("Data updated", { status: 200 });
    } catch (error) {
        console.error("Error fetching and updating data:", error);
        return new Response("Error fetching and updating data", { status: 500 });
    }
}
function readable(title: string): string {
    return title
        .replace(/&#8217;/g, "'")
        .replace(/!/g, "")
        .replace(/@/g, "")
        .replace(/#/g, "")
        .replace(/\$/g, "")
        .replace(/%/g, "")
        .replace(/\^/g, "")
        .replace(/&/g, "")
        .replace(/\*/g, "")
        .replace(/\(/g, "")
        .replace(/\)/g, "")
        .replace(/_/g, "")
        .replace(/\+/g, "")
        .replace(/=/g, "")
        .replace(/{/g, "")
        .replace(/\[/g, "")
        .replace(/}/g, "")
        .replace(/]/g, "")
        .replace(/\|/g, "-")
        .replace(/:/g, "")
        .replace(/;/g, "")
        .replace(/"/g, "")
        .replace(/'/g, "")
        .replace(/</g, "")
        .replace(/,/g, "")
        .replace(/>/g, "")
        .replace(/\./g, "")
        .replace(/\?/g, "")
        .replace(/\//g, "")
        .replace(/\\/g, "")
        .replace(/~/g, "")
        .replace(/`/g, "");
}



// HTTP request handler
export default {
    fetch: async (request: Request, env: Env, ctx: ExecutionContext) => {
        try {
            if (!applicationCommandHandler) {
                applicationCommandHandler = createApplicationCommandHandler({
                    applicationId: env.APPLICATION_ID,
                    botToken: env.DISCORD_BOT_TOKEN,
                    publicKey: env.PUBLIC_KEY,
                    commands: command,
                    env: env,
                    permissions: new Permissions(['SendMessages']),
                });
            }

            const { pathname } = new URL(request.url);

            if (pathname === "/") {
                return new Response("Hello, World!", {
                    headers: {
                        "Content-Type": "text/plain"
                    }
                });
            } else if (pathname === "/update") {
                // Respond immediately to update request
                const updateResponse = await fetchAndUpdateData(env);
                return updateResponse;
            } else {
                return applicationCommandHandler(request);
            }
        } catch (error) {
            console.error("Error handling request:", error);
            return new Response("Error handling request", { status: 500 });
        }
    },
    scheduled: async (event, env, ctx) => {
        await ctx.waitUntil(fetchAndUpdateData(env));
    },
}

async function sendToDiscord(article: any, channelId: string, botToken: string) {
    await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
        method: "POST",
        headers: {
            Authorization: `Bot ${botToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(article),
    });
}

async function sendToTelegram(article: any, botToken: string, channelId: string, parse_mode?: string) {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${channelId}&text=${article}&parse_mode=${parse_mode}`);
}
