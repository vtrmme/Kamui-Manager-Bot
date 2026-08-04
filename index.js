const { 
  Client, 
  GatewayIntentBits, 
  EmbedBuilder, 
  SlashCommandBuilder, 
  REST, 
  Routes, 
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ChannelType
} = require('discord.js');
const express = require('express');

// --- SERVIDOR HTTP PARA RENDER / UPTIMEROBOT ---
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('🤖 ¡gαмєх 🅱🅾🆃 está activo y funcionando!');
});

app.listen(PORT, () => {
  console.log(`🌐 Servidor activo en el puerto ${PORT}`);
});

// --- CLIENTE DE DISCORD ---
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

// Constantes de IDs de GAMEX COMMUNITY
const RULES_CHANNEL_ID = '1533949201048797238';
const WELCOME_CHANNEL_ID = '1533950487919858026';
const VOICE_CREATOR_ID = '1534133390867955823';
const VOICE_CATEGORY_ID = '1534133235120869416';
const TICKET_PANEL_CHANNEL_ID = '1534133531876528219';

// ⚠️ REEMPLAZA LOS CÓDIGOS DE ABAJO CON TUS EMOJIS CON ID (Ejemplo: '<:pixel_corazon:123456789012345678>')
const EMOJI_CORAZON = '<:pixel_corazon:1534147758859096084>';
const EMOJI_NO_SPAM = '<:pixel_no_spam:1534147658938056724>';
const EMOJI_CANALES = '<:pixel_canales:1534147507049726014>';
const EMOJI_SEGURIDAD = '<:pixel_seguridad:1534147571210260540>';
const EMOJI_PUERTA = '<:pixel_puerta:1534150014979543061>';

// Registro de canales de voz temporales
const tempChannels = new Map();

// --- DEFINICIÓN DE COMANDOS ---
const commands = [
  new SlashCommandBuilder()
    .setName('anuncio')
    .setDescription('Envía un anuncio oficial de GAMEX COMMUNITY')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(opt => opt.setName('titulo').setDescription('Título del anuncio').setRequired(true))
    .addStringOption(opt => opt.setName('mensaje').setDescription('Contenido del mensaje').setRequired(true))
    .addChannelOption(opt => opt.setName('canal').setDescription('Canal de destino (opcional)').setRequired(false))
    .addStringOption(opt => opt.setName('color').setDescription('Color en código HEX (ej: #5865F2)').setRequired(false))
].map(c => c.toJSON());

// --- EVENTO READY ---
client.once('ready', async () => {
  console.log(`🤖 gαмєх 🅱🅾🆃 conectado con éxito como ${client.user.tag}`);

  // Registrar comandos de barra
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  try {
    await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
    console.log('✅ Comandos registrados correctamente');
  } catch (err) {
    console.error('Error al registrar comandos:', err);
  }

  // Desplegar paneles si no existen
  await setupRulesPanel();
  await setupTicketPanel();
});

// --- ENVIAR REGLAS AUTOMÁTICAS ---
async function setupRulesPanel() {
  const channel = await client.channels.fetch(RULES_CHANNEL_ID).catch(() => null);
  if (!channel) return;

  const messages = await channel.messages.fetch({ limit: 10 }).catch(() => null);
  const alreadySent = messages?.some(m => m.author.id === client.user.id && m.embeds.length > 0);

  if (alreadySent) return;

  const embedReglas = new EmbedBuilder()
    .setColor(0x5865F2)
    .setTitle('📜 Reglamento General — GAMEX COMMUNITY')
    .setDescription('¡Bienvenido/a a **GAMEX COMMUNITY**! Para mantener una gran convivencia, te pedimos cumplir las siguientes normas:\n\n⠀')
    .addFields(
      {
        name: `${EMOJI_CORAZON} 1. Respeto y Convivencia`,
        value: '• Trata a todos los miembros con educación y respeto.\n• No se tolera el acoso, los insultos, las faltas de respeto ni la discriminación.\n⠀',
      },
      {
        name: `${EMOJI_NO_SPAM} 2. Spam y Publicidad`,
        value: '• Queda prohibido enviar enlaces a otros servidores o publicidad no autorizada.\n• Evita el spam y menciones innecesarias.\n⠀',
      },
      {
        name: `${EMOJI_CANALES} 3. Uso Correcto de Canales`,
        value: '• Respeta la temática de cada canal.\n• Revisa la descripción de los canales antes de escribir.\n⠀',
      },
      {
        name: `${EMOJI_SEGURIDAD} 4. Normativa y Seguridad`,
        value: '• Cumple con los Términos de Servicio de Discord.\n• Prohibido el contenido NSFW o explícito.\n⠀',
      }
    )
    .setFooter({ text: 'gαмєх 🅱🅾🆃 • El desconocimiento de las reglas no exime de su cumplimiento.' })
    .setTimestamp();

  await channel.send({ embeds: [embedReglas] });
  console.log('✅ Reglas enviadas a GAMEX COMMUNITY');
}

