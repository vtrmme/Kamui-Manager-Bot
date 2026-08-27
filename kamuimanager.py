import os
import discord
from discord.ext import commands
from discord import app_commands
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

# Comando de bienvenida manual
@bot.tree.command(name="pruebabienvenida", description="Simula el mensaje de bienvenida")
async def prueba_bienvenida(interaction: discord.Interaction):
    embed = crear_embed_bienvenida(interaction.user)
    await interaction.response.send_message(embed=embed)

# Comando /normas para la comunidad de anime
@bot.tree.command(name="normas", description="Muestra las normas oficiales de Anime Lost Zone")
async def normas(interaction: discord.Interaction):
    embed = discord.Embed(
        title="<:pixel_fiesta:1534150093916209242> Normas de Anime Lost Zone <:pixel_fiesta:1534150093916209242>",
        description=(
            "Para mantener la paz en nuestra dimensión y disfrutar del anime sin toxicidad, "
            f"por favor sigue las siguientes reglas de convivencia <:pixel_seguridad:1534147571210260540>:\n\n"
            
            "**1. Respeto mutuo y buen ambiente**\n"
            "Trata a todos los nakamas con educación. Queda prohibido el acoso, insultos graves, comentarios racistas, homófobos o discriminatorios.\n\n"
            
            "**2. Cuidado con los Spoilers**\n"
            "Si vas a hablar de eventos recientes de mangas o animes en emisión, utiliza obligatoriamente las etiquetas de spoiler de Discord (`||texto oculto||`) para no arruinarle la experiencia a los demás.\n\n"
            
            "**3. Nada de Spam ni Flood**\n"
            "No satures los canales con links sospechosos, publicidad de otros servidores de Discord, autorreferencias excesivas o texto repetitivo.\n\n"
            
            "**4. Usa el canal adecuado**\n"
            f"Mantén los temas en su lugar correspondiente (ej. memes en general, recomendaciones en anime, etc.). Consulta <:pixel_canales:1534147507049726014> <#1533949201048797238> para guiarte.\n\n"
            
            "**5. Contenido NSFW Prohibido**\n"
            "Este es un servidor apto para todo público. Está estrictamente prohibido enviar imágenes, videos o textos con contenido explícito (NSFW/Gore).\n\n"
            
            "¡Disfruta de tu estadía, comparte tus gustos otaku y pásala bien en la comunidad! <:pixel_fiesta:1534150093916209242>"
        ),
        color=0xFF73FA # Un tono rosado/morado muy acorde a temática anime
    )
    embed.set_footer(text="El incumplimiento de estas normas puede resultar en sanciones o expulsión.")
    
    await interaction.response.send_message(embed=embed)

token = os.getenv('DISCORD_TOKEN')
if not token:
    raise ValueError("No se encontró la variable DISCORD_TOKEN.")

bot.run(token)
