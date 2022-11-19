const Discord = require("discord.js");
const ayarlar = require("../ayarlar.json")
const db = require("nrc.db")
const {MessageActionRow, MessageButton} = require("discord.js")
module.exports = {
    calistir: async(client, message, args) => {

    if(message.author.id !== message.guild.ownerId) return message.reply(`Bu komudu kullanmak için yetkin yok`)
		const menu = new Discord.MessageEmbed()
		.setColor("#ff3d00")
		.setTitle("Botlist Sistemi<:be:972162836878987344><:ta:972163178962255882>")
		.setDescription(`
		Merhabalar **${message.author.username}**,Botlist Botu Sahip Olduğu Özellikler Sayesinde Botlarınızı  Daha Kolay Eklemek İçin Tasarlanmış Bir Bottur!.`)


.addField('\u200b', `[<a:EmojiGif157:985813637094588427> WebSite](https://botlogo.glitch.me/)`,true)
.addField('\u200b', `[<:1666iconthereeroles:996055393140756490> Discord](https://discord.gg/aUdVEF6TDj)`,true)

   .setFooter(`© Tüm Hakları Saklıdır`)
		const row = new MessageActionRow()
		.addComponents(
		new MessageButton()
		.setCustomId('bot-başvuru')
		.setLabel('Bot Ekletmek İçin Tıkla')
		.setEmoji("<:2762roleiconbot:996055396752035860>")
		.setStyle('SECONDARY'),
		
		);
		message.channel.send({
			embeds: [menu], components: [row]
		});


},

name: "botlist",
description: "",
aliases: [],
kategori: "",
usage: "",
}