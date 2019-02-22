//@flow

export type {
	Description,
	Type,
	Property,
	Children
} from "./types"

export {
	is_object,
	is_string,
	is_number,
	is_array,
	is_null,
	is_boolean,
	is_attribute
} from "./checker"

export { default as default } from "./sanitize"
export { object, array, number, string, boolean, NULL } from "./definition"

export {
	get_string,
	get_number,
	get_boolean,
	get_null,
	get_object,
	get_array,
	fallback
} from "./getter"
