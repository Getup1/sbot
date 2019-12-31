import * as s from "./secondary"
import {client, OWNER_ID, BOT_ID, userDB, visibleServers} from "./bot"
import {imgDatabaseURL} from "./config"
import {hiragana, katakana, kanalat, kanji} from "./japdata"

import got from "got"
import Cheerio from "cheerio"
import Intl from "intl"
import fs from "fs"

const Canvas = require('canvas')
Canvas.registerFont('fonts/KosugiMaru-Regular.ttf', { family: 'KosugiMaru' })

export const commands = {
	Help: {
		r: /^(х[еэ]лп|помо(щь|ги)|команды|help|comm?ands?)[.!]?$/,
		v: true,
		f (msg) {
			const helpLines = [
				"Чтобы спросить что-либо, обратись ко мне по имени и введи команду.",
				"Например: `сбот имг креатив намия` (в ЛС можно без обращения)",
				`Пустить меня на свой сервер можно по [этой ссылке](https://discordapp.com/api/oauth2/authorize?client_id=${BOT_ID}&scope=bot&permissions=0).`
			]
			const helpEmbed = {
				color: 0x7486C2,
				title: "Привет, меня зовут СтиллБот <:tuturuMetal:601419582837751810>",
				description: helpLines.join("\n"),
				fields: [
					{
						name: "имг [теги через пробел]",
						value: "Рандомная пикча из [Галереи](https://stilltest.tk/gallery/).",
						inline: true
					},
					{
						name: "ава [никнейм или айди юзера]",
						value: "Глянуть чью-то авку.",
						inline: true
					},
					{
						name: "<описание пикчи> + прикреплённое изображение 📎",
						value: "Предложить свой скриншот в Галерею (только в ЛС, [пример оформления](https://i.imgur.com/kus289H.png)).\nЕсли я поставил в ответ 📮 - отправка работает."
					},
					{
						name: "хоумстак [номер_страницы]",
						value: "Почитать [комикс](https://www.homestuck.com/story).",
						inline: true
					},
					{
						name: "палитра + прикреплённое изображение 📎",
						value: "Считать цвета с картинки.",
						inline: true
					},
					{
						name: "кана <хирагана|катакана>",
						value: "日本語を学ぶ!",
						inline: true
					},
					{
						name: "когда <что-то случится>",
						value: "Узнай, когда это случится!",
						inline: true
					},
					{
						name: "жд <вопрос с ответом да/нет>",
						value: "Обратиться к мудрости [Железной Двери](https://randomforum.ru/threads/6469/).",
						inline: true
					}
				]
			}
		
			msg.channel.send({embed: helpEmbed})
		}
	},
	Ping: {
		r: /^(пинг|ping)[.!]?$/,
		v: true,
		f (msg) {
			let pongText = "🏓 Понг!"
			msg.channel.send(pongText)
				.then((pong) => {
					let userTime = msg.createdTimestamp / 1000
					let botTime = pong.createdTimestamp / 1000
					let pongTime = (botTime - userTime).toFixed(3)
					pong.edit(`${pongText} ${pongTime} сек`)
				})
				.catch(error => console.log(error))
		}
	},
	Destroy: {
		r: /^(дестрой)[.!]?$/,
		v: true,
		f (msg) {
			if (msg.author.id == OWNER_ID) {
				console.log("Destroying client...")
				msg.author.send("🛌 🌌").then(() => {
					client.destroy().then(() => {
						console.log("Exiting process...")
						process.exit()
					})
				})
			}
		}
	},
	Img: {
		r: /^(пикча|имг|картинк?а|изображение|галерея|img|image|pic(ture)?|gallery)[.!,:]?$/,
		v: true,
		async f (msg, args) {
			let argsText = ""
		
			if (args.length > 0) {
				argsText = args.join(",")
				argsText = "?tags=" + encodeURIComponent(argsText)
			}
		
			try {
				let { body: imageInfo } = await got(`${imgDatabaseURL}random/${argsText}`, { json: true })
				if (imageInfo.error) throw Error(imageInfo.error)
			
				let imageExtension = imageInfo.tags.includes("gif") ? "gif" : "png"
				let imagePreview = `https://i.imgur.com/${imageInfo.id}t.jpg`
				await s.getMainColorFromImage(imagePreview, color => {
					msg.channel.send({
						embed: {
							color: color,
							author: {
								name: imageInfo.title,
								icon_url: "https://i.imgur.com/5EOhj0z.png",
								url: `https://stilltest.tk/gallery/#${imageInfo.id}`
							},
							description: `Теги: ${imageInfo.tags.join(", ")}`
								+ (imageInfo.date ? `\nДата: ${imageInfo.date}` : ""),
							image: {
								url: `https://i.imgur.com/${imageInfo.id}.${imageExtension}`
							}
						}
					})
				})
			} catch (err) {
				await msg.react("604015450304806952")
			}
		}
	},
	Send: {
		r: /^(отправ(ит)?ь|предложи(ть)?|пришли|прислать|send)$/,
		async f (msg, args, msgSimplifiedOrigCase) {
			let imageParamsArray = msgSimplifiedOrigCase.match(/\S+ (\S+) ([\s\S]+)/)
		
			if (!imageParamsArray) {
				msg.react("📜")
				msg.channel.send("Чтобы отправить картинку, нужно добавить к ней описание, дату и место.")
				return
			}
		
			let startLink = imageParamsArray[1]
		
			let imgurParams
			let discordLink = ""
		
			let imageLink = startLink
			let imageID = ""
		
			if (!imageLink.includes("//i.imgur.com/")) {
				try {
					imgurParams = await s.sendAttachmentToImgur(imageLink)
					if (imgurParams) {
						discordLink = startLink
						imageLink = imgurParams[0]
						imageID = imgurParams[1]
					}
				} catch (err) {
					if (err.statusCode === 400) {
						msg.channel.send("Похоже, что ссылка не понравилась Имгуру.")
						return
					}
				}
			} else {
				try {
					imageID = imageLink.match(/\/\/i\.imgur\.com\/(.+)\./)[1]
				} catch (err) {}
			}
		
			let imageDate = ""
			if (discordLink) {
				let ogURLParts = discordLink.split("/")
				let ogImgName = ogURLParts[ogURLParts.length - 1]
				if (ogImgName.match(/\d{4}-\d{2}-\d{2}/)) {
					imageDate = ogImgName.match(/\d{4}-\d{2}-\d{2}/)[0]
				}
		
				discordLink = `<${discordLink}>\n`
			}
		

			let dateRE = /\d{4}[-_\.\/\\]\d{2}[-_\.\/\\]\d{2}/i
			let takenByRE = /(?:(?:скрин(?:шот)? )?снято?| ?by|takenby|from)\s*:?\s*(\S+)/i
			let tagsRE = /(?:tags|т[еаэ]ги)(?:\s+)?:?/i
			
			let imageNote = imageParamsArray[2]
			let customDate = ""
			let takenBy, imageTitle, tagsRaw
			
			try {
				let dateMatch = imageNote.match(dateRE)
				imageNote = imageNote.split(dateMatch[0]).join(" ")
				customDate = dateMatch[0].trim().replace(/[_\.\/\\]/g, "-")
			} catch (err) {}

			try {
				let takenByMatch = imageNote.match(takenByRE)
				imageNote = imageNote.split(takenByMatch[0]).join(" ")
				takenBy = s.trimPunc(takenByMatch[1])
			} catch (err) {}

			try {
				tagsRaw = s.trimPunc(imageNote.split(tagsRE)[1])
			} catch (err) {}

			imageTitle = s.trimPunc(imageNote.split(tagsRE)[0])

			let imageTags = []
			if (tagsRaw) {
				imageTags = tagsRaw.toLowerCase().replace(/^\s+/g, "").split(/[,;\s]+/)
			}
			let tagsToClean = []
			for (let i in imageTags) {
				let minusMatch = imageTags[i].match(/^-(.+)/)
				if (minusMatch) {
					tagsToClean.push(minusMatch[1])
				}
			}
			imageTags.unshift("screenshot", "minecraft")
			for (let i in tagsToClean) {
				s.removeElementsByValue(imageTags, tagsToClean[i], `-${tagsToClean[i]}`)
			}
			let imageTagsText = imageTags.map(x=>'"'+x+'"').join(', ')
		
			let imageJSON = `\`\`\`json\n\t"${imageID}": {\n\t\t"title": ${JSON.stringify(imageTitle)},\n\t\t"date": "${(imageDate) ? imageDate : customDate}",\n\t\t"takenBy": "${(takenBy) ? takenBy : msg.author.username}",\n\t\t"big": true,\n\t\t"tags": [${imageTagsText}]\n\t},\n\`\`\``
		
			client.channels.get("526441608250392577").send("От " + msg.author.tag + ":\n" + discordLink + imageLink + "\n" + imageJSON)
				.then(() => {
					msg.react("📮")
				})
				.catch(error => console.log(error))
		}
	},
	React: {
		r: /^([пpрr]|поставь|отреагируй|реакция|react(ion)?)$/,
		f (msg, args) {
			s.autoreact(msg, args, false) // функция вынесена, так как к ней нужен доступ и без команды
		}
	},
	EmojiList: {
		r: /^(э(мо(д[жз]|ж)и)?|смайл(ики|ы)|emoji(s|list)?)[.!]?$/,
		v: true,
		f (msg, args, msgSimplifiedOrigCase, usedArrowButton) {
			let defaultGuildId = "540145900526501899"
			let fromWhichServer = client.guilds.get(defaultGuildId)
			let askedServer = s.getGuild(args[0])
			let numberOfCurrentGuild = visibleServers.indexOf(defaultGuildId) + 1
		
			let goRight = false
			let goLeft = false
			if (args[0] == "+") {
				goRight = true
			} else if (args[0] == "-") {
				goLeft = true
			} else if (askedServer) {
				fromWhichServer = askedServer
				numberOfCurrentGuild = visibleServers.indexOf(askedServer.id) + 1
			}

			let possiblePrevId = msg.content.match(/(\d{17,20})\`$/)
		
			if (usedArrowButton && possiblePrevId) {
				let prevServer = possiblePrevId[1]
				let p = visibleServers.indexOf(prevServer)
				if (p > -1) {
					let n
					if (goRight) {
						n = p + 1
					} else if (goLeft) {
						n = p - 1
					}
					if (n < 0) {
						n = visibleServers.length - 1
					} else if (n >= visibleServers.length) {
						n = 0
					}
		
					numberOfCurrentGuild = n + 1
					fromWhichServer = client.guilds.get(visibleServers[n])
				}
			}
		
			let emServ = fromWhichServer
			if (emServ && emServ.emojis.size) {
				let embed = {
					color: 0xD4A940,
					fields: [
						{
							name: "1-1:",
							value: ""
						}
					],
					footer: {
						text: `📖 ${numberOfCurrentGuild}/${visibleServers.length}`
					}
				}
		
				let i = 0
				let f = 0
				let emojiDesc = "Доступные эмоджи:\n" + emServ.name + " `" + emServ.id + "`"
				let emojiList = []
		
				let fieldStart = 1
		
				emServ.emojis.forEach(key => {
					let prefix = "<:"
					let postfix = ">" + " `" + key.name + "`"
					if (key.animated) {
						prefix = "<a:"
					}
					if (++i % 10 == 1) {
						prefix = "\n" + prefix
					}
					let emojiInfo = prefix + key.name + ":" + key.id + postfix
					emojiList.push(emojiInfo)
					let emListText = emojiList.join(" ")
		
					if (f >= 6) {
						return
					} else if (emListText.length < 993) {
						embed.fields[f].name = fieldStart + "-" + i + ":"
						embed.fields[f].value = emListText
					} else {
						emojiList = []
						emojiList.push(emojiInfo)
						if (emojiInfo.length < 993) {
							fieldStart = i
							f++
							embed.fields[f] = {}
							embed.fields[f].name = fieldStart + "-" + i + ":"
							embed.fields[f].value = emojiInfo
						}
					}
				})
		
				if (usedArrowButton) {
					msg.edit(emojiDesc, {embed: embed})
				} else {
					msg.channel.send(emojiDesc, {embed: embed})
						.then((msg) => {
							msg.react("⬅")
								.then(() => {
									msg.react("➡")
								})
								.catch(error => console.log(error))
						})
						.catch(error => console.log(error))
				}
			}
		
			return
		}
	},
	Sticker: {
		r: /^(с(тикер)?|sticker|э(мо(д[жз]|ж)и)?линк|e(moji)?link)$/,
		v: true,
		async f (msg, args) {
			if (!args[0]) {
				msg.react("📜")
				return
			}
		
			let emoji
		
			if (args[0].match(/^\d+$/g) && client.emojis.get(args[0])) {
				emoji = client.emojis.get(args[0])
			} else {
				let emojiName = s.getEmojiName(args[0])
				let guildName
				let guildCheck
				if (guildCheck = emojiName.match(/^([^:]+)(?::(\S+))$/)) {
					emojiName = guildCheck[1]
					guildName = guildCheck[2]
				}
				emoji = s.findEmoji(emojiName, guildName)
			}
		
			if (!emoji) {
				msg.react("604015450304806952")
				return
			}

			let imageLink = `https://cdn.discordapp.com/emojis/${emoji.id}.${emoji.animated ? "gif" : "png"}`

			await s.getMainColorFromImage(imageLink, color => {
				msg.channel.send({
					embed: {
						color: color,
						description: `<${emoji.animated ? "a" : ""}:${emoji.name}:${emoji.id}> – ${emoji.name}`, 
						image: {
							url: imageLink
						}
					}
				})
			})
		}
	},
	Servers: {
		r: /^(сервер[аы]|servers)[.!]?$/,
		f (msg, args) {
			let embed = {
				color: 0x888888,
				description: ""
			}
		
			let showAllServers = false
			if (msg.author.id == OWNER_ID && args[0] == "all") {
				showAllServers = true
			}
		
			let serversArray = []
			let counter = 0
			client.guilds.forEach(key => {
				if (showAllServers || key.emojis.size) {
					counter++
					serversArray.push(key.id + " | " + key.name)
				}
			})
			serversArray.sort((a, b) => {
				return Number(a.split(" | ")[0]) - Number(b.split(" | ")[0])
			})
			embed.description += `\`\`\`${serversArray.join("\n")}\`\`\``
			embed.title = counter + " серверов"
		
			if (!showAllServers) {
				embed.title += " с эмоджи"
			}
		
			msg.author.send({embed: embed})
				.then(() => {
					s.envelope(msg)
				})
				.catch(error => console.log(error))
		}
	},
	Avatar: {
		r: /^(ав(атар(ка)?|к?а)|ava(tar)?|pfp)[.!]?$/,
		v: true,
		async f (msg, args, msgSimplifiedOrigCase) {
			let user
			if (args[0] == "random") {
				user = client.users.filter(u => u.avatar).random()
			} else if ( ["sb", "sbot", "сб", "сбот"].includes(args[0]) ) {
				user = client.users.get(BOT_ID)
			} else if (args[0]) {
				let username = s.getSimpleString(msgSimplifiedOrigCase.match(/\S+ (.+)/)[1])
				let result
				let usernameId
				// проверка на айди
				if (usernameId = username.match(/(?:<@\!?)?(\d+)>?/)) {
					await client.fetchUser(usernameId[1]).then(user => {
						result = user
					})
				// проверка на тег
				} else if (username.split("#")[1]) {
					client.users.forEach(u => {
						if (username == u.tag.toLowerCase()) {
							result = u
						}
					})
				} else {
					let isDisplayNameSuitable = false
					let isDisplayNameCanBeSuitable = false
			
					client.guilds.forEach(guild => {
						guild.members.forEach(member => {
							if (member.user.avatar) {
								if (username == s.getSimpleString(member.displayName)) {
									result = member.user
									isDisplayNameSuitable = true
								} else if (s.getSimpleString(member.displayName).startsWith(username)) {
									if (!isDisplayNameSuitable) {
										result = member.user
										isDisplayNameCanBeSuitable = true
									}
								} else if (member.nickname) {
									if (username == s.getSimpleString(member.user.username)) {
										if (!isDisplayNameSuitable && !isDisplayNameCanBeSuitable) {
											result = member.user
										}
									} else if (s.getSimpleString(member.user.username).startsWith(username)) {
										if (!result && !isDisplayNameSuitable && !isDisplayNameCanBeSuitable) {
											result = member.user
										}
									}
								}
							}
						})
					})		
				}
			
				user = result
			} else {
				user = msg.author
			}
		
			if (!(user && user.avatar)) {
				msg.react("604015450304806952")
				return
			}
		
			let fullSizeLink = user.avatarURL.split("?size=")[0] + "?size=2048"
		
			let link = user.avatarURL.split("?size=")[0] + "?size=128"

			await s.getMainColorFromImage(link, color => {
				msg.channel.send({embed: {
					color: color, 
					description: user.tag, 
					image: {
						url: fullSizeLink
					}
				}})
			})

		}
	},
	Invite: {
		r: /^(приглашение|инвайт|invite)[.!]?$/,
		f (msg) {
			msg.author.send("Ты можешь пустить меня на свой сервер с помощью этой ссылки: \n<https://discordapp.com/api/oauth2/authorize?client_id=" + BOT_ID + "&scope=bot&permissions=0>")
				.then(() => {
					s.envelope(msg)
				})
				.catch(error => console.log(error))
		}
	},
	Homestuck: {
		r: /^(hs|хс|хоумстак|homestuck)[.!]?$/,
		v: true,
		async f (msg, args, msgSimplifiedOrigCase, usedArrowButton) {
			let page_number
			let contentText = ""

			let domain = 'https://www.homestuck.com'
			let hs_part_mark = "hs#"
			let text_location = "p.type-rg"
		
			let num = Number(args[0])

			if (args[0]) {
				if (num >= 1 && num <= 8130) {
					page_number = args[0]
				} else if (num > 8130) {
					page_number = num % 8130
				} else {
					return
				}
			} else {
				page_number = 1
			}

			if (args[1] == "2" || num > 8130) {
				domain = 'https://www.homestuck2.com'
				hs_part_mark = "hs2#"
				text_location = 'div.type-rg'
			}
		
			let page_link = domain + '/story/' + page_number
			let comic_number = hs_part_mark + page_number
			let got_error_already = false
			let embed_color = 0x249E28
		
			let comic_embed = {
				color: embed_color,
				author: {
					url: page_link,
					name: comic_number
				}
			}
		
			try {
				let hs = await got(page_link, {
					headers: {
						"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:62.0) Gecko/20100101 Firefox/62.0"
					}
				})
		
				let $ = Cheerio.load(hs.body)
		
				let content_container = $('div#content_container')
				let flash_div = $('div#o_flash-container')
		
				// detecting video
				let is_there_video = false
				let yt_link = ""
				let yt_link_code
		
				if (flash_div.length) {
					let yt_raw = flash_div.html().match(/\'youtubeid\', \'(.+)\'/)
					if (yt_raw) {
						yt_link_code = yt_raw[1]
					}
				} else {
					let yt_raw = $('iframe.ar-inner').attr('src')
					if (yt_raw) {
						yt_link_code = yt_raw.match(/embed\/(.+)/)[1]
					}
				}
				if (yt_link_code) {
					yt_link = `https://youtu.be/${yt_link_code}`
					is_there_video = true
				}
		
		
				if (is_there_video) {
					// send title, desc and video link
					comic_embed = {}
					contentText = comic_number + "\n" + yt_link
				} else {
					// getting title
					let comic_title = $('h2.type-hs-header').text()
					if (comic_title && !is_there_video) {
						comic_title = `${comic_title} (${comic_number})`
					} else {
						comic_title = comic_number
					}
					comic_embed.author.name = comic_title
		
					// getting description
					let desc = $(text_location).text().replace(/\ +/g, " ").replace(/^\s+/, "").replace(/\s+$/, "")
					let desc_limit = 2047
					if (desc.length > desc_limit) {
						desc = desc.substring(0, desc_limit) + "…"
					} else if (desc.length == 0) {
						desc = ""
					}
					comic_embed.description = desc
		
					// getting images
					let imgs
					let img_link = ""
					let is_img_from_flash = false
					if (content_container.length) {
						imgs = content_container.find('img.mar-x-auto.disp-bl')
						if (!imgs.length) {
							let imgs_raw = $('div.bg-scratch-mid-green.pad-t-lg').find('img')
							if (imgs_raw.length) {
								imgs = imgs_raw.attr('src')
								is_img_from_flash = true
							}
						}
					} else {
						imgs = $('img.mar-x-auto.disp-bl')
					}
					if (flash_div.length && !imgs.length) {
						let imgs_raw = flash_div.html().match(/\'altimgsrc\', \'(.+)\'/)
						if (imgs_raw) {
							imgs = imgs_raw[1]
							is_img_from_flash = true
						}
					}
					if (imgs.length) {
						// send title, image and desc
						if (is_img_from_flash) {
							img_link = `${domain}${imgs}`
						} else if (imgs.attr('src').startsWith("/")) {
							img_link = `${domain}${imgs.attr('src')}`
						} else {
							img_link = imgs.attr('src')
						}
		
						comic_embed.image = {url: img_link}
					} else {
						// send title and footer
						comic_embed.footer = {text: "It's probably interactive."}
					}
				}
			} catch (err) {
				if (err.statusCode === 404) {
					comic_embed.footer = {text: "It's probably missing page."}
				}
			}
			
			let embed = {embed: comic_embed}
			if (usedArrowButton) {
				if (contentText) {
					msg.edit(contentText, embed)
				} else {
					msg.edit(embed)
				}
			} else {
				let contentToSend = (contentText) ? contentText : embed
				msg.channel.send(contentToSend).then((msg) => {
					msg.react("⬅").then(() => {
						msg.react("➡").then(() => {
							msg.react("🔃")
						})
						.catch(error => console.log(error))
					})
					.catch(error => console.log(error))
				})
				.catch(error => console.log(error))
			}

		}
	},
	SnowflakeTime: {
		r: /^(снежинк[аи]|sftime)[.!]?$/,
		f (msg, args) {
			let totalSFTimes = []
			args.forEach(arg => {
				if (arg.match(/\d{17,20}/)) {
					let totalMatches = arg.match(/\d{17,20}/g)
					for (let i in totalMatches) {
						let d = new Date(1420070400000 + Number(totalMatches[i]) / 4194304)
						if (!d.toJSON) {
							d = new Date(d)
						}
						d.setHours(d.getHours() + 3)
						totalSFTimes.push(`${d.toJSON().split(".")[0].replace(/T/, ' ')} МСК`)
					}
				}
			})
			if (totalSFTimes) {
				msg.channel.send(totalSFTimes.join("\n"))
			}
		}
	},
	Stats: {
		r: /^(stats|статы|статистика|ап(тайм)?|up(time)?)[.!]?$/,
		v: true,
		f (msg) {
			let uptimeResult
			let u = client.uptime
			if (u > 1000) {
				let diff = u
				let tarr = [1000, 60, 60, 24]
				for (let i in tarr) {
					let x = tarr[i]
					tarr[i] = diff % x
					diff = (diff - tarr[i]) / x
				}
				tarr.push(diff)
				tarr.shift()
				let warr = [
					['секунду', 'секунды', 'секунд'],
					['минуту', 'минуты', 'минут'],
					['час', 'часа', 'часов'],
					['день', 'дня', 'дней'],
				]
				let sarr = []
				for (let i = tarr.length - 1; i >= 0; i--) {
					if (!tarr[i]) {
						continue
					}
					sarr.push(tarr[i] + ' ' + s.pluralize(tarr[i], warr[i]))
				}
				uptimeResult = `Я работаю уже ${sarr.join(', ')}.`
			} else {
				uptimeResult = `Я только зашёл.`
			}

			let subData = JSON.parse(fs.readFileSync('cinemadata.json'))
		
			const statsEmbed = {
				color: 0x888888,
				title: "Статистика",
				description: uptimeResult,
				footer: {
					text: `${process.env.npm_package_version} | 🗄 ${client.guilds.size} | 😶 ${client.emojis.size} | 👥 ${client.users.size} | 📽️ ${subData["565291444705689612"].users.length} | ⛩️ ${subData["577130367304204288"].users.length}`
				}
			}
		
			msg.channel.send({embed: statsEmbed})
		}
	},
	When: {
		r: /^(когда)[.!]?$/,
		v: true,
		f (msg, args, msgSimplifiedOrigCase) {
			if (!args[0]) {
				return
			}
		
			let questionOriginal = msgSimplifiedOrigCase.match(/\S+ ([\s\S]+)/)[1].replace(/[.!?]+$/, "")
			let question = s.getSimpleString(questionOriginal)
		
			let epochStart = 17999
			let epochEnd = 65573
			let T = epochEnd - epochStart
		
			let days = Math.floor(Math.pow(((s.hashCode(question) % T) / T), 6) * T) + epochStart
			if (question.match(/(железн(ая|ой|ую) двер(ь|и)|конец света|армагеддон|апокалипсис)/)) {
				days = epochEnd
			}
		
			let whenEmbed = {
				title: "Когда " + questionOriginal + "?",
			}
		
			let dateOptions = {year: "numeric", month: "long", day: "numeric"}
			let dateText
		
			if (days == epochStart) {
				dateText = "Сегодня."
			} else if (days == epochStart + 1) {
				dateText = "Завтра."
			} else if (days > epochEnd - 1000 && days < epochEnd) {
				dateText = "Никогда."
			} else if (question == "когда") {
				dateText = "Тогда."
			} else {
				dateText = new Intl.DateTimeFormat("ru", dateOptions).format(new Date(days*86400*1000))
			}
			whenEmbed.description = "🗓 " + dateText
		
			msg.channel.send({embed: whenEmbed})
		}
	},
	IronDoor: {
		r: /^(железнаядверь|жд)[.!]?$/,
		v: true,
		f (msg, args) {
			if (!args[0]) {
				return
			}
		
			let possibleAnswers = [
				"Бесспорно.", 
				"Определённо, да.",
				"Без сомнения.",
				"Конечно.",
		
				"Думаю, да.",
				"Наверное.",
				"Вполне вероятно.",
				"Возможно, так и есть.",
				"А сам как думаешь?",
		
				"ХЗ, вообще.",
				"Вселенная не может подсказать мне сейчас.",
				"Неясно.",
				"Попробуй сформулировать вопрос по-другому.",
				"Может быть.",
				"Не могу сейчас сказать точно.",
				"Попробуй подумать сам.",
				"Что за странный вопрос?",
				"Не могу сказать сейчас.",
				"Лучше бы тебе не знать об этом.",
				"Откуда мне знать?",
				"50 на 50.",
		
				"Скорее всего, нет.",
				"Да вряд ли.",
				"Маловероятно.",
				"Вероятность - околонулевая.",
		
				"Конечно, нет.",
				"Мои источники говорят: \"нет\".",
				"Вероятность - нулевая.",
				"Вселенная так не думает."
			]
		
			let embed = {
				author: {
					name: s.getRandomElem(possibleAnswers),
					icon_url: "https://i.imgur.com/P8IAywM.png"
				}
			}
		
			msg.channel.send({embed: embed})
		}
	},
	Three: {
		r: /^-?(\d)[.!]?$/,
		v: true,
		f (msg, args, msgSimplifiedOrigCase) {
			if (!args[0]) {
				args.unshift(msg.content.split(/\s+/).slice(-1)[0])
				s.autoreact(msg, args, false)
				return
			}
		
			let num = parseInt(msgSimplifiedOrigCase.split(" ")[0])
		
			if (!num && num !== 0) {
				return
			} else if (num > 7) {
				num = 7
			} else if (num < 1) {
				msg.channel.send("No emoji for you!")
				return
			}
		
			let emojiName = s.getEmojiName(args[0])
			let guildName
			let guildCheck
		
			if (guildCheck = emojiName.match(/^([^:]+)(?::(\S+))$/)) {
				emojiName = guildCheck[1]
				guildName = guildCheck[2]
			}
		
			let emoji = s.findEmoji(emojiName, guildName)
		
			if (!emoji) {
				msg.react('604015450304806952')
				return
			}

			let prefix = "<:"
			let postfix = "> "
			if (emoji.animated) {
				prefix = "<a:"
			}
		
			let e = prefix + emoji.name + ":" + emoji.id + postfix
			
			msg.channel.send(e.repeat(num))
		}
	},
	Rtfm: {
		r: /^(rtfm|man|docs?)[.!]?$/,
		async f (msg, args, msgSimplifiedOrigCase) {
			if (!args[0] || !args[1]) {
				msg.channel.send("Укажите в команде, какие доки вам нужны (js, py, jda) и какой метод/событие ищите.")
				return
			}
		
			let lang = args[0]
			let query = msgSimplifiedOrigCase.split(" ")[2]
		
			let [, docsClass, docsMethod] = query.match(/^(\w+)(?:\.([\w\.]+))?/)
			docsClass = docsClass[0].toUpperCase() + docsClass.slice(1);
		
			let link
		
			if (["js", "javascript", "node", "nodejs", "discord.js"].includes(lang)) {
				link = `https://discord.js.org/#/docs/main/stable/class/${docsClass}`
				if (docsMethod) link += `?scrollTo=${docsMethod}`
			} else if (["py", "python", "discord.py"].includes(lang)) {
				if (docsClass.toLowerCase() == "commands") {
					link = `https://discordpy.readthedocs.io/en/latest/ext/commands/api.html#discord.ext.commands`
				} else if (docsClass.toLowerCase() == "tasks") {
					link = `https://discordpy.readthedocs.io/en/latest/ext/tasks/index.html#discord.ext.tasks`
				} else {
					link = `https://discordpy.readthedocs.io/en/latest/api.html#discord.${docsClass}`
				}
				if (docsMethod) link += `.${docsMethod}`
			} else if (["java", "jda"].includes(lang)) {
				let queryParts = query.split(".")
				if ( !["annotations", "bot", "core", "client", "webhook"].includes(queryParts[0]) ) {
					queryParts.unshift("core", "events")
				}
				let possibleEvent = queryParts[queryParts.length - 1]
				if (possibleEvent[0] == possibleEvent[0].toUpperCase() || possibleEvent.toLowerCase().endsWith("event")) {
					queryParts[queryParts.length - 1] = possibleEvent[0].toUpperCase() + possibleEvent.slice(1);
				} else {
					queryParts.push("package-summary")
				}
				for (let i = 0; i < queryParts.length - 1; i++) {
					queryParts[i] = queryParts[i].toLowerCase()
				}
		
				link = `https://ci.dv8tion.net/job/JDA/javadoc/net/dv8tion/jda/${queryParts.join("/")}.html`
			}
		
			try {
				await got(link).then(response => {
					let linkPartsPy = link.split("#")
					if (lang == "py" && linkPartsPy[1]) {
						if (!response.body.includes(`id=\"${linkPartsPy[1]}\"`)) throw "NotFoundError"
					} 
				})
				if (lang == "js") {
					await got("https://raw.githubusercontent.com/discordjs/discord.js/docs/stable.json").then(response => {
						if (!response.body.includes(`"path":"src/structures"}},{"name":"${docsClass}"`)) throw "NotFoundError"
						if (docsMethod) {
							if (!response.body.includes(`"path":"src/structures"}},{"name":"${docsMethod}"`)) throw "NotFoundError"
						}
					})
				}
				msg.channel.send(`📜 <${link}>`)
			} catch (err) {
				msg.channel.send(`Документации на такое нет...`)
			}
			
		}
	},
	Palette: {
		r: /^(палитра|palette)[.!]?$/,
		v: true,
		async f (msg) {
			if (!msg.attachments.size) {
				msg.channel.send("Нужно прикрепить картинку к сообщению!")
				return
			}
			msg.attachments.forEach(async (att) => {
				let max = 128
				let w = max
				let h = max
				if (att.width > att.height) {
					h = Math.round(att.height / (att.width / max))
				} else {
					w = Math.round(att.width / (att.height / max))
				}
				let imagePreview = `https://media.discordapp.net/attachments/${msg.channel.id}/${att.id}/${att.filename}?width=${w}&height=${h}`

				await s.getMainColorFromImage(imagePreview, (color, palette) => {
					let hexColors = []

					let canvasW = 350
					let canvasH = 50
					let segmentW = Math.round(canvasW / palette.length) * 2
					let segmentH = Math.round(canvasH / 2)

					const canvas = Canvas.createCanvas(canvasW, canvasH)
					const ctx = canvas.getContext('2d')
					for (let i = 0; i < palette.length; i++) {
						let hex = palette[i].toString(16)
						let tempHex = `00000${hex}`
						hex = `#${tempHex.slice(-6)}`
						hexColors.push(hex)
						let x = i % 5
						let y = Math.floor(i / 5)
						ctx.fillStyle = hex
						ctx.fillRect(segmentW*x, segmentH*y, segmentW, segmentH)
					}
					const buf = canvas.toBuffer('image/png')

					msg.channel.send(`\`\`\`${hexColors.slice(0,5).join(" ")}\n${hexColors.slice(5,10).join(" ")}\`\`\``, {
						files: [{
							attachment: buf,
							name: "palette.png"
						}]
					})
				})
			})

		}
	},
	Recolor: {
		r: /^(реколор|recolor)[.!]?$/,
		v: true,
		async f (msg, args) {
			if (!args.length) {
				msg.channel.send("Нужно указать цвета! Например, `#d51a24 #7ca4af #f8dfa8 #05324a`")
				return
			}
			if (!msg.attachments.size) {
				msg.channel.send("Нужно прикрепить картинку к сообщению!")
				return
			}
			let pal = []
			for (let i = 0; i < args.length; i++) {
				pal.push(parseInt(args[i].slice(-6), 16)*256 + 255)
			}
			msg.attachments.forEach(async (att) => {
				let max = 1024
				let w = max
				let h = max
				if (att.width > att.height) {
					h = Math.round(att.height / (att.width / max))
				} else {
					w = Math.round(att.width / (att.height / max))
				}
				let imagePreview = `https://media.discordapp.net/attachments/${msg.channel.id}/${att.id}/${att.filename}?width=${w}&height=${h}`

				await s.recolorByPalette(imagePreview, pal, buf => {
					msg.channel.send({
						files: [{
							attachment: buf,
							name: "recolored.png"
						}]
					})
				})
			})

		}
	},
	Kana: {
		r: /^(kana|кана)[.!]?$/,
		v: true,
		async f (msg, args) {
			let k = hiragana
			if (["katakana", "катакана"].includes(args[0])) {
				k = katakana
			}

			let firstQuestion = true
			let botMessage
			let isGameRunning = true

			let score = 0
			let rounds = 0
			let wrongMap = []

			let secondsToWait = 15
			if (args[1] && Number(args[1])) {
				secondsToWait = Number(args[1])
			}

			let buttons = ["1️⃣", "2️⃣", "3️⃣", "4️⃣"]
			const filter = (reaction, user) => buttons.includes(reaction.emoji.name) && user.id == msg.author.id;
			
			while (isGameRunning) {

				let con = Math.floor(k.syl.length*Math.random())
				let vow = Math.floor(k.syl[con].length*Math.random())

				let res = k.syl[con][vow]

				let pos = Math.floor(4*Math.random())

				let crow = [...kanalat[con]]
				let reslat = crow[vow]

				let opts = crow
				opts.splice(vow, 1)
				opts = s.shuffle(opts).slice(0,3)
				
				opts.splice(pos, 0, reslat)

				const embed = {
					title: res,
					description: `${opts.join(" ").toUpperCase()} \n\nУ вас ${secondsToWait} секунд!\n[Шпаргалка](https://docs.google.com/spreadsheets/d/1GdpF_ameYIvhFTT2Ji_MNisDS7qCLENoxMllR59q6Zg/edit?usp=drivesdk)`,
					footer: {
						icon_url: msg.author.avatarURL,
						text: `${msg.author.tag} - ${score}/${rounds}`
					}
				}
				
				if (firstQuestion) {
					await msg.channel.send({embed: embed}).then(async (m) => {
						firstQuestion = false
						botMessage = m

						for (let i = 0; i < 4; i++) {
							await m.react(buttons[i])
						}
					})
					.catch(error => console.log(error))
				} else {
					await botMessage.edit({embed: embed})
				}
				
				await botMessage.awaitReactions(filter, { max: 1, time: secondsToWait*1000 })
					.then(collected => {
						const reaction = collected.first()
						if (botMessage.channel.type == "text" && botMessage.member.hasPermission('MANAGE_MESSAGES')) {
							reaction.remove(msg.author.id)
						}
						if (buttons.indexOf(reaction.emoji.name) == pos) {
							score++
						} else {
							wrongMap[con] = []
							wrongMap[con][vow] = true
						}
					})
					.catch(collected => {
						isGameRunning = false
						let wrongGuesses = []
						for (let i = 0; i < wrongMap.length; i++) {
							if (wrongMap[i]) {
								for (let j = 0; j < wrongMap[i].length; j++) {
									if (wrongMap[i][j]) {
										wrongGuesses.push(`${k.syl[i][j]} ||${kanalat[i][j]}||`)
									}
								}
							}
						}
						let gameoverText = "Время вышло!"
						if (wrongGuesses.length) {
							gameoverText += ` \nПодучить: ${wrongGuesses.join(" ")}`
						}
						msg.reply(gameoverText)
					});

				rounds++
			}	

		}
	},
	Jwords: {
		r: /^(jwords|jlpt|kanji|кан(д?[жз])и)[.!]?$/,
		v: true,
		async f (msg, args) {

			let isGameRunning = true
			if (msg.channel.type == "dm") {
				userDB[msg.author.id].learningKanji = true
			}

			let firstQuestion = true
			let botMessage
			let userAnswerMessage
			let gameChannel = msg.channel

			let messageForPreviousGuess = 'Let\'s begin!'

			let score = 0
			let rounds = 0
			let wrongSet = new Set()

			let secondsToWait = 15
			if (args[0] && Number(args[0])) {
				secondsToWait = Number(args[0])
			}

			const filter = (m) => m.author.id == msg.author.id;

			let userPath = `jap_users/${msg.author.id}.json`
			let userData
			if (fs.existsSync(userPath)) {
				userData = JSON.parse(fs.readFileSync(`jap_users/${msg.author.id}.json`))
			} else {
				userData = {
					"studied": [],
					"problemed": {}
				}
			}

			let studied = new Set(userData.studied)

			while (isGameRunning) {

				let num
				let probArr = Object.keys(userData.problemed)

				if (!probArr.length || (studied.size + probArr.length) % 5) {
					num = Math.floor(Math.random() * kanji.length)
				} else {
					if (Math.random() > 0.2 || !studied.size) {
						num = s.getRandomElem(probArr)
					} else {
						num = s.getRandomElem(Array.from(studied))
					}
				}

				let k = kanji[num]

				let hir = [...hiragana.syl]
				hir.push('ゃゅょ')
				let kat = [...katakana.syl]
				kat.push('ャュョ')
				let lat = [...kanalat]
				lat.push(['ya', 'yu', 'yo'])

				let romaji = []

				for (let i = 0; i < k.r.length; i++) {
					let rvar = k.r[i]
					let rvarRomaji = ''
					let tsuRepeating = false
					for (let j = 0; j < rvar.length; j++) {
						if (['っ', 'ッ'].includes(rvar[j])) {
							tsuRepeating = true
							continue;
						}
						if (rvar[j] == 'ー') {
							rvarRomaji += rvarRomaji.slice(-1)
							continue;
						}
						for (let x = 0; x < hir.length; x++) {
							for (let y = 0; y < hir[x].length; y++) {
								if ([hir[x][y], kat[x][y]].includes(rvar[j])) {
									if (tsuRepeating) {
										rvarRomaji += lat[x][y][0]
										tsuRepeating = false
									}
									if (x == hir.length - 1) { // check if it's lowered vowel
										if (rvarRomaji.slice(-1) != 'n') {
											rvarRomaji = rvarRomaji.slice(0, -1)
										}
										if (rvarRomaji.match(/(sh|ch|j)$/)) {
											rvarRomaji += lat[x][y][1]
										} else {
											rvarRomaji += lat[x][y]
										}
									} else {
										rvarRomaji += lat[x][y]
									}
								}
							}
						}
					}
					romaji.push(rvarRomaji)
				}

				// canvas start

				const canvas = Canvas.createCanvas(k.s.length*160+40, 200)
				const ctx = canvas.getContext('2d')
	
				let { body: imageInfo } = await got(`https://neko-love.xyz/api/v1/neko`, { json: true })
				if (imageInfo.error) throw Error(imageInfo.error)
				const bg = await Canvas.loadImage(imageInfo.url)
	
				const bgw = bg.width
				const bgh = bg.height
				const canw = canvas.width
				const canh = canvas.height
	
				const bgRatio = bgw/bgh
				const canvasRatio = canw/canh
	
				if (bgRatio < canvasRatio) {
					ctx.drawImage(bg, 0, (bgh-bgw/canvasRatio)/2, bgw, bgw/canvasRatio, 0, 0, canw, canh)
				} else {
					ctx.drawImage(bg, (bgw-bgh*canvasRatio)/2, 0, bgh*canvasRatio, bgh, 0, 0, canw, canh)
				}
				
	
				ctx.font = `160px "KosugiMaru"`
				ctx.textAlign = "center"
				ctx.textBaseline = "middle"
				ctx.fillStyle = 'rgba(114, 137, 218, 0.3)';
				ctx.fillRect(0, 0, canw, canh);
				ctx.fillStyle = 'white'
				ctx.fillText(k.s, canw/2, canh/2)
				ctx.strokeStyle = 'black';
				ctx.lineWidth = 1;
				ctx.strokeText(k.s, canw/2, canh/2);
				const buf = canvas.toBuffer('image/png')
				
				// canvas end

				const embed = {
					title: messageForPreviousGuess,
					description: `You have ${secondsToWait} seconds!\n[jisho](https://jisho.org/search/%23kanji%20${k.s}) \n\n||\` ${k.r.join(", ")}, ${k.m[0]} \`||  `,
					image: {
						url: 'attachment://neko.png'
					},
					footer: {
						icon_url: msg.author.avatarURL,
						text: `${msg.author.tag} - ${score}/${rounds}`
					}
				}

				let botmsgToDelete = botMessage
				await gameChannel.send({
					embed: embed,
					files: [{
						attachment: buf,
						name: 'neko.png'
					}]
				}).then(async (m) => {
					botMessage = m
					gameChannel.stopTyping()
				})
				.catch(error => console.log(error))

				if (!firstQuestion && s.deleteUserMessage(userAnswerMessage, 0)) {
					await botmsgToDelete.delete()
				} else {
					firstQuestion = false
				}
				
				await gameChannel.awaitMessages(filter, { max: 1, time: secondsToWait*1000 })
					.then(collected => {
						gameChannel.startTyping()
						const m = collected.first()
						userAnswerMessage = m
						if (k.r.includes(m.content) || romaji.includes(m.content) || k.m.includes(m.content)) {
							score++
							messageForPreviousGuess = `Right!`

							if (!studied.has(num)) {
								let p = userData.problemed[num]

								p = (p) ? ++p : 1
								
								if (p == 7) {
									studied.add(num)
									delete userData.problemed[num]
								} else {
									userData.problemed[num] = p
								}
							}
							
						} else {
							wrongSet.add(k.s)
							messageForPreviousGuess = `Nope.`

							userData.problemed[num] = 0
							studied.delete(num)
						}
					})
					.catch(collected => {
						isGameRunning = false
						userDB[msg.author.id].learningKanji = false
						const gameoverEmbed = {
							title: "Time's up!"
						}
						if (rounds) {
							gameoverEmbed.description = `Result: ${(score/rounds*100).toFixed(2)}%`
							if (wrongSet.size) {
								gameoverEmbed.description += ` \nTo learn: ${Array.from(wrongSet).map(x=>'['+x+']'+'(https://jisho.org/search/%23kanji%20'+x+')').join("　")}`
							}
						}

						msg.reply({embed: gameoverEmbed})

						userData.studied = Array.from(studied)
						fs.writeFile(userPath, JSON.stringify(userData, null, 2), err => {
							if (err) {
								console.log("error on writing to file!")
							}
						})
					});

				rounds++
			}	

		}
	},
	Sub: {
		r: /^((un)?sub|(ан)?саб)[.!]?$/,
		v: false,
		async f (msg, args, msgSimplifiedOrigCase) {
			if (!args[0]) {
				return
			}
			let isUserSubbing = true
			if (msgSimplifiedOrigCase.match(/^(unsub|ансаб)/)) {
				isUserSubbing = false
			}
			let subTarget
			switch (args[0]) {
				case "кино":
				case "kino":
					subTarget = "565291444705689612"
					break;
				case "аниме":
				case "anime":
					subTarget = "577130367304204288"
					break;
				default:
					break;
			}
			let data = JSON.parse(fs.readFileSync('cinemadata.json'))
			let users = new Set(data[subTarget].users)
			let subName = data[subTarget].name
			let uid = msg.author.id
			if (isUserSubbing) {
				if (users.has(uid)) {
					msg.reply(`Вы уже подписаны на ${subName}!`)
				} else {
					users.add(uid)
					data[subTarget].users = Array.from(users)
					fs.writeFile("cinemadata.json", JSON.stringify(data, null, 2), err => {
						if (!err) {
							msg.reply(`Теперь вы подписаны на ${subName}!`)
						}
					})
				}
			} else {
				if (!users.has(uid)) {
					msg.reply(`Вы и так не подписаны на ${subName}!`)
				} else {
					users.delete(uid)
					data[subTarget].users = Array.from(users)
					fs.writeFile("cinemadata.json", JSON.stringify(data, null, 2), err => {
						if (!err) {
							msg.reply(`Теперь вы отписаны от ${subName}!`)
						}
					})
				}
			}
		}
	}
}
