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

bot.action('__delete', (ctx) => {
	if (ctx.callbackQuery.data.indexOf('__delete') !== -1)
		ctx.editMessageCaption('[[ seen and deleted ]]')
})

bot.on('callback_query', (ctx) => {
	ctx.answerCbQuery(ctx.callbackQuery.data, true)
})

bot.on('inline_query', async ({ inlineQuery, answerInlineQuery }) => {
	let message = inlineQuery.query
	if (message.indexOf('@rot13') === 0)
		message = message.substring(7)
	if (message.length === 0)
		return answerInlineQuery([], {
			switch_pm_text: 'Type something to send a hidden message',
			switch_pm_parameter: 'split'
		})
	if (message.length > 250)
		return answerInlineQuery([], {
			switch_pm_text: 'Message too long',
			switch_pm_parameter: 'split'
		})
	let result = (Buffer.byteLength(message, 'utf8') > 64 || message.indexOf('@rot13') === 0) ? [] : ['❓', '❗️', '❤️', '😏', '😅', '█'].map(function (x) {
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
	let rot13 = message.replace(/[a-zA-Z]/g, function (c) { return String.fromCharCode((c <= "Z" ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26) })
	result.push({
		type: 'article',
		id: crypto.createHash('md5').update(message + '_rot13').digest('hex'),
		title: rot13,
		input_message_content: {
			message_text: rot13,
			parse_mode: 'Markdown'
		},
		reply_markup: Markup.inlineKeyboard(
			[Markup.switchToCurrentChatButton('Decypher', '@rot13 ' + rot13), Markup.callbackButton('Delete', '__delete')]
		)
	})
	return answerInlineQuery(result)
})

bot.catch((err) => console.log('Ooops', err))

const start = () => bot.startPolling(30, 100, null, start)
start()