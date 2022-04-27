const ayarlar = require("../ayarlar.json");

module.exports = {
    name: "mute",
    description: "Etiketlediğiniz kişiye mute atar.",
    option: [
        user: {
            name: "üye",
            description: "Envanteri gösterilecek üyeyi giriniz.",
            required: true
        ],
    },
    async execute(interaction, client) {
        const member = interaction.options.getMember('üye');
        let message = interaction;
        if (!message.member.permissions.has('MANAGE_MESSAGES')) return;
        if (member.roles.highest.position >= message.member.roles.highest.position || member.user.id == message.guild.ownerId) return message.reply({ content: 'Bu kullanıcıyı susturamazsın.' });
        if (member.roles.highest.position >= message.guild.me.roles.highest.position) return message.reply({ content: 'Bu kullanıcıyı susturamıyorum.' });

        const request = require('native-request');
        const headers = {
            "accept": "/",
            "authorization": "Bot " + client.token,
            "content-type": "application/json",
        };

        await request.get(`https://discord.com/api/v8/guilds/${message.guild.id}/members/${member.user.id}`, headers, async function (err, data, status, headers) {
            if (err) throw err;
            if (new Date(JSON.parse(data).communication_disabled_until || Date.now()).getTime() > Date.now()) return message.reply({ content: 'Bu kullanıcı zaten susturulmuş.' });

            const fetch = require('node-fetch');
            await fetch(`https://discord.com/api/v8/guilds/${message.guild.id}/members/${member.user.id}`, {
                "credentials": "include",
                "headers": {
                    "accept": "*/*",
                    "authorization": "Bot " + ayarlar.token,
                    "content-type": "application/json",
                },
                "referrerPolicy": "no-referrer-when-downgrade",
                "body": JSON.stringify({
                    "communication_disabled_until": new Date(Date.now() + 1000 * 60 * 60 * 24)
                }),
                "method": "PATCH",
                "mode": "cors"
            });
            return message.reply({ content: `${member} üyesi yazı kanallarında susturuldu.` });
        });
    },
};