// --- PANEL DE TICKETS ---
async function setupTicketPanel() {
  const channel = await client.channels.fetch(TICKET_PANEL_CHANNEL_ID).catch(() => null);
  if (!channel) return;

  const messages = await channel.messages.fetch({ limit: 10 }).catch(() => null);
  const alreadySent = messages?.some(m => m.author.id === client.user.id && m.embeds.length > 0);

  if (alreadySent) return;

  const embedTicket = new EmbedBuilder()
    .setColor('#5865F2')
    .setTitle('🎫 Centro de Soporte — GAMEX COMMUNITY')
    .setDescription(
      '¿Necesitas ayuda del equipo o quieres realizar una consulta privada?\n\n' +
      `${EMOJI_CORAZON} Selecciona la opción adecuada en el menú desplegable para abrir un **ticket privado**.`
    )
    .setFooter({ text: 'gαмєх 🅱🅾🆃 • Por favor, sé paciente tras abrir tu ticket.' });

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('menu_tickets')
    .setPlaceholder('Selecciona el motivo de tu ticket...')
    .addOptions([
      {
        label: 'Soporte General / Duda',
        description: 'Consulta general sobre GAMEX COMMUNITY.',
        value: 'ticket_soporte',
        emoji: '❓',
      },
      {
        label: 'Reporte de Usuario',
        description: 'Informa sobre una infracción de las normas.',
        value: 'ticket_reporte',
        emoji: '⚠️',
      },
      {
        label: 'Otras Consultas',
        description: 'Asuntos privados con la administración.',
        value: 'ticket_otro',
        emoji: '📩',
      },
    ]);

  const row = new ActionRowBuilder().addComponents(selectMenu);

  await channel.send({ embeds: [embedTicket], components: [row] });
  console.log('✅ Panel de tickets desplegado');
}

// --- BIENVENIDA AUTOMÁTICA ---
client.on('guildMemberAdd', async (member) => {
  const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID) || await member.guild.channels.fetch(WELCOME_CHANNEL_ID).catch(() => null);
  if (!channel) return;

  const embedBienvenida = new EmbedBuilder()
    .setColor('#5865F2')
    .setTitle(`${EMOJI_PUERTA} ¡Bienvenido/a a GAMEX COMMUNITY, ${member.user.username}!`)
    .setDescription(
      `¡Hola ${member}! Nos alegra mucho tenerte en la comunidad.\n\n` +
      `📌 **Pasos importantes:**\n` +
      `• Lee las normas en <#${RULES_CHANNEL_ID}>\n` +
      `• Solicita ayuda en <#${TICKET_PANEL_CHANNEL_ID}>\n\n` +
      `✨ Eres el miembro **#${member.guild.memberCount}** de GAMEX COMMUNITY.`
    )
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
    .setFooter({ text: `gαмєх 🅱🅾🆃 • ${member.guild.name}`, iconURL: member.guild.iconURL() })
    .setTimestamp();

  await channel.send({ content: `👋 ¡Dadle una gran bienvenida a ${member}!`, embeds: [embedBienvenida] });
});

// --- CANALES DE VOZ TEMPORALES ---
client.on('voiceStateUpdate', async (oldState, newState) => {
  if (newState.channelId === VOICE_CREATOR_ID) {
    const guild = newState.guild;
    const member = newState.member;

    try {
      const newChannel = await guild.channels.create({
        name: `🔊 Sala de ${member.displayName}`,
        type: ChannelType.GuildVoice,
        parent: VOICE_CATEGORY_ID,
        userLimit: 0,
      });

      tempChannels.set(newChannel.id, member.id);
      await member.voice.setChannel(newChannel);

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('configurar_temp_voice')
          .setLabel('⚙️ Personalizar canal')
          .setStyle(ButtonStyle.Primary)
      );

      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('🎮 ¡Canal Temporal Creado!')
        .setDescription('Pulsa el botón de abajo para cambiar el nombre y el límite de personas (máx. 100).')
        .setFooter({ text: 'gαмєх 🅱🅾🆃 • Se eliminará solo al quedar vacío.' });

      await newChannel.send({ embeds: [embed], components: [row] });
    } catch (err) {
      console.error('Error en canal de voz:', err);
    }
  }

  if (oldState.channelId && tempChannels.has(oldState.channelId)) {
    const oldChannel = oldState.guild.channels.cache.get(oldState.channelId);
    if (oldChannel && oldChannel.members.size === 0) {
      tempChannels.delete(oldChannel.id);
      await oldChannel.delete().catch(() => null);
    }
  }
});

