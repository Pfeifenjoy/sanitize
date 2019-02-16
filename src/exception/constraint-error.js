//@flow

import { DescriptionError } from "."

export default class ConstraintError extends DescriptionError {
	get_message() {
		return `ConstraintError on property "${ this.property }"`
	}
}
