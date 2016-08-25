'use strict'

import test from 'ava'
import {Worker} from '../'
import {fixtures, makeTeardown, makeSetup} from './utils'
import {delay} from 'bluebird'

const $ = {}

test.before(() => makeSetup($, Worker, new Map([
  [/^reserve\r\ndelete 1\r\n$/, fixtures.DEADLINE_SOON_DELETE_BATCH],
  [/^release 2 2 100\r\n$/, fixtures.RELEASED]
])))

test.after(() => makeTeardown($))

test('commands stay in sync after failure at start of batched response ', (t) => {
  return Promise.all([
    $.client.reserveP().then(t.fail)
      .catch((err) => t.is(err.message, 'DEADLINE_SOON')),
    $.client.deleteP('1'),
    // Delay a bit so that this one goes as a separate command.
    delay(5).then(() => $.client.releaseP('2', 2, 100))
  ])
})
