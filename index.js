const { Telegraf, Markup, Scenes, session } = require("telegraf");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const bot = new Telegraf(process.env.BOT_TOKEN);

async function main() {
  const uri =
    "mongodb+srv://comedyhall:qwerty12345QWERTY@comedyhallcluster.t2gup9r.mongodb.net/?retryWrites=true&w=majority";

  const client = new MongoClient(uri);

  try {
    // Connect to the MongoDB cluster
    await client.connect();

    // Make the appropriate DB calls

    await listDatabases(client);

    const reserveWizardScene = new Scenes.WizardScene(
      "show",
      async (ctx) => {
        if (ctx.message.text == "Сброс") {
          ctx.scene.enter("begin");
        } else {
          ctx.session.data = {};
          ctx.session.data.firstName = ctx.message.from.first_name || "Anonim";
          ctx.session.data.username = ctx.message.from.username || "Anonim";
          await ctx.reply(
            `шаг 1: Здравствуйте ${ctx.session.data.username}. На какое имя вы хотите провести бронирование`
          );
          return ctx.wizard.next();
        }
      },

      async (ctx) => {
        if (
          ctx.message.text == "Отменить бронирование" ||
          ctx.message.text == "Выбрать шоу" ||
          ctx.message.text == " "
        ) {
          await ctx.reply(
            `Cледуйте инструкциям!\nНа какое имя вы хотите провести бронирование`
          );
        } else {
          if (ctx.message.text == "Сброс") {
            ctx.scene.enter("begin");
          } else {
            if (ctx.message.text && ctx.message.text) {
              if (/\d/.test(ctx.message.text))
                ctx.reply("Принимаем только имена из букв!");
              else {
                ctx.session.data.name = ctx.message.text.toLowerCase();
                await ctx.replyWithHTML(
                  // "Шаг 2: Назовите шоу\nВнимание❗️\nБронирование на шоу СОЛЬНЫЙ КОНЦЕРТ: ЮРА КИРДУН 20:00 через чат бот остановлено❗️\nНаличие мест на СОЛЬНЫЙ КОНЦЕРТ: ЮРА КИРДУН 18:00 уточнять по телефону +375291129579 ❗️❗️❗️\n\n<i>Можно указать несколько шоу\nнапример: Чего хотят женщины. Отчетный концерт пятница</i>\n\nПеред выбором шоу убедитесь, пожалуйста, в актуальности афиши в нашем Instagram📷 (расписание).\nhttps://www.instagram.com/stories/highlights/17992650136661135/\n\nОбращаем внимание❗️\nНа Классический микрофон🎙️ и MoneyMic💰 бронировать места не нужно❗️"
                  "Шаг 2: Назовите шоу\n<i>Можно указать несколько шоу\nнапример: Чего хотят женщины. Отчетный концерт пятница</i>\n\nПеред выбором шоу убедитесь, пожалуйста, в актуальности афиши в нашем Instagram📷 (расписание).\nhttps://www.instagram.com/stories/highlights/17992650136661135/\n\nОбращаем внимание❗️\nНа Классический микрофон🎙️ и MoneyMic💰 бронировать места не нужно❗️"
                );

                // \nНаличие мест уточнять по номеру телефона: +375291129579 ❗️❗️❗️
                return ctx.wizard.next();
              }
            } else ctx.reply("Принимаем только текст!");
          }
        }
      },
      async (ctx) => {
        if (
          ctx.message.text == "Отменить бронирование" ||
          ctx.message.text == "Выбрать шоу" ||
          ctx.message.text == " "
        ) {
          await ctx.replyWithHTML(
            `Cледуйте инструкциям!\nНазовите шоу\n<i>Можно указать несколько шоу\nнапример: Чего хотят женщины. Отчетный концерт пятница</i>`
          );
        } else {
          if (ctx.message.text == "Сброс") {
            ctx.scene.enter("begin");
          } else if (ctx.message.text) {
            ctx.session.data.show = ctx.message.text;
            await ctx.reply("Шаг 3: Количество бронируемых мест (до 8)");
            return ctx.wizard.next();
          } else ctx.reply("Принимаем только текст!");
        }
      },
      async (ctx) => {
        if (
          ctx.message.text == "Отменить бронирование" ||
          ctx.message.text == "Выбрать шоу" ||
          ctx.message.text == " "
        ) {
          await ctx.reply(
            `Cледуйте инструкциям!\nУкажите количество бронируемых мест (до 8)`
          );
        } else {
          if (ctx.message.text == "Сброс") {
            ctx.scene.enter("begin");
          } else {
            if (ctx.message.text) {
              if (/\d/.test(ctx.message.text)) {
                if (ctx.message.text > 0 && ctx.message.text < 9) {
                  ctx.session.data.seats = ctx.message.text;
                  const today = (ctx.session.data.date = new Date());

                  await ctx.replyWithHTML(
                    "Шаг 4: Пожалуйста, введите номер телефона.\n<i>например: 336787728</i>"
                  );
                  return ctx.wizard.next();
                } else ctx.reply("Отправьте число от 1 до 8!");
              } else ctx.reply("Пожалуйста, вводите только цифры!");
            }
          }
        }
      },
      async (ctx) => {
        if (
          ctx.message.text == "Отменить бронирование" ||
          ctx.message.text == "Выбрать шоу" ||
          ctx.message.text == " "
        ) {
          await ctx.replyWithHTML(
            `Cледуйте инструкциям!\nПожалуйста, введите номер телефона.\n<i>например: 336787728</i>`
          );
        } else {
          if (ctx.message.text == "Сброс") {
            ctx.scene.enter("begin");
          } else {
            if (ctx.message.text) {
              if (/\d/.test(ctx.message.text)) {
                ctx.session.data.number = ctx.message.text;

                await ctx.reply(
                  `Бронирование на имя: ${ctx.session.data.name}\nВыбранное шоу: ${ctx.session.data.show}\nКоличество забронированных мест: ${ctx.session.data.seats}\nНомер:${ctx.session.data.number}`
                );
                await ctx.reply(
                  "Подтвердите бронирование",
                  Markup.inlineKeyboard([
                    [Markup.button.callback("Подтвердить", "ok")],
                  ])
                );

                reserveWizardScene.action("ok", async (ctx) => {
                  try {
                    await ctx.answerCbQuery();
                    ctx.reply(ctx.session.data, {
                      chat_id: ctx.chat.id,
                      text: "Бронирование прошло успешно",
                    });
                    const users = client.db().collection("users");
                    await users.insertOne({ name: ctx.session.data });
                  } catch (e) {
                    console.log("Чата не существует!");
                  }
                  return ctx.scene.leave();
                });
              } else ctx.reply("Пожалуйста, введите только цифры!");
            } else ctx.reply("только цифры!");
          }
        }
      }
    );

    const cancelWizardScene = new Scenes.WizardScene(
      "cancellation",
      async (ctx) => {
        ctx.session.data = {};
        ctx.session.data.firstName = ctx.message.from.first_name || "Anonim";
        ctx.session.data.username = ctx.message.from.username || "Anonim";

        await ctx.replyWithHTML(
          `Здравствуйте ${ctx.session.data.username}. Укажите, пожалуйста, на какое имя было произведено бронирование, номер телефооа и название шоу\n<i>например: Ирина, 336787728, чего хотят женщины</i> `
        );
        return ctx.wizard.next();
      },

      async (ctx) => {
        if (
          ctx.message.text == "Отменить бронирование" ||
          ctx.message.text == "Выбрать шоу" ||
          ctx.message.text == " "
        ) {
          ctx.session.data = {};
          ctx.session.data.firstName = ctx.message.from.first_name || "Anonim";
          ctx.session.data.username = ctx.message.from.username || "Anonim";
          ctx.session.data.cancellation = ctx.message.text;

          ctx.replyWithHTML(
            `Заполните форму по образцу! Укажите, пожалуйста, на какое имя было произведено бронирование, номер телефооа и название шоу\n<i>например: Ирина, 336787728, чего хотят женщины</i> `
          );
        } else if (ctx.message.text == "Сброс") {
          ctx.scene.enter("begin");
        } else {
          ctx.session.data.cancellation = ctx.message.text;
          console.log(ctx.session.data.cancellation);
          ctx.reply(
            `Бронирование: ${ctx.session.data.cancellation} отменено`,
            Markup.inlineKeyboard([
              [Markup.button.callback("Подтвердить", "cancel")],
            ])
          );

          cancelWizardScene.action("cancel", async (ctx) => {
            try {
              await ctx.answerCbQuery();
              ctx.reply(ctx.session.data, {
                chat_id: ctx.chat.id,
                text: "Бронирование отменено успешно",
              });
              const users = client.db().collection("users");
              await users.insertOne({ name: ctx.session.data });
            } catch (e) {
              console.log("Чата не существует!");
            }
            return ctx.scene.leave();
          });
        }
      }
    );

    const startlWizardScene = new Scenes.WizardScene("begin", async (ctx) => {
      if (ctx.message.text == "Сброс") {
        bot.start;
        await client.connect();
        console.log("conect");
        await ctx.replyWithHTML(
          "Здравствуйте!\nЗдесь вы можете забронировать места или отменить бронирование на мероприятия в Stand Up Comedy Hall.\n\nДля этого ответьте, пожалуйста, на вопросы бота.\n\nВНИМАНИЕ! ВАЖНАЯ ИНФОРМАЦИЯ!\n❗️ Брони принимаются до 19.00 дня мероприятия.\n❗️ Обращаем Ваше внимание, что Вы бронируете места за столиком либо за барной стойкой.\n❗️ Места за столиком рассчитаны на 4-х человек, поэтому просим Вас дружелюбно отнестись к возможной подсадке и гостям рядом с Вами. Надеемся на Ваше понимание и позитивное настроение.\n❗️ Для Вашего комфорта просим приходить МИНИМУМ за 20 минут до начала шоу (начало в 20-00), это позволит Вам комфортно расположиться, а так, же сделать заказ и пообщаться с нашими барменами.\n\nС мероприятиями клуба можно ознакомиться:\nhttps://taplink.cc/standupcomedyhall",
          Markup.keyboard([["Выбрать шоу", "Отменить бронирование", "Сброс"]])
            .oneTime()
            .resize()
        );
      }

      if (ctx.message.text == "Выбрать шоу") {
        ctx.scene.enter("show");
      } else if (ctx.message.text == "Отменить бронирование") {
        ctx.scene.enter("cancellation");
      }
    });

    const stage = new Scenes.Stage([
      reserveWizardScene,
      cancelWizardScene,
      startlWizardScene,
    ]);

    bot.use(session());
    bot.use(stage.middleware());

    bot.start(async (ctx) => {
      try {
        await client.connect();
        console.log("conect");
        await ctx.reply(
          "Здравствуйте!\nЗдесь вы можете забронировать места или отменить бронирование на мероприятия в Stand Up Comedy Hall.\n\nДля этого ответьте, пожалуйста, на вопросы бота.\n\nВНИМАНИЕ! ВАЖНАЯ ИНФОРМАЦИЯ!\n❗️ Брони принимаются до 19.00 дня мероприятия.\n❗️ Обращаем Ваше внимание, что Вы бронируете места за столиком либо за барной стойкой.\n❗️ Места за столиком рассчитаны на 4-х человек, поэтому просим Вас дружелюбно отнестись к возможной подсадке и гостям рядом с Вами. Надеемся на Ваше понимание и позитивное настроение.\n❗️ Для Вашего комфорта просим приходить МИНИМУМ за 20 минут до начала шоу (начало в 20-00), это позволит Вам комфортно расположиться, а так, же сделать заказ и пообщаться с нашими барменами.\n\nС мероприятиями клуба можно ознакомиться:\nhttps://taplink.cc/standupcomedyhall",
          Markup.keyboard([["Выбрать шоу", "Отменить бронирование", "Сброс"]])
            .oneTime()
            .resize()
        );
      } catch (e) {
        console.error(e);
      }
    });
    bot.on("message", async (ctx) => {
      switch (ctx.message.text) {
        case "Выбрать шоу":
          ctx.scene.enter("show");
          break;
        case "Отменить бронирование":
          ctx.scene.enter("cancellation");
          break;
        case "Сброс":
          ctx.scene.enter("begin");
          break;
      }
    });

    bot.launch();
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

main().catch(console.error);

async function listDatabases(client) {
  databasesList = await client.db().admin().listDatabases();

  console.log("Databases:");
  databasesList.databases.forEach((db) => console.log(` - ${db.name}`));
}
