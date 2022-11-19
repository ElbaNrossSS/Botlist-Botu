const Discord = require("discord.js");
const db = require("orio.db")
module.exports = {
calistir: async (client, message, args) => {
  let prefix = "!"
 if (!message.member.roles.cache.has('986723584011534376'))
  return message.channel.send(`Bu komutu kullanabilmek için "\`Sunucuyu Yönet\`" yetkisine sahip olmalısın.`);

  if (!args[0])
    return message.channel.send(
      `${prefix}bototorol \`aç\` veya ${prefix}bototorol \`kapat\` `);
  let rol = message.mentions.roles.first();
  if (args[0] == "aç") {
    if (!rol)
      return message.channel.send(
        `Bot otorol olarak ayarlamak istediğin rolü etiketlemelisin. \`${prefix}bototorol aç @Bot\``
      );

    db.set(`bototorol_${message.guild.id}`, rol.id);
    message.channel.send(
      `Bot otorol \`${rol.name}\` olarak ayarlandı. Kapatmak için \`${prefix}bototorol kapat\` yazmalısın.`
    );
  }

  if (args[0] == "kapat") {
    db.delete(`bototorol_${message.guild.id}`);
    message.channel.send("Sistem sıfırlandı");
  }
},
name: "bototo-rol",
description: "",
aliases: [],
kategori: "",
usage: "",
}
