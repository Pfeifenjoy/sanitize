//@flow

import { Exception as Base, DescriptionError } from "."

export default class SanitizeError extends Base {
	key_chain: Array<string>
	object: any
	error: DescriptionError

	constructor(object: any, error: DescriptionError) {
		super()
		this.object = object
		this.error = error
		this.key_chain = [ ]
	}

	add_key(key: string) {
		this.key_chain.push(key)
	}

	get_message() {
		let message = `Sanitize Error in ${ this.key_chain.join(".") }:\n`
		message += " - " + this.error.get_message() + "\n"
		message += "Object:\n" + JSON.stringify(this.object)
		return message
	}
}
