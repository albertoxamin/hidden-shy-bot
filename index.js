const Telegraf = require('telegraf')
var { Telegram, Markup } = require('telegraf')
const crypto = require('crypto')

var config

config = {
	token: '767345631:AAFnaUU7ZiXER-5pykfduhrrGrnBYmkvOOo'
}

const telegram = new Telegram(config.token, null)
const bot = new Telegraf(config.token)

const readKeyboard = (text) => Markup.inlineKeyboard(
	[Markup.callbackButton('Read', text)]
).extra()

bot.on('callback_query', (ctx) => ctx.answerCbQuery(ctx.callbackQuery.data, true))

bot.on('inline_query', async ({ inlineQuery, answerInlineQuery }) => {
	let message = inlineQuery.query
	if (message.length === 0)
		return
	if (Buffer.byteLength(message, 'utf8') > 64)
		return answerInlineQuery([], {
			switch_pm_text: 'Message can\'t exceed 64 bytes',
			switch_pm_parameter: 'split'
		})
	let result = ['❓', '❗️', '❤️', '😏', '😅', '█'].map(function (x) {
		let text = (x !== '█') ? x : message.replace(/[^ ]/g, x)
		return {
			type: 'article',
			id: crypto.createHash('md5').update(message + x).digest('hex'),
			title: text,
			input_message_content: {
				message_text: text,
				parse_mode: 'Markdown'
			},
			reply_markup: Markup.inlineKeyboard(
				[Markup.callbackButton('Read', message)]
			)
		}
	})
	return answerInlineQuery(result)
})

bot.catch((err) => console.log('Ooops', err))

const start = () => bot.startPolling(30, 100, null, start)
start()