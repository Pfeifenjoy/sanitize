//@flow

import assert from "assert"

import {
	implies,
	get_type
} from "./util"

import {
	SanitizeError,
	UndefinedAttribute,
	UnexpectedType,
	ConstraintError,
	Exception
} from "./exception"

import type {
	Property,
	Description
} from "./types"

import {
	is_object,
	is_attribute
} from "./checker"

/**
 * Basic test for a description.
 */
const assert_description = (description: Description) => {
	assert(is_object(description) || is_attribute(description),
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
	//sanitize elements of array for description
	if(attribute instanceof Array && description.element_description !== undefined) {
		return attribute.map(sanitize(description.element_description))
	}

	return attribute
}

const sanitize_object = (description: Description) => (object: Object) => {
	if(!(typeof object === "object" && !(object instanceof Array) && object !== null)) {
		assert(false, "Somehow sanitize_basic did not check the type")
		throw new Exception() //help flow detect the type
	}

	const result = { }

	for(const [ child_key, child_description ] of description.children || new Map) {
		try {
			result[child_key] = sanitize(child_description)(object[child_key])
		} catch(e) {
			//catch errors and set path and original object
			const sanitize_exception = e instanceof SanitizeError ?
				e.object = object : new SanitizeError(object, e)
			sanitize_exception.add_key(child_key)
			throw sanitize_exception
		}
	}
	return result
}

const sanitize = (description: Description) => (object: any) => {
	assert_description(description)
	object = sanitize_basic(description)(object)

	if(is_attribute(description)) {
		return sanitize_attribute(description)(object)
	} else if(is_object(description)) {
		return sanitize_object(description)(object)
	}
}

export default sanitize
