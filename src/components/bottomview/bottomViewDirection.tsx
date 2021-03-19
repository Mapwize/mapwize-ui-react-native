import React from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import icons from '../../icons'

export interface BottomViewDirectionProps {
  durationLabel?: string
  distanceLabel?: string
  errorLabel?: string
  mainColor?: string
}

const BottomViewDirection = ({
  durationLabel,
  distanceLabel,
  errorLabel,
  mainColor = '#F23196',
}: BottomViewDirectionProps) => {
  return (
    <>
      <SafeAreaView style={styles.bottomViewDirection} edges={['bottom']}>
        {errorLabel && <Text style={styles.errorLabel}>{errorLabel}</Text>}
        {!errorLabel && (
          <>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Image
                source={icons.CLOCK}
                style={{ tintColor: mainColor, marginRight: 8 }}
              />
              <Text style={(styles.duration, { color: mainColor })}>
                {durationLabel}
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Image
                source={icons.WALK}
                style={{ tintColor: mainColor, marginRight: 8 }}
              />
              <Text style={(styles.distanceLabel, { color: mainColor })}>
                {distanceLabel}
              </Text>
            </View>
          </>
        )}
      </SafeAreaView>
    </>
  )
}

const styles = StyleSheet.create({
  bottomViewDirection: {
    padding: 16,
    flexDirection: 'row',
    backgroundColor: 'white',
    justifyContent: 'space-evenly',
    elevation: 8,
    zIndex: 8,
    shadowOffset: {
      width: 0,
      height: -1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    borderTopEndRadius: 8,
    borderTopStartRadius: 8,
  },
  duration: {
    margin: 2,
    borderRadius: 32,
    padding: 16,
    backgroundColor: 'white',
  },
  distanceLabel: {
    margin: 2,
    borderRadius: 32,
    padding: 16,
    backgroundColor: 'white',
  },
  errorLabel: {
    margin: 2,
    borderRadius: 32,
    padding: 16,
    backgroundColor: 'white',
  },
})

export default BottomViewDirection
