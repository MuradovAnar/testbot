const {Telegraf, Markup, Scenes, session} = require('telegraf')
const {MongoClient} = require ('mongodb')
require('dotenv').config()


const bot = new Telegraf(process.env.BOT_TOKEN)

async function main(){
    const uri = 'mongodb+srv://comedy:0811966anAR95@cluster0.4em1mpd.mongodb.net/comedy?retryWrites=true&w=majority';
    const client = new MongoClient(uri);

    try {
        // Connect to the MongoDB cluster
        await client.connect();
 
        // Make the appropriate DB calls

        await  listDatabases(client);

        const reserveWizardScene = new Scenes.WizardScene('show',
    async (ctx) => {
        // await client.connect()
        // console.log('conect')
        ctx.session.data = {}
        ctx.session.data.firstName = ctx.message.from.first_name || 'Anonim'
        ctx.session.data.username = ctx.message.from.username || 'Anonim'
        await ctx.reply(`шаг 1: Здравствуйте ${ctx.session.data.username}. На чьё имя вы хотите провести бронирование`)
        return ctx.wizard.next()
    },
    async (ctx) => {
        if (ctx.message.text) {
            if (/\d/.test(ctx.message.text)) ctx.reply('Принимаем только имена из букв :)')
            else {
                ctx.session.data.name = ctx.message.text.toLowerCase().toUpperCase()
                await ctx.reply('Шаг 2: назовите шоу (можно указать несколько шоу)')
                return ctx.wizard.next()
            }
        } else ctx.reply('Принимаем только текст!')
    },
    async (ctx) => {
        if (ctx.message.text) {
            ctx.session.data.show = ctx.message.text
            await ctx.reply('Шаг 3: Количество бронируемых мест (до 5)')
            return ctx.wizard.next()
        } else ctx.reply('Принимаем только текст!')
    },
    async (ctx) => {
        if (ctx.message.text) {
            if (/\d/.test(ctx.message.text)) {
                if (ctx.message.text > 0 && ctx.message.text < 6) {
                    ctx.session.data.seats = ctx.message.text
                    await ctx.reply(`Броинрование на имя: ${ctx.session.data.name}\nВыбранное шоу: ${ctx.session.data.show}\nКоличество забронированных мест: ${ctx.session.data.seats}`)
                    await ctx.reply('Подтвердите бронирование', Markup.inlineKeyboard([
                        [Markup.button.callback('Подтвердить', 'ok')],      
                    ]))
                    const users = client.db().collection('users')
                    await users.insertOne({name: ctx.session.data})
                    reserveWizardScene
                    .action('ok', async ctx => {

                        try {
                            await ctx.answerCbQuery()
                            console.log(ctx.session.data)
                            ctx.reply(ctx.session.data, {
                                // chat_id: ctx.chat.id
                                chat_id: ctx.chat.id, 
                                text: 'some text'
                            })
                        } catch (e) { console.log('Чата не существует!') }
                        return ctx.scene.leave()
                    })
                } else ctx.reply('Отправь число от 1 до 5!')
            } else ctx.reply('Пожалуйста, введите только цыфры!')
        }
    }
)

const stage = new Scenes.Stage([reserveWizardScene]);

bot.use(session())
bot.use(stage.middleware())

bot.start(async ctx => {
    try{
        await client.connect()
        console.log('conect')
        await ctx.reply('Бронирование', Markup.keyboard([
            (['Выбрать шоу']) 
        ])
        .oneTime()
        .resize())
    } catch(e) {
        console.error(e)
    }
    
})
bot.on('message', async ctx => {
    switch (ctx.message.text) {
        case 'Выбрать шоу': ctx.scene.enter('show')
        break;
    }
})

bot.launch()
 
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

main().catch(console.error);

async function listDatabases(client){
    databasesList = await client.db().admin().listDatabases();
 
    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
};