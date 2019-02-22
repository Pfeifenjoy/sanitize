//@flow

import { describe, it } from "mocha"
import sanitize, {
	object,
	array,
	number,
	string,
	boolean,
	variant,
	get_boolean,
	get_variant,
	fallback
} from "../src"
import {
	SanitizeError,
	UnexpectedType,
	UndefinedAttribute,
	ObjectError
} from "../src/exception"
import assert from "assert"

describe("sanitize", () => {
	describe("basic", () => {
		const object = {
			a: 1,
			b: "2"
		}

		const description = {
			type: "object",
			children: new Map([
				[ "a", { type: "number" } ],
				[ "b", { type: "string" } ]
			])
		}

		it("sanitize attributes", () => {
			const o = sanitize(description)(object)
			assert.deepEqual(o, { a: 1, b: "2" })
		})
	})
	describe("number", () => {
		const description = number()
		it("ok", () => {
			const object = 1
			const result = sanitize(description)(object)
			assert(result === 1)
		})
		it("error", () => {
			const object = "1"
			try {
				sanitize(description)(object)
				assert(false)
			} catch(e) {
				assert(e instanceof SanitizeError, "Always throw a sanitize error")
				const reason = e.error
				assert(reason instanceof UnexpectedType, "Wrong type provided.")
				assert(reason.description === description)
				assert(reason.property === "1")
			}
		})
	})
	describe("string", () => {
		const description = string()
		it("ok", () => {
			const object = "test"
			const result = sanitize(description)(object)
			assert(result === "test")
		})
		it("error", () => {
			const object = 1
			try {
				sanitize(description)(object)
				assert(false)
			} catch(e) {
				assert(e instanceof SanitizeError, "Always throw a sanitize error")
				const reason = e.error
				assert(reason instanceof UnexpectedType, "Wrong type provided.")
				assert(reason.description === description)
				assert(reason.property === 1)
			}
		})
	})
	describe("boolean", () => {
		const description = boolean()
		it("ok", () => {
			const object = true
			const result = sanitize(description)(object)
			assert(result === true)
		})
		it("error", () => {
			const object = "true"
			try {
				sanitize(description)(object)
				assert(false)
			} catch(e) {
				assert(e instanceof SanitizeError, "Always throw a sanitize error")
				const reason = e.error
				assert(reason instanceof UnexpectedType, "Wrong type provided.")
				assert(reason.description === description)
				assert(reason.property === "true")
			}
		})
		it("fallback", () => {
			const object = true
			const result = sanitize(description)(object)
			assert(fallback(get_boolean)(false)(result) === object)
		})
	})
	describe("object", () => {
		const description = object({
			a: number(),
			b: string()
		})
		it("ok", () => {
			const object = {
				a: 1,
				b: "1"
			}
			const result = sanitize(description)(object)
			assert.deepEqual(result, { a: 1, b: "1" })
		})
		it("error", () => {
			const object = {
				a: "1",
				b: 1
			}
			try {
				sanitize(description)(object)
				assert(false)
			} catch(e) {
				assert(e instanceof SanitizeError, "Always throw a sanitize error")
				const reason = e.error
				assert(reason instanceof ObjectError, "Wrong type provided.")
				assert.deepEqual(reason.key_chain, [ "a" ])
				assert(reason.error instanceof UnexpectedType)
				assert.deepEqual(reason.error, { description: { type: "number" }, property: "1" })
			}
		})
		it("error field missing", () => {
			const object = {
				a: 1
			}
			try {
				sanitize(description)(object)
				assert(false)
			} catch(e) {
				assert(e instanceof SanitizeError, "Always throw a sanitize error")
				const reason = e.error
				assert(reason instanceof ObjectError, "Field missing.")
				assert.deepEqual(reason.key_chain, [ "b" ])
				assert(reason.error instanceof UndefinedAttribute)
				assert.deepEqual(reason.error,
					{ description: { type: "string" }, property: undefined })
			}
		})
		it("nested", () => {
			const description = object({
				a: object({
					b: number()
				})
			})
			const o = {
				a: {
					b: 1
				}
			}
			const result = sanitize(description)(o)
			assert.deepEqual(result, o)
		})
	})
	describe("array", () => {
		const description = array(number())
		it("ok", () => {
			const o = [ 1, 2, 3, 4 ]
			const result = sanitize(description)(o)
			assert.deepEqual(o, result)
		})
		it("error", () => {
			const o = [ "1", "2", "3", "4" ]
			try {
				sanitize(description)(o)
				assert(false)
			} catch(e) {
				assert(e instanceof SanitizeError, "Always throw a sanitize error")
				const reason = e.error
				assert(reason instanceof UnexpectedType)
				assert.deepEqual(reason, { description: { type: "number" }, property: "1" })
			}
		})
	})
	describe("variant", () => {
		const description = variant([ number(), string() ])
		it("first variant", () => {
			const o = 42
			const result = sanitize(description)(o)
			const v0 = get_variant(0)(result)
			assert(v0 === 42, "Check expected value of first variant")
		})
		it("second variant", () => {
			const o = "42"
			const result = sanitize(description)(o)
			const v1 = get_variant(1)(result)
			assert(v1 === "42", "Check expected value of first variant")
		})
		it("choosing the wrong variant", () => {
			const o = 42
			const result = sanitize(description)(o)
			try {
				get_variant(1)(result)
				assert(false)
			} catch(e) {
				assert(e instanceof TypeError, "Wrong variant")
			}
		})
	})
})
