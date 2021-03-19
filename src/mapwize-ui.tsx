// @ts-nocheck
/**
 * Mapwize UI view
 * https://mapwize.io
 *
 * @format
 * @flow strict-local
 */

import React from 'react'

import UIController from './uiController'
import type { UIOptions } from './types'

const MapwizeUI = (props: UIOptions) => {
  // TODO set mainColor on Android
  return (
    <>
      <UIController {...props} />
    </>
  )
}

export default MapwizeUI
