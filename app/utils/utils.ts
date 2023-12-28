import { isAddress, isHex, bytesToString, fromHex } from 'viem'


export function convertHexToUtf8(value: string) {
  if (isHex(value)) {
    const r = fromHex(value, "bytes");
    return bytesToString(r);
  }
  
  return value;
}
  
export function getSignParamsMessage(params: string[]) {
  const message = params.filter(p => !isAddress(p))[0];
  
  return convertHexToUtf8(message);
}
  