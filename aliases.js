import * as c from "./commands"

export const commandsRegExp = {
	Help: {
		r: /^(рудз|х[еэ]лп|помо(щь|ги)|команды|help|comm?ands?)[.!]?$/,
		f: c.Help
	},
	Ping: {
		r: /^(пинг|ping)[.!]?$/,
		f: c.Ping
	},
	Img: {
		r: /^(пикча|имг|картинк?а|изображение|галерея|img|image|pic(ture)?|gallery)[.!,:]?$/,
		f: c.Img
	},
	Send: {
		r: /^(отправ(ит)?ь|предложи(ть)?|пришли|прислать|send)$/,
		f: c.Send
	},
	React: {
		r: /^([пpрr]|поставь|отреагируй|реакция|react(ion)?)$/,
		f: c.React
	},
	EmojiList: {
		r: /^(э(мо(д[жз]|ж)и)?|смайл(ики|ы)|emoji(s|list)?)[.!]?$/,
		f: c.EmojiList
	},
	Sticker: {
		r: /^(с(тикер)?|sticker|э(мо(д[жз]|ж)и)?линк|e(moji)?link)$/,
		f: c.Sticker
	},
	Servers: {
		r: /^(сервер[аы]|servers)[.!]?$/,
		f: c.Servers
	},
	Avatar: {
		r: /^(ав(атар(ка)?|к?а)|ava(tar)?|pfp)[.!]?$/,
		f: c.Avatar
	},
	Invite: {
		r: /^(приглашение|инвайт|invite)[.!]?$/,
		f: c.Invite
	},
	Homestuck: {
		r: /^(hs|хс|хоумстак|homestuck)[.!]?$/,
		f: c.Homestuck
	},
	SnowflakeTime: {
		r: /^(sftime)[.!]?$/,
		f: c.SnowflakeTime
	},
	Stats: {
		r: /^(stats|статы|статистика|гз|ап(тайм)?|up(time)?)[.!]?$/,
		f: c.Stats
	},
	When: {
		r: /^(когда)[.!]?$/,
		f: c.When
	},
	IronDoor: {
		r: /^(железнаядверь|жд)[.!]?$/,
		f: c.IronDoor
	},
	Three: {
		r: /^-?(\d)[.!]?$/,
		f: c.Three
	},
	Rtfm: {
		r: /^(rtfm|man|docs?)[.!]?$/,
		f: c.Rtfm
	}
}
export const simpleAnswers = [
	{
		r: /^(прив(ет(ствую)?)?|здравствуй(те)?|х[ао]й|хауди)[.!]?$/,
		t: ["Привет.", "Hello, world!", "Доброго времени суток!"],
		e: null
	},
	{
		r: /^(пока|до свидания|прощай(те)?|до скорого)[.!]?$/,
		t: ["Пока!", "До скорой встречи!", "До свидания!"],
		e: null
	},
	{
		r: /^((доброй|спокойной) ночи|(добрых|спокойных|хороших|сладких) снов)[.!]?/,
		t: null,
		e: "🌃"
	},
	{
		r: /^(как дела|что (ты )?делаешь)[?]?/,
		t: ["Отвечаю на твоё сообщение.", "Какие дела могут быть у скрипта?"],
		e: null
	},
	{
		r: /^((что ты|ты что) такое|(кто ты|ты кто)( такой)?)[?]?/,
		t: ["Я – просто скрипт."],
		e: null
	}
]
