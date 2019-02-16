//@flow

export const get_type = (x: any) => {
	if(x instanceof Array) {
		return "array"
	} else if(x === null) {
		return "null"
	} else {
		return typeof x
	}
}

