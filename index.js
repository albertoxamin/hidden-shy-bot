const Telegraf = require('telegraf')
var { Telegram, Markup } = require('telegraf')
const crypto = require('crypto')

var config

config = {
	token: '767345631:AAFnaUU7ZiXER-5pykfduhrrGrnBYmkvOOo'
}

const telegram = new Telegram(config.token, null)
const bot = new Telegraf(config.token)

const readKeyboard = (text) => {
	return Markup.inlineKeyboard(
		[Markup.callbackButton('Read', text)]
	).extra()
}


bot.on('callback_query', (ctx) => {
	let data = ctx.callbackQuery.data
	ctx.answerCbQuery(data, true)
})


bot.on('inline_query', async ({ inlineQuery, answerInlineQuery }) => {
	let message = inlineQuery.query
	let result = ['❓', '❗️', '❤️', '😏', '😅', '█'].map(function (x) {
		let text = (x !== '█') ? message : message.replace(/./g, x)
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

bot.catch((err) => {
	console.log('Ooops', err)
})

// bot.startPolling()

bot.launch({
	webhook: {
	  domain: 'http://162.218.211.142:5000',
	  port: 5000
	}
  })