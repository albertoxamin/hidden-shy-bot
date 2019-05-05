const Telegraf = require('telegraf')
var { Telegram, Markup } = require('telegraf')
const crypto = require('crypto')
require('dotenv').config()
const config = {
	token: process.env.TG
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
	let usesRot = message.indexOf('@rot13') === 0
	if (usesRot)
		message = message.substring(7)
	if (message.length === 0)
		return answerInlineQuery([], {
			switch_pm_text: 'Type something to send a hidden message',
			switch_pm_parameter: 'split'
		})
	let result = (usesRot || message.length > 256) ? [] : ['❓', '❗️', '❤️', '😏', '😅'].map(function (x) {
		let text = (x !== '█') ? x : message.replace(/[^ ]/g, x)
		let i = 0
		return {
			type: 'article',
			id: crypto.createHash('md5').update(message + x).digest('hex'),
			title: x === '█' ? 'Spoiler' : x,
			description: x === '█' ? text : '',
			input_message_content: {
				message_text: text,
				parse_mode: 'Markdown'
			},
			reply_markup: (Buffer.byteLength(message, 'utf8') > 64 ? Markup.inlineKeyboard(message.match(/.{1,64}/g).map(x => [Markup.callbackButton('Read pt.' + ++i, x)])) : Markup.inlineKeyboard([Markup.callbackButton('Read' + (x === '█' ? ' Spoiler' : ''), message)]))
		}
	})
	if (message.length <= 250) {
		let rot13 = message.replace(/[a-zA-Z]/g, function (c) { return String.fromCharCode((c <= "Z" ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26) })
		result.push({
			type: 'article',
			id: crypto.createHash('md5').update(message + '_rot13').digest('hex'),
			title: 'rot13',
			description: rot13,
			input_message_content: {
				message_text: rot13,
				parse_mode: 'Markdown'
			},
			reply_markup: Markup.inlineKeyboard(
				[usesRot ? Markup.callbackButton('Delete', '__delete') : Markup.switchToCurrentChatButton('Decypher', '@rot13 ' + rot13)]
			)
		})
	}
	return answerInlineQuery(result, (message.length > 250 ? {
		switch_pm_text: 'Message too long!',
		switch_pm_parameter: 'split'
	} : {}))
})

bot.catch((err) => console.log('Ooops', err))

const start = () => bot.startPolling(30, 100, null, start)
start()