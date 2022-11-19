const { Client, Intents, Collection, MessageAttachment, MessageEmbed, Permissions, Constants, ApplicationCommandPermissionsManager, MessageButton, MessageActionRow } = require('discord.js');
const Discord = require("discord.js")
const keep_alive = require('./keep_alive.js')
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_BANS, Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS, Intents.FLAGS.GUILD_INTEGRATIONS, Intents.FLAGS.GUILD_WEBHOOKS, Intents.FLAGS.GUILD_INVITES, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_MESSAGE_TYPING, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.DIRECT_MESSAGE_REACTIONS, Intents.FLAGS.DIRECT_MESSAGE_TYPING] });
const ayarlar = require("./ayarlar.json");
const { APIUser } = require('discord-api-types/v9');
const db = require("nrc.db");
const message = require("./events/message");
require('dotenv').config();
let prefix = ayarlar.prefix;
client.commands = new Collection();
client.aliases = new Collection();

["command"].forEach(handler => {
  require(`./komutcalistirici`)(client);
  require("./events/eventLoader")(client);
});

client.on('ready', () => {
  setInterval(() => {
    var uye = client.guilds.cache
      .reduce((a, b) => a + b.memberCount, 0)
      .toLocaleString()
    client.user.setActivity(`${uye} Kullanıcı.`, { type: "STREAMING", url: "https://www.twitch.tv/elbanross" });
  }, 60 * 1000)
}
);

const { Modal, TextInputComponent, showModal } = require('discord-modals')
const discordModals = require('discord-modals')
discordModals(client);



client.on('messageCreate', (message) => {
  if (message.content === 'botlist') {
    const menu = new Discord.MessageEmbed()
      .setColor("RANDOM")
      .setTitle("Botlist Sistemi")
      .setDescription(`
		Bot Ekletme Başvurusu İçin Aşağıdaki Butona Basınız.`)

    const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId('bot-başvuru')
          .setLabel('Bot Ekletmek İçin Tıkla')
          .setEmoji("🤖")
          .setStyle('SECONDARY'),

      );
    message.channel.send({
      embeds: [menu], components: [row]
    });
  }
});

const nrcmodal = new Modal()
  .setCustomId('narcos-botlist')
  .setTitle('BotList Başvuru Formu')
  .addComponents(
    new TextInputComponent()
      .setCustomId('bot-id')
      .setLabel('Bot id yazınız.')
      .setStyle('SHORT')
      .setMinLength(18)
      .setMaxLength(19)
      .setPlaceholder('Boşluk bırakmayınız')
      .setRequired(true)
  )
  .addComponents(
    new TextInputComponent()
      .setCustomId('bot-prefix')
      .setLabel('Prefix Yazınız')
      .setStyle('SHORT')
      .setMinLength(1)
      .setMaxLength(3)
      .setPlaceholder('Örnek: n!')
      .setRequired(true)
  )
  .addComponents(
    new TextInputComponent()
      .setCustomId('bot-onay')
      .setLabel('Top.gg Onaylımı?')
      .setStyle('SHORT')
      .setMinLength(1)
      .setMaxLength(5)
      .setPlaceholder('evet / hayır')
      .setRequired(true)
  )
  .addComponents(
    new TextInputComponent()
      .setCustomId('bot-hakkinda')
      .setLabel('Botunuzu Tanıtınız')
      .setMaxLength(500)
      .setStyle('LONG')
      .setMinLength(1)
      .setPlaceholder('hızlı onaylamak ve bizim anlamamız için.')
      .setRequired(true)
  )


