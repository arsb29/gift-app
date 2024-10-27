type Options = {
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
}

export function toMilliseconds(options: Options) {
  const {hours = 0, minutes = 0, seconds = 0, milliseconds = 0} = options;
  return (hours * 60 * 60 + minutes * 60 + seconds) * 1000 + milliseconds;
}
