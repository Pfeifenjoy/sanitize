//@flow

import { DescriptionError } from "."

export default class UnexpectedType extends DescriptionError {
	get_message() {
		return `Unexpected Type "${ typeof this.property }"`
		+ ` -> Expected "${ this.description.type }"`
	}
}

