import * as slash from "https://raw.githubusercontent.com/harmonyland/harmony/main/deploy.ts";

// Pick up TOKEN and PUBLIC_KEY from ENV.
slash.init({ env: true });

const ACTIVITIES: {
  [name: string]: {
    id: string;
    name: string;
  };
} = {
  poker: {
    id: "755827207812677713",
    name: "Poker Night",
  },
  betrayal: {
    id: "773336526917861400",
    name: "Betrayal.io",
  },
  youtube: {
    id: "755600276941176913",
    name: "YouTube Together",
  },
  fishing: {
    id: "814288819477020702",
    name: "Fishington.io",
  },
};

// Create Slash Commands if not present
slash.commands.all().then((e) => {
  if (e.size !== 2) {
    slash.commands.bulkEdit([
      {
        name: "davet",
        description: "Beni sunucuya davet edin.",
      },
      {
        name: "aktivite",
        description: "Bir ses kanalında aktivite olayı çağırın.",
        options: [
          {
            name: "channel",
            type: slash.SlashCommandOptionType.CHANNEL,
            description: "Aktivite olayı çağrılacak ses kanalı.",
            required: true,
          },
          {
            name: "aktivite",
            type: slash.SlashCommandOptionType.STRING,
            description: "Çağrılacak aktivite.",
            required: true,
            choices: Object.entries(ACTIVITIES).map((e) => ({
              name: e[1].name,
              value: e[0],
            })),
          },
        ],
      },
    ]);
  }
});

slash.handle("activity", (d) => {
  if (!d.guild) return;
  const channel = d.option<slash.InteractionChannel>("channel");
  const activity = ACTIVITIES[d.option<string>("activity")];
  if (!channel || !activity) {
    return d.reply("Geçersiz parametre.", { ephemeral: true });
  }
  if (channel.type !== slash.ChannelTypes.GUILD_VOICE) {
    return d.reply("Aktiviteler sadece ses kanallarında çağrılabilir.", {
      ephemeral: true,
    });
  }

  slash.client.rest.api.channels[channel.id].invites
    .post({
      max_age: 604800,
      max_uses: 0,
      target_application_id: activity.id,
      target_type: 2,
      temporary: false,
    })
    .then((inv) => {
      d.reply(
        `[ ${activity.name} aktivitesini ${channel.name} kanalında çağırmak için tıklayın.](<https://discord.gg/${inv.code}>)`
      );
    })
    .catch((e) => {
      console.log("Failed", e);
      d.reply("Aktivite çağrılamadı. İletişim için Kegrine.#3852.", { ephemeral: true });
    });
});

slash.handle("invite", (d) => {
  d.reply(
    `• [Buraya tıklayarak davet edin.](<https://discord.com/api/oauth2/authorize?client_id=831507163972370432&permissions=1&scope=applications.commands%20bot>)\n` +
      `• [Site'ye gidin.](<http://leona.matsurari.tech>)`,
    { ephemeral: true }
  );
});

slash.handle("*", (d) => d.reply("Çağrılamayan komut.", { ephemeral: true }));
slash.client.on("interactionError", console.log);
