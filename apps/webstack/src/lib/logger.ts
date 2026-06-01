type LogMethod = (...args: unknown[]) => void;

const formatNow = () =>
	new Intl.DateTimeFormat(undefined, {
		year: 'numeric',
		month: 'short',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hour12: false
	}).format(new Date());

function withTimestamp(method: LogMethod): LogMethod {
	return (...args: unknown[]) => method(`[${formatNow()}]`, ...args);
}

export const logger = {
	log: withTimestamp(console.log.bind(console)),
	info: withTimestamp(console.info.bind(console)),
	warn: withTimestamp(console.warn.bind(console)),
	error: withTimestamp(console.error.bind(console)),
	debug: withTimestamp(console.debug.bind(console))
};
