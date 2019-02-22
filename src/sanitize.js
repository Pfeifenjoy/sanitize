//@flow

import assert from "assert"

import {
	implies,
	get_type
} from "./util"

import {
	SanitizeError,
	ObjectError,
	UndefinedAttribute,
	UnexpectedType,
	ConstraintError,
	VariantError,
	Exception
} from "./exception"

import type {
	Property,
	Description
} from "./types"

import {
	is_object,
	is_attribute,
	is_variant
} from "./checker"

/**
 * Basic test for a description.
 */
const assert_description = (description: Description) => {
	assert(is_object(description) || is_attribute(description) || is_variant(description),
		`Unknown description type: ${ description.type }`)
	assert(implies(!is_object(description))(description.children === undefined),
		"Ill formed description: Only Objects can have children.")
	assert(implies(is_object(description))(description.children !== undefined),
		"Object description must always have children.")

	//Wrong type of default value: ${ description.type } != ${ typeof description.default }
	assert(
		implies(description.type === "array")(description.element_description !== undefined),
		"You must provide an element type.")
}

const sanitize_basic = (description: Description) => (object: *) => {
	//check if value is missing
	if(object === undefined && description.default === undefined && !description.optional) {
		throw new UndefinedAttribute(description, object)
	}

	//set default if optional and value missing
	if(object === undefined && description.default !== undefined) {
		object = description.default
	}

	//check for correct type
	if(!((get_type(object) === description.type)
		|| (object === undefined && description.optional))) {
		throw new UnexpectedType(description, object)
	}

	//apply constraints
	if(description.constraint !== undefined && description.constraint(object)) {
		throw new ConstraintError(description, object)
	}

	return object
}

const sanitize_attribute = (description: Description) => (attribute: any): Property => {
	attribute = sanitize_basic(description)(attribute)

	//sanitize elements of array for description
	if(attribute instanceof Array && description.element_description !== undefined) {
		try {
			return attribute.map(sanitize(description.element_description))
		} catch(e) {
			if(e instanceof SanitizeError) {
				throw e.error
			}
		}
	}

	return attribute
}

const sanitize_object = (description: Description) => (object: Object) => {
	object = sanitize_basic(description)(object)

	if(!(typeof object === "object" && !(object instanceof Array) && object !== null)) {
		assert(false, "Somehow sanitize_basic did not check the type")
		throw new Exception() //help flow detect the type
	}

	const result = { }

	for(const [ child_key, child_description ] of description.children || new Map) {
		try {
			result[child_key] = sanitize(child_description)(object[child_key])
		} catch(e) {
			const error = (() => {
				if(e instanceof SanitizeError) {
					return new ObjectError(object, e.error)
				} else if(e instanceof ObjectError) {
					return e
				} else {
					return new ObjectError(object, e)
				}
			})()
			error.object = object
			error.add_key(child_key)
			throw error
		}
	}
	return result
}

const sanitize_variant = (description: Description) => (object: any) => {
	assert(description.alternatives instanceof Array, "no alternative provided to variant")
	const alternatives = description.alternatives || [ ]

	let variant = 0
	const errors = [ ]
	for(const alternative of alternatives) {
		try {
			return { variant, data: sanitize(alternative)(object) }
		} catch(e) {
			errors.push(e)
		}
		variant += 1
	}

	throw new VariantError(description, object, errors)
}

const sanitize = (description: Description) => (object: any) => {
	assert_description(description)

	try {
		if(is_attribute(description)) {
			return sanitize_attribute(description)(object)
		} else if(is_object(description)) {
			return sanitize_object(description)(object)
		} else if(is_variant(description)) {
			return sanitize_variant(description)(object)
		}
	} catch(e) {
		throw new SanitizeError(e)
	}

	assert(false, `description has unknown type: ${ description.type }`)
}

export default sanitize
