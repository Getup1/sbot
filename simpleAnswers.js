export const simpleAnswers = [
	{
		r: /^(прив(ет(ствую)?)?|здравствуй(те)?|х[ао]й|хауди)$/,
		t: ["Привет.", "Hello, world!", "Доброго времени суток!"]
	},
	{
		r: /^(пока|до свидания|прощай(те)?|до скорого)$/,
		t: ["Пока!", "До скорой встречи!", "До свидания!"]
	},
	{
		r: /^(([а-я]+ое) утр(ечк)?о)/,
		e: ["🌇", "🌄", "🐦"]
	},
	{
		r: /^(([а-я]+ой) ночи|([а-я]+[иы]х) снов)/,
		e: ["🌃", "🌝", "🌌"]
	},
	{
		r: /^(как дела|что (ты )?делаешь?)/,
		t: ["Отвечаю на твоё сообщение.", "Какие дела могут быть у скрипта?"]
	},
	{
		r: /^((что ты|ты что) такое|(кто ты|ты кто)( такой)?)/,
		t: ["Я – просто скрипт."]
	},
	{
		r: /^((мне )?ску[чшщ]н[оа])/,
		t: [
			"Придумай текстовый квест и закодь его в бота.\nhttps://discordapp.com/developers/applications/",
			"Как насчёт выучить новый язык?\nhttps://invite.duolingo.com/BDHTZTB5CWWKTTJB3BBQBELDDY",
			"Посмотри Revolution OS https://youtu.be/n1F_MfLRlX0?t=394",
			"Посмотри Коносубу \nhttps://anilist.co/anime/21202/Kono-Subarashii-Sekai-ni-Shukufuku-wo/",
			"Посмотри Жожу \nhttps://anilist.co/anime/14719/JoJo-no-Kimyou-na-Bouken/",
			"Посмотри Психопасс \nhttps://anilist.co/anime/13601/PSYCHOPASS/",
			"Посмотри Танечку \nhttps://anilist.co/anime/21613/Youjo-Senki/",
			"Установи Arch Linux \nhttps://wiki.archlinux.org/index.php/Installation_guide",
			"Установи на мобилку F-Droid (аппстор опенсурсных приложений) \nhttps://f-droid.org/",
			"Поучаствуй в проекте Common Voice от Мозиллы \nhttps://voice.mozilla.org/ru/",
			"Попробуй решить пару головоломок \nhttps://projecteuler.net/recent",
			"Напиши игру на Юнити \nhttps://youtu.be/A-GkNM8M5p8"
		]
	}
]