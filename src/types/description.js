//@flow

import type { Type, Property, Children } from "."

export type Description = {
	type: Type,
	optional?: boolean,
	constraint?: Property => boolean,
	default?: Property,
	children?: Children,
	element_description?: Description
}

