//@flow

import { DescriptionError } from "."

export default class UndefinedAttribute extends DescriptionError {
	get_message() {
		return `Undefined Attribute -> Expected "${ this.description.type }"`
	}
}

