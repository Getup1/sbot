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
		r: /^((мне )?ску+[чшщ]н[оа]+)/,
		t: [
			"Посмотри Revolution OS \nhttps://youtu.be/n1F_MfLRlX0?t=394",
			"Посмотри Коносубу \nhttps://anilist.co/anime/21202/Kono-Subarashii-Sekai-ni-Shukufuku-wo/",
			"Посмотри Жожу \nhttps://anilist.co/anime/14719/JoJo-no-Kimyou-na-Bouken/",
			"Посмотри Психопасс \nhttps://anilist.co/anime/13601/PSYCHOPASS/",
			"Посмотри Танечку \nhttps://anilist.co/anime/21613/Youjo-Senki/",
			"Поиграй в Шляпу во Времени \nhttps://store.steampowered.com/app/253230/A_Hat_in_Time/",
			"Поиграй в Вальхаллу \nhttps://store.steampowered.com/app/447530/VA11_HallA_Cyberpunk_Bartender_Action/",
			"Поиграй в Античембер \nhttps://store.steampowered.com/app/219890/Antichamber/",
			"Поиграй в Притчу Стэнли \nhttps://store.steampowered.com/app/221910/The_Stanley_Parable/",
			"Установи Арч на виртуалку \nhttps://wiki.archlinux.org/index.php/Installation_guide",
			"Поучаствуй в проекте Common Voice от Мозиллы \nhttps://voice.mozilla.org/ru/",
			"Попробуй решить пару головоломок \nhttps://projecteuler.net/recent",
			"Напиши игру на Юнити \nhttps://youtu.be/A-GkNM8M5p8",
			"Попробуй себя в кибербезопасности \nhttps://www.root-me.org/?lang=en",
			"Время научиться учить английский правильно \nhttps://habr.com/ru/post/493522/",
			"Почитай Хабр \nhttps://habr.com/ru/",
			"Почитай мангу \nhttps://f-droid.org/en/packages/eu.kanade.tachiyomi/",
			"Организуй или начни отложенные дела \nhttps://f-droid.org/en/packages/org.tasks/",
			"Напиши что-нибудь на мобилку \nhttps://metanit.com/java/android/1.2.php"
		]
	},
	{
		r: /^((с?кинь |share |give )?(со?у?рс|исходн(ый|ики)|гитхаб|git(hub)?|source|sauce|код|code)( код| code)?)/,
		t: ["https://github.com/Rult/sbot"]
	}
]