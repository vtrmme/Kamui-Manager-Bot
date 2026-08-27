import os
import discord
from discord.ext import commands
from dotenv import load_dotenv

load_dotenv()

intents = discord.Intents.default()
intents.members = True 
intents.message_content = True

class MyBot(commands.Bot):
    def __init__(self):
        super().__init__(command_prefix="!", intents=intents)

    async def setup_hook(self):
        await self.tree.sync()
        print("Comandos slash sincronizados correctamente.")

bot = MyBot()

WELCOME_CHANNEL_ID = 1533950487919858026

def crear_embed_bienvenida(usuario: discord.Member) -> discord.Embed:
    embed = discord.Embed(
        title="<:pixel_fiesta:1534150093916209242> Bienvenido a Anime Lost Zone <:pixel_fiesta:1534150093916209242>",
        description=(
            f"¡Hola {usuario.mention} ! - ¡Bienvenido a Anime Lost Zone! <:pixel_seguridad:1534147571210260540>\n"
            f"Gracias por unirte a nuestra comunidad. Te recomendamos revisar las reglas y conocer los canales principales para empezar.\n\n"
            f":pixel_puerta: **ENLACES ÚTILES**\n"
            f"<:pixel_canales:1534147507049726014> <#1542231604057874512>\n"
            f"<:pixel_canales:1534147507049726014> <#1533949201048797238>\n"
            f"<:pixel_canales:1534147507049726014> <#1533950246277615736>"
        ),
        color=0x5865F2
    )
    avatar_url = usuario.display_avatar.url if usuario.display_avatar else usuario.default_avatar.url
    embed.set_thumbnail(url=avatar_url)
    return embed

@bot.event
async def on_ready():
    print(f'Bot conectado exitosamente como {bot.user.name}')

@bot.event
async def on_member_join(member: discord.Member):
    channel = member.guild.get_channel(WELCOME_CHANNEL_ID)
    if channel:
        embed = crear_embed_bienvenida(member)
        await channel.send(embed=embed)

@bot.tree.command(name="pruebabienvenida", description="Simula el mensaje de bienvenida")
async def prueba_bienvenida(interaction: discord.Interaction):
    embed = crear_embed_bienvenida(interaction.user)
    await interaction.response.send_message(embed=embed)

token = os.getenv('DISCORD_TOKEN')
if not token:
    raise ValueError("No se encontró la variable DISCORD_TOKEN.")

bot.run(token)