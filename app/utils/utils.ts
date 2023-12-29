import { isAddress, isHex, bytesToString, fromHex, getAddress } from 'viem'


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

export function formatParams(method: string, params: any[]) {
  let _params = params;
  if(
    method === "eth_sign" ||
    method === "eth_signTypedData_v4"
  )
    _params[0] = getAddress(params[0]) as `0x${string}`;
  if(method === "personal_sign")
    _params[1] = getAddress(params[1]) as `0x${string}`;
  return _params;
}
  