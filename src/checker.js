//@flow

import type { Description, Type } from "./types"

const check = (expected_type: Type) => ({ type }: Description) => type === expected_type

export const is_object = check("object")

export const is_boolean = check("boolean")

export const is_number = check("number")

export const is_null = check("null")

export const is_array = check("array")

export const is_string = check("string")

export const is_variant = check("variant")

export const is_attribute = (description: Description): boolean =>
	is_string(description) || is_number(description) || is_boolean(description)
		|| is_null(description) || is_array(description)
