import React from 'react'
import { Image, StyleSheet, Text, TouchableHighlight, View } from 'react-native'
import icons from '../icons'

export interface NavigationControlState {
  heading: number
}

export interface NavigationControlProps {
  style: any
  onReady: (ref: NavigationControl) => void
  onCompassClick: () => void
}

export default class NavigationControl extends React.Component<
  NavigationControlProps,
  NavigationControlState
> {
  constructor(props: NavigationControlProps) {
    super(props)
    props.onReady?.(this)
    this.state = { heading: 0 }
  }
  public setHeading(heading: number) {
    this.setState({ heading })
  }
  render() {
    return (
      <>
        <TouchableHighlight
          style={[this.props.style, styles.controlItem]}
          onPress={() => this.props.onCompassClick()}
        >
          <Image
            source={icons.COMPASS}
            style={{ transform: [{ rotate: this.state.heading + 'deg' }] }}
          />
        </TouchableHighlight>
      </>
    )
  }
}

const styles = StyleSheet.create({
  navigationControl: {
    display: 'flex',
    flexDirection: 'column',
  },
  controlItem: {
    alignSelf: 'center',
    margin: 2,
    borderRadius: 20,
    height: 40,
    width: 40,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 0,
    elevation: 2,
  },
  zoomIn: { padding: 16 },
  zoomOut: { padding: 16 },
})
