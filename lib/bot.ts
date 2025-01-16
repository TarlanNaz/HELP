import { Bot, Context } from "https://deno.land/x/grammy@v1.32.0/mod.ts";

// Проверка токена
const BOT_TOKEN = Deno.env.get("BOT_TOKEN");
if (!BOT_TOKEN) {
    console.error("Ошибка: токен бота не установлен.");
    Deno.exit(1);
}

// Создаём бота
export const bot = new Bot(BOT_TOKEN);

// Типы данных
type User = {
    name: string;
    age: string;
    city: string;
    tgId: string;
    tgName: string;
    networkingPoints: number;
    countMeetings: number;
    meetings: Array<any>; // Замените на конкретный тип, если нужно
};

// Состояния пользователей
const userState: { [id: string]: Partial<User> } = {};
const users: { [id: string]: User } = {};

// Команда /start
bot.command("start", (ctx) => {
    ctx.reply("Добро пожаловать! Чтобы начать регистрацию, введите /register.");
});

// Команда /register
bot.command("register", (ctx) => {
    const tgId = ctx.from!.id.toString();
    const tgName = ctx.from.username || "Anonymous";

    userState[tgId] = {
        name: "",
        age: "",
        city: "",
        tgId,
        tgName,
        networkingPoints: 0,
        countMeetings: 0,
        meetings: [],
    };

    ctx.reply("Как вас зовут?");
});

// Обработка сообщений
bot.on("message", async (ctx) => {
    const tgId = ctx.from.id.toString();
    const state = userState[tgId];

    if (!state) {
        await ctx.reply("Пожалуйста, начните с команды /register.");
        return;
    }

    if (!state.name) {
        state.name = ctx.message.text!;
        await ctx.reply("В каком городе вы живёте?");
    } else if (!state.city) {
        state.city = ctx.message.text!;
        await ctx.reply("Сколько вам лет?");
    } else if (!state.age) {
        state.age = ctx.message.text!;

        // Сохраняем информацию о пользователе
        users[tgId] = {
            name: state.name,
            age: state.age,
            city: state.city,
            tgId,
            tgName: state.tgName,
            networkingPoints: 0,
            countMeetings: 0,
            meetings: [],
        };

        // Очищаем состояние
        delete userState[tgId];

        // Подтверждение данных
        await ctx.reply(`Спасибо за регистрацию! Вот ваши данные:\n- Имя: ${users[tgId].name}\n- Возраст: ${users[tgId].age}\n- Город: ${users[tgId].city}\n- Короткое имя: ${users[tgId].tgName}`);
    }
});

// Запуск бота

        /*// Ищем совпадения после регистрации  
        await findMatches(userId);  
    } else if (state?.waitingForResponse) {  
        const otherUserId = state.otherUserId!;  
        
        if (ctx.message.text.toLowerCase() === "да") {  
            await bot.api.sendMessage(otherUserId, `Пользователь ${userId} согласен на встречу!`);  
            await bot.api.sendMessage(userId, `Пользователь ${otherUserId} согласен на встречу! Договоритесь с ним о точном времени и месте.`);  

            // Запрос на оценку встречи для обоих пользователей  
            await assessment(userId);  
            await assessment(otherUserId);  
                } else if (ctx.message.text.toLowerCase() === "нет") {  
            await bot.api.sendMessage(otherUserId, `Пользователь ${userId} не заинтересован в встрече.`);  
            await ctx.reply("Хорошо, если вы передумаете, просто дайте знать!");  
        } else {  
            await ctx.reply('Пожалуйста, ответьте "Да" или "Нет".');  
        }  
    } else if (state?.waitingForResponse) {  
        // Обработка оценки, если пользователь находится в состоянии ожидания  
        const answer = parseInt(ctx.message.text);  
        if (!isNaN(answer) && answer >= 1 && answer <= 10) {  
            state.grade.push(answer);  
            await bot.api.sendMessage(userId, `Спасибо за вашу оценку: ${answer}`);  
            state.waitingForResponse = false; // Завершаем ожидание ответа для этого пользователя  

            // Проверяем, оценил ли другой пользователь  
            const otherUserId = state.otherUserId!;  
            const otherState = userState[otherUserId];  
            if (otherState?.waitingForResponse) {  
                await bot.api.sendMessage(otherUserId, `Пользователь ${userId} оценил встречу: ${answer}`);  
                otherState.waitingForResponse = false; // Завершаем ожидание ответа для другого пользователя  
            }  
        } else {  
            await ctx.reply('Пожалуйста, введите число от 1 до 10.');  
        }  
    } else {  
        ctx.reply("Я не знаю, как на это ответить. Пожалуйста, используйте команду /register для начала.");  
    }  
});  

// Функция для поиска совпадений  
async function findMatches(userId: string) {  
    const user = users[userId];  
    for (const [otherUserId, otherUser] of Object.entries(users)) {  
        if (otherUserId !== userId) {  
            // Проверяем совпадения по интересам, месту, кафе и времени  
            const isMatch = user.hobby.split(',').some(hobby => otherUser.hobby.includes(hobby.trim())) &&  
                            user.place === otherUser.place &&  
                            user.cafe === otherUser.cafe &&  
                            user.time === otherUser.time;  

            if (isMatch) {  
                // Уведомляем обоих пользователей о совпадении  
                await bot.api.sendMessage(userId,  
                    `У вас совпадение с пользователем ${otherUserId}!\n` +  
                    `- Хобби: ${otherUser.hobby}\n` +  
                    `- Район: ${otherUser.place}\n` +  
                    `- Кафе: ${otherUser.cafe}\n` +  
                    `- Время: ${otherUser.time}\n\n` +  
                    `Хотите встретиться? Ответьте "Да" или "Нет".`  
                );  

                await bot.api.sendMessage(otherUserId,  
                    `У вас совпадение с пользователем ${userId}!\n` +  
                    `- Хобби: ${user.hobby}\n` +  
                    `- Район: ${user.place}\n` +  
                    `- Кафе: ${user.cafe}\n` +  
                    `- Время: ${user.time}\n\n` +  
                    `Хотите встретиться? Ответьте "Да" или "Нет".`  
                );  

                // Устанавливаем состояние ожидания ответа  
                userState[userId].waitingForResponse = true;  
                userState[userId].otherUserId = otherUserId;  
                userState[otherUserId].waitingForResponse = true;  
                userState[otherUserId].otherUserId = userId;  
            }  
        }  
    }  
}  
*/
// Запуск бота  
await bot.start();