client.on('interactionCreate', async (interaction) => {

  if (interaction.customId === "bot-başvuru") {
    showModal(nrcmodal, {
      client: client,
      interaction: interaction
    })
  }
  if (interaction.customId === "botred") {
    if (!interaction.member.roles.cache.has(ayarlar.botlistyetkilirol)) {
      return interaction.reply({ content: "Bu Komutu Kullanabilmek İçin Gerekli Yetkiye Sahip Değilsin!..", ephemeral: true });
    }
    const redform = new Modal()
      .setCustomId('narcos-botlist-red')
      .setTitle('BotList Red Sebep Formu')
      .addComponents(
        new TextInputComponent()
          .setCustomId('red-sebep')
          .setLabel('Reddetme Sebebinizi Belirtiniz.')
          .setStyle('LONG')
          .setMinLength(1)
          .setMaxLength(500)
          .setPlaceholder('Botun id si yanlışsa Reddedin.')
          .setRequired(true)
      )
    showModal(redform, {
      client: client,
      interaction: interaction
    })

  }

  if (interaction.customId === "botonay") {
    if (!interaction.member.roles.cache.has(ayarlar.botlistyetkilirol)) {
      return interaction.reply({ content: "Bu Komutu Kullanabilmek İçin Gerekli Yetkiye Sahip Değilsin!..", ephemeral: true });
    }

    let sahip = db.fetch(`onay-red-mesaj_${interaction.message.id}`)

    let botid = db.fetch(`bot_id_${sahip}`)

    const buttontanımsss = interaction.guild.members.cache.get(botid)
    buttontanımsss.roles.add(ayarlar.botrolü)

    const sahb = interaction.guild.members.cache.get(db.get(`bot_${botid}`))
    sahb.roles.add(ayarlar.developer)



    const embed = new Discord.MessageEmbed()
      .setColor("GREEN")
      .setDescription(`
		<@${botid}> Bot onaylandı.
		**Onaylayan Yetkili:** <@${interaction.user.id}>`)

    const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId('onaylandı')
          .setLabel('Bot Onaylandı')
          .setStyle('SUCCESS')
          .setDisabled(true)

      );
    await interaction.update({ embeds: [embed], components: [row] });
    db.delete(`onay-red-mesaj_${interaction.message.id}`)
    db.delete(`bot_bilgi_${botid}`)
    db.delete(`bot_${botid}`)

    const embedd = new Discord.MessageEmbed()
      .setColor("GREEN")
      .setTitle("New Bot Approved to Queue")
      .setDescription(`Bot Owner Is: <@${sahip}>`)
      .addField(`**Username:** `, `\`\`\`\ ${(await client.users.fetch(botid)).username} \`\`\`\ `, true)
      .addField(`**ID:** `, `\`\`\`\ ${botid} \`\`\`\ `, true)
      .setFooter("©𝟐𝟎𝟐𝟐 𝐁𝐨𝐭 𝘼𝙡𝙡 𝙍𝙞𝙜𝙝𝙩𝙨 𝙍𝙚𝙨𝙚𝙧𝙫𝙚𝙙")

    
    client.channels.cache.get(ayarlar['onay-red-log']).send({ content: `<@${sahip}> Approved Your Bot! `, embeds: [embedd] })
  }
});
//////////////////////////////////////////////////////////////////////////////////////////////////////////

