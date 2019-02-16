//@flow

import { Exception as Base, DescriptionError } from "."

export default class SanitizeError extends Base {
	error: DescriptionError

	constructor(error: DescriptionError) {
		super()
		this.error = error
	}

	get_message() {
		let message = "Sanitization Error occured:\n"
		message += " - " + this.error.get_message() + "\n"
		return message
	}
}
