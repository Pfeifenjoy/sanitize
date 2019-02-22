//@flow

import { Exception as Base } from "."
import type { Description } from "../types"

export default class DescriptionError extends Base {
	description: Description
	property: any

	constructor(description: Description, property: any) {
		super()
		this.description = description
		this.property = property
	}

	get_message() {
		return "Description Error"
	}
}
