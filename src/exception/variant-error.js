//@flow

import { DescriptionError, SanitizeError } from "."
import type { Description } from "../types"

export default class VariantError extends DescriptionError {
	errors: Array<SanitizeError>

	constructor(description: Description, property: any, errors: Array<SanitizeError>) {
		super(description, property)
		this.errors = errors
	}

	get_message() {
		let message = "No Variant match:\n"
		for(const error of this.errors) {
			message += `\t- ${ error.get_message() }\n`
		}
		return message
	}
}