client.on('modalSubmit', async (modal) => {

  if (modal.customId === 'narcos-botlist-red') {

    let sahip = db.fetch(`onay-red-mesaj_${modal.message.id}`)
    const aciklama = modal.getTextInputValue('red-sebep')
    let botid = db.fetch(`bot_id_${sahip}`)
    //////////////////////////////////////////////

    const embed = new Discord.MessageEmbed()
      .setColor("RED")
      .setTitle("New Bot Declined to Queue")
      .setDescription(`**Bot Owner Is:** <@${sahip}>`)
      .addField(`**Username** `, `\`\`\`\ ${(await client.users.fetch(botid)).username} \`\`\`\ `, true)
      .addField(`**ID** `, `\`\`\`\ ${botid} \`\`\`\ `, true)
      .addField(`**Sebep:**`, `\`\`\`\ ${aciklama}\`\`\`\ `)
      .setFooter("©𝟐𝟎𝟐𝟐 𝐁𝐨𝐭 𝘼𝙡𝙡 𝙍𝙞𝙜𝙝𝙩𝙨 𝙍𝙚𝙨𝙚𝙧𝙫𝙚𝙙")

    await modal.deferReply({ ephemeral: true })
    modal.followUp({ content: `Başarılı Bir Şekilde Reddedildi.`, ephemeral: true })
    client.channels.cache.get(ayarlar['onay-red-log']).send({ content: `<@${sahip}> Declined Your Bot! `, embeds: [embed] })
    //////////////////////////////////////////////


    db.delete(`bot_id_${sahip}`)
    db.delete(`onay-red-mesaj_${modal.message.id}`)
    db.delete(`bot_bilgi_${botid}`)
    db.delete(`bot_${botid}`)

    const embedd = new Discord.MessageEmbed()
      .setColor("RED")
      .setDescription(`
		**${botid}** İD bot Reddedildi.
		**Reddeden Yetkili:** <@${modal.user.id}> (${modal.user.id})
		> Sebep: **${aciklama}**
		`)
    const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId('reddedildi')
          .setLabel('Bot Reddedildi')
          .setStyle('DANGER')
          .setDisabled(true)

      );
    client.channels.cache.get(ayarlar.botlog).messages.edit(modal.message.id, { embeds: [embedd], components: [row] })
  }
  /////////////////////////////////////////////////////////////////////////////////////////////////////////
  if (modal.customId === 'narcos-botlist') {

    let sahip = db.fetch(`onay-red-mesaj_${modal.message.id}`)
    const botid = modal.getTextInputValue('bot-id')
    const botprefix = modal.getTextInputValue('bot-prefix')
    const topgg = modal.getTextInputValue('bot-onay')
    const aciklama = modal.getTextInputValue('bot-hakkinda')

    let kontrol = db.fetch(`bot_id_${modal.user.id}`)
    await modal.deferReply({ ephemeral: true })
    if (kontrol) return modal.followUp({ content: `Zaten Başvuru Yapmışsın Onaylanmasını Bekleyiniz.`, ephemeral: true })
    let kontrol2 = db.fetch(`bot_${botid}`)
    if (kontrol2) return modal.followUp({ content: `Bu Bot Zaten Sistemimizde Var.`, ephemeral: true })
    db.set(`bot_id_${modal.user.id}`, botid)
    db.set(`bot_${botid}`, modal.user.id)
    db.set(`bot_bilgi_${botid}`, [])
    db.push(`bot_bilgi_${botid}`, botprefix)
    db.push(`bot_bilgi_${botid}`, topgg)
    db.push(`bot_bilgi_${botid}`, aciklama ? aciklama : "açıklama bulunamadı")
    modal.followUp({ content: `Başarılı Bir Şekilde Ekleme Talebi Açıldı`, ephemeral: true })

    const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId('botonay')
          .setLabel('Botu Onayla')
          .setStyle('SUCCESS'),

        new MessageButton()
          .setCustomId('botred')
          .setLabel('Botu Reddet')
          .setStyle('DANGER'),

        await new MessageButton()
          .setURL(`https://discord.com/oauth2/authorize?client_id=${botid}&guild_id=${modal.message.guildId}&scope=bot&permissions=0`)
          .setLabel('0 Perm Davet')
          .setStyle('LINK'),

        /*
            await new MessageButton()
          .setURL(`https://discord.com/oauth2/authorize?client_id=${botid}&guild_id=${modal.message.guildId}&scope=bot&permissions=8`)
          .setLabel('8 Perm Davet')
          .setStyle('LINK'),
        */
      );
    const embed = new Discord.MessageEmbed()
      .setTitle("New Bot Added to Queue")
      .setColor("#ff555a")
      
      .addField("**Bot Owner Is:**", ` \`\`\`\ ${modal.user.username}\`\`\`\ `)
      .addField(`**İD:**`, ` \`\`\`\ ${botid}\`\`\`\ `, true)
      .addField(`**Prefix:**`, ` \`\`\`\ ${botprefix}\`\`\`\ `, true)
      .addField(`**Top.gg Onaylımı?**`, ` \`\`\`\ ${topgg} \`\`\`\ `, true)
      .addField(`**Açıklama;**`, `\`\`\`\ ${aciklama ? aciklama : "Açıklama Bulunamadı."} \`\`\`\ `, true)
      .setFooter("©𝟐𝟎𝟐𝟐 𝐁𝐨𝐭 𝘼𝙡𝙡 𝙍𝙞𝙜𝙝𝙩𝙨 𝙍𝙚𝙨𝙚𝙧𝙫𝙚𝙙")
      .setImage("https://media.discordapp.net/attachments/969988173142839312/996784367265382430/standard.gif")

    
    client.channels.cache.get(ayarlar.botlog).send({ content: `<@&${ayarlar.botlistyetkilirol}> New Bot Request! `, embeds: [embed], components: [row] }).then(c => {
      db.set(`onay-red-mesaj_${c.id}`, modal.user.id)
    })
  }
})

/////////////////////////////////////////////////////////////////////////////////////////////////////////

client.on('guildMemberRemove', async (member) => {

  let kontrol = db.fetch(`bot_id_${member.id}`)

  if (!kontrol) return
  let user = member.guild.members.cache.get(kontrol)
  member.guild.members.ban(kontrol)
  const embed = new Discord.MessageEmbed()
    .setColor("#ff555a")
    .addField(`**Bot Niye Banlandı?**`, `\`\`\`\ Sunucudan çıktın botunuda sunucudan banladım. \`\`\`\ `, true)
    .setFooter("©𝟐𝟎𝟐𝟐 𝐁𝐨𝐭 𝘼𝙡𝙡 𝙍𝙞𝙜𝙝𝙩𝙨 𝙍𝙚𝙨𝙚𝙧𝙫𝙚𝙙")
    .setImage("https://cdn.discordapp.com/attachments/969988173142839312/996784367265382430/standard.gif")
  client.channels.cache.get(ayarlar['cikti-log']).send({ content: ` ${member} Botun Banlandı.`, embeds: [embed] })
})

client.on("guildMemberAdd", async member => {
  const cdb = require("orio.db")
  let botrol = await cdb.get(`bototorol_${member.guild.id}`)
  if (botrol) {
    let botrol2 = member.guild.roles.cache.get(botrol);
    if (botrol2) {
      if (botrol) {
        if (member.user.bot) {
          member.roles.add(botrol2)
        }
      }
    }
  }
});
client.login(process.env.token);
/////////////////////////////////////////////////////////////////////////////////////////////////////////
