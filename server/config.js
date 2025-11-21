// Konfigurimi kryesor i aplikacionit

export default {
  // Porta ku do të nisë serveri Express
  port: process.env.PORT || 4000,

  // MAC default (mund ta ndryshosh sipas pajisjes ose emulatorit)
  defaultMac: process.env.DEFAULT_MAC || "00:1A:79:6E:D1:2E",

  // Portal default (mund ta ndryshosh sipas serverit IPTV)
  defaultPortal: process.env.DEFAULT_PORTAL || "http://testdi1.proxytx.cloud/c",

  // User-Agent që përdoret për STB emulimin
  userAgent: process.env.USER_AGENT || "MAG250/5.0-0",

  // Opsione të tjera
  logLevel: process.env.LOG_LEVEL || "debug", // debug, info, error
  timeout: parseInt(process.env.TIMEOUT || "10000", 10), // timeout për fetch në ms
};
