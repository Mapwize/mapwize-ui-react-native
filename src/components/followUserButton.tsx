import { FollowUserMode } from 'mapwize-sdk-react-native'
import React from 'react'
import { Image, StyleSheet, TouchableHighlight } from 'react-native'
import icons from '../icons'

export interface FollowUserButtonState {
  followUserMode: FollowUserMode
  tooltipMessage: string
  mainColor: string
}

export interface FollowUserButtonProps {
  style: any
  reduxState: FollowUserButtonState
  hasLocation: boolean
  disabled?: boolean
  onClick: () => void
}

const FollowUserButton = ({
  style,
  reduxState: { tooltipMessage, followUserMode, mainColor }, //TODO use proper tooltip
  hasLocation,
  disabled,
  onClick,
}: FollowUserButtonProps) => {
  if (disabled) {
    return <></>
  }
  return (
    <>
      <TouchableHighlight
        style={[style, styles.followUserButton]}
        accessibilityLabel={tooltipMessage}
        activeOpacity={0.6}
        underlayColor="#DDDDDD"
        onPress={onClick}
      >
        <Image
          source={hasLocation ? icons.GEOLOC_ON : icons.GEOLOC_OFF}
          style={[
            styles.image,
            followUserMode.followUserMode !== 'none'
              ? { tintColor: mainColor }
              : { tintColor: 'black' },
          ]}
        />
      </TouchableHighlight>
    </>
  )
}

const styles = StyleSheet.create({
  followUserButton: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 32,
    alignContent: 'center',
    alignSelf: 'center',
    height: 56,
    width: 56,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  image: {
    height: 24,
    width: 24,
  },
})

export default FollowUserButton
