import fetch from "node-fetch";
import { config } from "dotenv";
import * as fs from "fs";
config({
    path: ".env",
});
import { Telegram } from "telegraf";
import { logger } from "../logger";
import { log } from "console";

let sentArticleIds = new Set();

const DCbotToken = process.env.DISCORD_BOT_TOKEN;
const TelegramBotToken = process.env.BOT_TOKEN;
class Worker {
    url: string;
    constructor() {
        this.url = "https://techcrunch.com/wp-json/wp/v2/posts";
    }

    /**
     * Fetches data from a specified URL using a GET request with JSON content type.
     *
     * @return {Promise} The data fetched from the URL.
     */
    async fetchData(): Promise<any> {
        try {

            const response = await fetch(this.url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = (await response.json()) as Array<{
                id: any;
                link: any;
                title: { rendered: any };
            }>;
            data.forEach((article) => {
                const myDataArry = {
                    id: article.id,
                    link: article.link,
                    title: article.title.rendered,
                };
                if (fs.existsSync("sent_articles.json")) {
                    const data = fs.readFileSync("sent_articles.json").toString(); // Convert Buffer to string
                    sentArticleIds = new Set(JSON.parse(data));
                }

                if (!this.hasArticleBeenSent(myDataArry.id)) {
                    const myEmbed = {
                        title: myDataArry.title,
                        url: myDataArry.link,
                        footer: `ID - ${myDataArry.id}`,
                    };
                    this.sendToDiscord(
                        {
                            content: `📰 | ${myEmbed.title}\n${myEmbed.url}`,
                        },
                        "1228266643633737768"
                    );
                    this.sendToTelegram(
                        `📰 | ${myEmbed.title}\n${myEmbed.url}`
                    );
                    logger.info(`Article ${myDataArry.id} has been sent.`);

                    this.sendArticle(myDataArry.id);
                } else {
                    console.log(`Article ${myDataArry.id} has already been sent.`);
                }
            });
            // logger.info(`${articlesSet.size} | ${articlesSet.values()} `);
            log(sentArticleIds.values());
            return data;
        } catch (error: any) {
            // error("Error fetching data:", error);
            log(error.message);
            throw error;
        }
    }

    async sendToDiscord(article: any, channelId: string) {
        fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
            method: "POST",
            headers: {
                Authorization: `Bot ${DCbotToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(article),
        }).then((response) => log(response.json()));
    }

    async sendToTelegram(article: any) {
        if (TelegramBotToken) {
            const tg = new Telegram(TelegramBotToken);
            tg.sendMessage("@dailytechneuz", article);
        } else {
            logger.error("TelegramBotToken is undefined.");
        }
    }
    // Function to check if an article ID has already been sent
    hasArticleBeenSent(articleId: any) {
        return sentArticleIds.has(articleId);
    }

    // Function to send an article and mark its ID as sent
    sendArticle(articleId: any) {
        // Code to send the article goes here
        // Once sent, add the article ID to the set
        sentArticleIds.add(articleId);
        // Save the updated set to JSON file
        this.saveSentArticleIds();
    }

    // Function to save the set of sent article IDs to JSON file
    saveSentArticleIds() {
        fs.writeFileSync('sent_articles.json', JSON.stringify(Array.from(sentArticleIds)));
    }

}
export default Worker;
