import React from 'react'
import { StyleSheet, View } from 'react-native'
import { DevCallbackInterceptor } from '../../devCallbackInterceptor'
import BottomViewDirection, {
  BottomViewDirectionProps,
} from './bottomViewDirection'
import PlaceDetails from './placeDetails'

export interface BottomViewState {
  expanded: boolean
  hidden: boolean
  content?: any
  directionContent?: BottomViewDirectionProps
  language: string
  mainColor?: string
}

export interface BottomViewProps {
  style: any
  reduxState: BottomViewState
  callbackInterceptor: DevCallbackInterceptor
  uses24?: boolean
  onExpandClick: () => void
  onDirectionClick: () => void
  onPhoneClick: (phoneNumber: string) => void
  onWebsiteClick: (website: string) => void
  onShareClick: (shareLink: string) => void
  onInformationClick: (placeDetails: any) => void
  onPlaceClick: (place: any) => void
  onDirectionToPlaceClick: (place: any) => void
}

const BottomView = ({
  style,
  reduxState: {
    expanded,
    hidden,
    content,
    directionContent,
    language,
    mainColor,
  },
  callbackInterceptor,
  uses24,
  onExpandClick,
  onDirectionClick,
  onPhoneClick,
  onWebsiteClick,
  onShareClick,
  onInformationClick,
  onPlaceClick,
  onDirectionToPlaceClick,
}: BottomViewProps) => {
  return (
    <>
      <View style={[style, styles.bottomView, expanded && styles.expanded]}>
        {directionContent && !hidden && (
          <BottomViewDirection
            errorLabel={directionContent?.errorLabel}
            durationLabel={directionContent?.durationLabel}
            distanceLabel={directionContent?.distanceLabel}
            mainColor={mainColor}
          />
        )}
        {!directionContent && content && !hidden && (
          <PlaceDetails
            style={styles.placeDetails}
            reduxState={{
              placeDetails: content,
              expanded,
              language,
              mainColor,
            }}
            callbackInterceptor={callbackInterceptor}
            uses24={uses24}
            onExpandClick={onExpandClick}
            onDirectionClick={onDirectionClick}
            onPhoneClick={onPhoneClick}
            onWebsiteClick={onWebsiteClick}
            onShareClick={onShareClick}
            onInformationClick={onInformationClick}
            onPlaceClick={onPlaceClick}
            onDirectionToPlaceClick={onDirectionToPlaceClick}
          />
        )}
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  bottomView: {},
  floorItem: {
    margin: 2,
    // elevation: 4,
    borderRadius: 32,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: 'white',
  },
  floorItemSelected: {
    backgroundColor: '#f09',
  },
  floorText: { flex: 1, padding: 0, margin: 0, fontSize: 16, color: 'black' },
  floorTextSelected: {
    color: 'white',
  },
  placeDetails: {},
  expanded: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
})

export default BottomView
