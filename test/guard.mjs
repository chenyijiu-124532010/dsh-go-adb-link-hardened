// Standalone checks for the command whitelist; no DSH kit or device needed.
import { __test } from '../lib/index.js'

const { checkAdbArgs } = __test
let failures = 0
const check = (ok, label, extra = '') => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}${extra ? ` — ${extra}` : ''}`)
  if (!ok) failures++
}

const allowed = [
  ['devices', '-l'],
  ['shell', 'getprop', 'ro.product.model'],
  ['shell', 'pm', 'list', 'packages'],
  ['shell', 'appops', 'get', 'com.example', 'REQUEST_INSTALL_PACKAGES'],
  ['shell', 'settings', 'get', 'global', 'adb_enabled'],
  ['shell', 'uiautomator', 'dump'],
  ['shell', 'input', 'tap', '100', '200'],
  ['shell', 'am', 'force-stop', 'com.example'],
  ['exec-out', 'screencap', '-p'],
  ['shell', 'echo', 'ok'],
  ['shell', 'false'],
]
for (const args of allowed) {
  check(checkAdbArgs(args) === null, `allow: adb ${args.join(' ')}`, checkAdbArgs(args) ?? '')
}

const blocked = [
  [],
  ['install', 'x.apk'],
  ['shell', 'pm', 'uninstall', 'com.example'],
  ['shell', 'pm', 'clear', 'com.example'],
  ['shell', 'settings', 'put', 'global', 'x', '1'],
  ['shell', 'rm', '-rf', '/sdcard/x'],
  ['shell', 'reboot'],
  ['shell', 'svc', 'wifi', 'disable'],
  ['shell', 'am', 'broadcast', '-a', 'X'],
  ['shell', 'monkey', '-p', 'com.example', '10'],
  ['shell', 'getprop; rm -rf /sdcard'],
  ['shell', 'dumpsys', 'notification', '--noredact'],
  ['exec-out', 'cat', '/sdcard/x'],
]
for (const args of blocked) {
  const reason = checkAdbArgs(args)
  check(reason !== null, `block: adb ${args.join(' ')}`, reason ?? '')
}

console.log(failures === 0 ? '\nall guard checks passed' : `\n${failures} guard check(s) failed`)
process.exit(failures === 0 ? 0 : 1)