// --- INTERACCIONES ---
client.on('interactionCreate', async (interaction) => {
  
  if (interaction.isStringSelectMenu() && interaction.customId === 'menu_tickets') {
    const tipo = interaction.values[0];
    const guild = interaction.guild;
    const user = interaction.user;

    const ticketExistente = guild.channels.cache.find(
      c => c.name === `ticket-${user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}`
    );

    if (ticketExistente) {
      return interaction.reply({
        content: `❌ Ya tienes un ticket abierto en ${ticketExistente}.`,
        ephemeral: true
      });
    }

    try {
      const ticketChannel = await guild.channels.create({
        name: `ticket-${user.username}`,
        type: ChannelType.GuildText,
        permissionOverwrites: [
          {
            id: guild.roles.everyone.id,
            deny: [PermissionFlagsBits.ViewChannel],
          },
          {
            id: user.id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles],
          },
        ],
      });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('cerrar_ticket')
          .setLabel('🔒 Cerrar Ticket')
          .setStyle(ButtonStyle.Danger)
      );

      const embedBienvenidaTicket = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle(`🎫 Ticket: ${user.username}`)
        .setDescription(
          `¡Hola ${user}! Un miembro del Staff de GAMEX COMMUNITY te atenderá en breve.\n\n` +
          `**Tipo de ticket:** \`${tipo.replace('ticket_', '').toUpperCase()}\``
        )
        .setFooter({ text: 'gαмєх 🅱🅾🆃 • Haz clic en el botón para cerrar.' });

      await ticketChannel.send({ content: `${user}`, embeds: [embedBienvenidaTicket], components: [row] });

      await interaction.reply({
        content: `✅ Ticket creado correctamente en ${ticketChannel}`,
        ephemeral: true
      });

    } catch (err) {
      console.error('Error al crear ticket:', err);
      await interaction.reply({ content: '❌ Hubo un error al crear el ticket.', ephemeral: true });
    }
  }

  if (interaction.isButton() && interaction.customId === 'cerrar_ticket') {
    await interaction.reply('🔒 El ticket se cerrará y eliminará en **5 segundos**...');
    setTimeout(async () => {
      await interaction.channel.delete().catch(() => null);
    }, 5000);
  }

  if (interaction.isButton() && interaction.customId === 'configurar_temp_voice') {
    const modal = new ModalBuilder().setCustomId('modal_config_voice').setTitle('Configurar canal de voz');
    const inputNombre = new TextInputBuilder().setCustomId('input_nombre').setLabel('Nombre del canal').setStyle(TextInputStyle.Short).setRequired(true);
    const inputLimite = new TextInputBuilder().setCustomId('input_limite').setLabel('Límite de usuarios (0-100)').setStyle(TextInputStyle.Short).setRequired(false);

    modal.addComponents(new ActionRowBuilder().addComponents(inputNombre), new ActionRowBuilder().addComponents(inputLimite));
    await interaction.showModal(modal);
  }

  if (interaction.isModalSubmit() && interaction.customId === 'modal_config_voice') {
    const nuevoNombre = interaction.fields.getTextInputValue('input_nombre');
    const limiteStr = interaction.fields.getTextInputValue('input_limite') || '0';
    let limite = parseInt(limiteStr, 10);
    if (isNaN(limite) || limite < 0) limite = 0;
    if (limite > 100) limite = 100;

    const channel = interaction.channel;
    if (channel && tempChannels.has(channel.id)) {
      await channel.setName(nuevoNombre);
      await channel.setUserLimit(limite);
      await interaction.reply({ content: `✅ Canal actualizado a **${nuevoNombre}** (${limite === 0 ? 'Sin límite' : limite + ' slots'})`, ephemeral: true });
    }
  }

  if (interaction.isChatInputCommand() && interaction.commandName === 'anuncio') {
    const titulo = interaction.options.getString('titulo');
    const mensaje = interaction.options.getString('mensaje').replace(/\\n/g, '\n');
    const canalDestino = interaction.options.getChannel('canal') || interaction.channel;
    const colorHex = interaction.options.getString('color') || '#5865F2';

    const embedAnuncio = new EmbedBuilder()
      .setTitle(titulo)
      .setDescription(mensaje)
      .setColor(colorHex)
      .setFooter({ text: `gαмєх 🅱🅾🆃 • Publicado por ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp();

    await canalDestino.send({ embeds: [embedAnuncio] });
    await interaction.reply({ content: `✅ Anuncio enviado con éxito en ${canalDestino}`, ephemeral: true });
  }
});

client.login(process.env.DISCORD_TOKEN);
