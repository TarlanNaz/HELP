import { Bot } from "https://deno.land/x/grammy@v1.32.0/mod.ts"; 
//import { Context } from "https://deno.land/x/grammy@v1.32.0/mod.ts"; 

// Создайте экземпляр класса `Bot` и передайте ему токен вашего бота.  
export const bot = new Bot(Deno.env.get("BOT_TOKEN") || ""); // Убедитесь, что токен установлен  

/*async function PositiveNumber(ctx: Context): Promise<number> {
    while (true) {
        // Запрашиваем возраст у пользователя
        await ctx.reply("Сколько вам лет?");

        // Ожидаем ответа от пользователя
        bot.on("message", async (ctx) => { 
            const ageText = ctx.message.text;
            const age = Number(ageText);

        // Проверяем, что возраст — положительное число
            if (!isNaN(age) && age > 0) {
                return age; // Возвращаем возраст, если он корректен
             } else {
                await ctx.reply("Введите положительную цифру!");
        }
        })

        // Получаем текст сообщения
        

        // Преобразуем текст в число
        
    }
}
*/
// Состояние пользователя  
type Topic  = {[id: string]: { id: string; createdAt: Date; title: string; meetingId: string; }} ;
type UserMeeting = {[id: string]: { userId: string; meetingId: string}};
type Meeting ={[id: string]: {createdAt: Date; title : string; date: Date; place: string; meetings : Array<UserMeeting>; topics: Array<Topic>}}
//type Place = {[id: string]: {name : string; adress : string; meeting: Array<Meeting>}};
type User = { [id: string]: { name: string; age: string; city: string; tgId: string; tgName?: string; networkingPoints: number; countMeetings: number; meetings: Array<Meeting>; } };


//const topic: Topic = {}; // Темы встречи
//const userMeeting: UserMeeting  = {}; // Оценки пользователей по встречам
//const meeting: Meeting = {}; // Описание встречи
//const place : Place ={}
const userState: User = {};  
const users: User  = {}; // Хранение всех зарегистрированных пользователей  

// Функция для оценки встречи  

// Команды для регистрации  
bot.command("start", (ctx) => {  
    ctx.reply("Добро пожаловать! Чтобы начать регистрацию, введите /register.");  
});  

// Команда /register
bot.command("register", (ctx) => {
    const tgId = ctx.from!.id.toString();
    userState[tgId] = {
        name: '',
        city: '',
        age: '',
        tgId: '',
        tgName: '',
        networkingPoints: 0,
        countMeetings: 0,
        meetings: [],  // Массив встреч, в которых участвует пользователь
    };
    ctx.reply("Как вас зовут?");
});

// Обработка сообщений
bot.on("message", async (ctx) => {
    const tgId = ctx.from!.id.toString();
    const tgName = ctx.from.username;
    const state = userState[tgId];

    if (!state) {
        await ctx.reply("Пожалуйста, начните с команды /register.");
        return;
    }

    if (!state.name) {
        state.name = ctx.message.text;
        await ctx.reply("В каком городе вы живёте?");
    } else if (!state.city) {
        state.city = ctx.message.text;
        await ctx.reply("Сколько вам лет?");
    } else if (!state.age) {
        state.age = ctx.message.text;

        // Сохраняем информацию о пользователе
        users[tgId] = {
            name: state.name,
            age: state.age,
            city: state.city,
            tgId: tgId,
            tgName: tgName,
            networkingPoints: 0,
            countMeetings: 0,
            meetings: [],  // Массив встреч, в которых участвует пользователь
        };

        await ctx.reply("Спасибо за регистрацию!");
    }
});

// Запуск бота
bot.start();
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