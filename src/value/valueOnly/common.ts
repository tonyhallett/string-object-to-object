export type TValueClosingChars = '}'|']'
export type ClosingChars<TClosing extends TValueClosingChars> = ','|TClosing

export type OneToNine = '1'|'2'|'3'|'4'|'5'|'6'|'7'|'8'|'9'

export const digitsArray = ['0','1','2','3','4','5','6','7','8','9'];

export const processError = new Error('process will not be called as completes from the stack');
export const stackCompletedError = new Error('stackCompleted will not be called as does not use the stack');