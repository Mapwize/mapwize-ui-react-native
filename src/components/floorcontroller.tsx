import React, { useEffect, useRef, useState } from 'react'
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native'

export interface FloorControllerProps {
  style: any
  reduxState: FloorControllerState
  disabled?: boolean
  onFloorSelected: (floor: number) => void
}
export interface FloorControllerState {
  floors: FloorDisplay[]
  selectedFloor?: number | null
  loadingFloor?: number | null
  tooltipMessage: string
  mainColor: string
}
export type FloorDisplay = { title: string; number?: number }

const FloorController = ({
  style,
  reduxState: {
    floors,
    selectedFloor,
    loadingFloor,
    tooltipMessage,
    mainColor,
  },
  disabled,
  onFloorSelected,
}: FloorControllerProps) => {
  const [contentHeight, setContentHeight] = useState<number>(250)
  const [scrollheight, setScrollheight] = useState<number>(250)
  const scrollView: React.RefObject<ScrollView | undefined> = useRef()
  useEffect(() => {
    if (contentHeight > scrollheight) {
      const ratio = (selectedFloor + 1) / floors.length
      const scrollTo = contentHeight - contentHeight * ratio
      scrollView?.current?.scrollTo?.({ y: scrollTo })
    }
  }, [scrollheight, contentHeight, selectedFloor, floors])
  if (disabled) {
    return <></>
  }
  const reversedFloors = [...floors].reverse()
  return (
    <ScrollView
      ref={scrollView}
      style={[style, {}]}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      onLayout={(evt) => {
        const { height } = evt.nativeEvent.layout
        setScrollheight(height)
      }}
    >
      <View
        onLayout={(evt) => {
          const { height } = evt.nativeEvent.layout
          setContentHeight(height)
        }}
      >
        {reversedFloors &&
          reversedFloors.map((floor) => (
            <TouchableHighlight
              style={[
                styles.floorItem,
                floor.number === selectedFloor && {
                  backgroundColor: mainColor,
                },
              ]}
              underlayColor={mainColor}
              activeOpacity={0.3}
              key={floor.number}
              onPress={() =>
                floor.number !== undefined && onFloorSelected(floor.number)
              }
            >
              <Text
                style={[
                  styles.floorText,
                  floor.number === selectedFloor && styles.floorTextSelected,
                ]}
              >
                {floor.title}
              </Text>
            </TouchableHighlight>
          ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  floorController: {},
  floorItem: {
    marginTop: 4,
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    width: 40,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 0,
    elevation: 2,
  },
  container: {
    padding: 8,
    flexGrow: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  floorItemSelected: {
    backgroundColor: '#c51596',
  },
  floorText: {
    padding: 0,
    margin: 0,
    fontSize: 16,
    color: 'black',
    textAlign: 'center',
  },
  floorTextSelected: {
    color: 'white',
  },
})

export default FloorController
