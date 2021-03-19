import React from 'react'
import { View } from 'react-native'
import { DevCallbackInterceptor } from '../../../devCallbackInterceptor'
import {
  buildCurrentOpeningStatus,
  buildOpeningHours,
} from '../../../formatter/openingHoursFormatter'
import Icons from '../../../icons'
import {
  lang_call,
  lang_capacity_not_available,
  lang_currently_available,
  lang_currently_occupied,
  lang_details,
  lang_direction,
  lang_information,
  lang_on_floor,
  lang_opening_hours_not_available,
  lang_outdoor,
  lang_overview,
  lang_phone_not_available,
  lang_schedule_not_available,
  lang_share,
  lang_website,
  lang_website_not_available,
} from '../../../localizor'
import {
  ButtonContent,
  FormattedPlaceDetails,
  RowsContent,
} from '../../../types'
import type { CalendarEvent } from './calendarEvents'
import ExpandedPlaceDetailsUI from './expandedView'
import SmallPlaceDetailsUI from './smallView'

export interface PlaceDetailsState {
  placeDetails: FormattedPlaceDetails
  expanded: boolean
  language: string
  mainColor?: string
}

export interface PlaceDetailsProps {
  style: any
  reduxState: PlaceDetailsState
  callbackInterceptor: DevCallbackInterceptor
  uses24?: boolean
  onDirectionClick: () => void
  onPhoneClick: (phoneNumber: string) => void
  onWebsiteClick: (website: string) => void
  onShareClick: (shareLink: string) => void
  onInformationClick: (placeDetails: any) => void
  onPlaceClick: (place: any) => void
  onDirectionToPlaceClick: (place: any) => void
  onExpandClick: () => void
}

const PlaceDetailsUI = ({
  style,
  reduxState: {
    placeDetails, // : any;
    expanded, // : boolean
    language, // : string;
    mainColor, // : string;
  },
  callbackInterceptor, // : DevCallbackInterceptor;
  uses24,
  onDirectionClick, // : () => void;
  onPhoneClick, // : (phoneNumber: string) => void;
  onWebsiteClick, // : (website: string) => void;
  onShareClick, // : (target: HTMLElement, shareLink: string) => void;
  onInformationClick, // : (placeDetails: any) => void;
  onExpandClick,
  onPlaceClick, // : (place: any) => void;
  onDirectionToPlaceClick, // : (place: any) => void;
}: PlaceDetailsProps) => {
  const openingStatus = buildCurrentOpeningStatus(
    placeDetails,
    language,
    uses24
  )
  const calendarStatus = getCalendarStatus(placeDetails, language)

  const rowsContent = generateRowsContents(
    placeDetails,
    callbackInterceptor,
    openingStatus,
    calendarStatus,
    onPhoneClick,
    onWebsiteClick,
    language,
    uses24
  )
  const buttonsContent = generateButtonContents(
    placeDetails,
    callbackInterceptor,
    onPhoneClick,
    onWebsiteClick,
    onShareClick,
    onInformationClick,
    onDirectionToPlaceClick,
    language
  )
  callbackInterceptor.onPlaceSelected?.(
    placeDetails,
    rowsContent,
    buttonsContent
  )
  return (
    <>
      {expanded && (
        <ExpandedPlaceDetailsUI
          style={style}
          reduxState={{
            placeDetails, // : any;
            buttonsContent,
            rowsContent,
            openingStatus,
            language, // : string;
            mainColor,
          }}
          callbackInterceptor={callbackInterceptor}
          onExpandClick={onExpandClick}
          onCloseClick={onExpandClick}
        />
      )}
      {!expanded && (
        <SmallPlaceDetailsUI
          style={style}
          reduxState={{
            placeDetails, // : any;
            buttonsContent,
            openingStatus,
            calendarStatus,
            language, // : string;
            mainColor,
          }}
          callbackInterceptor={callbackInterceptor}
          onExpandClick={onExpandClick}
        />
      )}
    </>
  )
}

const generateButtonContents = (
  placeDetails: FormattedPlaceDetails,
  devCallbackInterceptor: DevCallbackInterceptor,
  onPhoneClick: (phoneNumber: string) => void,
  onWebsiteClick: (website: string) => void,
  onShareClick: (shareLink: string) => void,
  onInformationClick: (placeDetails: any) => void,
  onDirectionToPlaceClick: (place: any) => void,
  language: string
): ButtonContent[] => {
  const buttonContents: ButtonContent[] = [
    {
      id: 'mwz-directions-button',
      title: lang_direction(language),
      imageSrc: Icons.DIRECTION,
      highlighted: true,
      callback: () => onDirectionToPlaceClick(placeDetails),
    },
  ]
  if (devCallbackInterceptor?.shouldDisplayInformationButton?.(placeDetails)) {
    buttonContents.push({
      id: 'mwz-informations-button',
      title: lang_information(language),
      imageSrc: Icons.INFO,
      highlighted: false,
      callback: () => onInformationClick(placeDetails),
    })
  }
  if (placeDetails.phone) {
    buttonContents.push({
      id: 'mwz-phone-button',
      title: lang_call(language),
      imageSrc: Icons.PHONE_OUTLINE,
      highlighted: false,
      callback: () => onPhoneClick(placeDetails.phone),
    })
  }
  if (placeDetails.website) {
    buttonContents.push({
      id: 'mwz-website-button',
      title: lang_website(language),
      imageSrc: Icons.GLOBE,
      highlighted: false,
      callback: () => onWebsiteClick(placeDetails.website),
    })
  }
  if (placeDetails.shareLink) {
    buttonContents.push({
      id: 'mwz-share-button',
      title: lang_share(language),
      imageSrc: Icons.SHARE,
      highlighted: false,
      callback: () => onShareClick(placeDetails.shareLink),
    })
  }

  return buttonContents
}

const isOccupied = (currentDate: Date, intervals: CalendarEvent[]): boolean => {
  for (let i = 0; i < intervals.length; i++) {
    if (
      intervals[i] != null &&
      currentDate > new Date(intervals[i].start) &&
      currentDate < new Date(intervals[i].end)
    ) {
      return true
    }
  }
  return false
}
const generateRowsContents = (
  placeDetails: FormattedPlaceDetails,
  devCallbackInterceptor: DevCallbackInterceptor,
  openingStatus: string,
  calendarStatus: string,
  onPhoneClick: (phoneNumber: string) => void,
  onWebsiteClick: (website: string) => void,
  language: string,
  uses24: boolean = true
): RowsContent[] => {
  let rowsContents: RowsContent[] = []

  if (placeDetails.floor) {
    rowsContents.push({
      id: 'mwz-floor-row',
      title:
        placeDetails.floor.number !== null
          ? lang_on_floor(language, placeDetails.floor.number)
          : lang_outdoor(language),
      imageSrc: Icons.FLOOR,
      available: true,
    })
  }

  if (placeDetails.website) {
    rowsContents.push({
      id: 'mwz-website-row',
      title: placeDetails.website,
      imageSrc: Icons.GLOBE,
      available: true,
      callback: () => onWebsiteClick(placeDetails.website),
    })
  } else {
    rowsContents.push({
      id: 'mwz-website-row',
      title: lang_website_not_available(language),
      imageSrc: Icons.GLOBE,
      available: false,
    })
  }

  if (placeDetails.phone) {
    rowsContents.push({
      id: 'mwz-phone-row',
      title: placeDetails.phone,
      imageSrc: Icons.PHONE_OUTLINE,
      available: true,
      callback: () => onPhoneClick(placeDetails.phone),
    })
  } else {
    rowsContents.push({
      id: 'mwz-phone-row',
      title: lang_phone_not_available(language),
      imageSrc: Icons.PHONE_OUTLINE,
      available: false,
    })
  }

  if (placeDetails.capacity) {
    rowsContents.push({
      id: 'mwz-capacity-row',
      title: '' + placeDetails.capacity,
      imageSrc: Icons.GROUP,
      available: true,
    })
  } else {
    rowsContents.push({
      id: 'mwz-capacity-row',
      title: lang_capacity_not_available(language),
      imageSrc: Icons.GROUP,
      available: false,
    })
  }

  if (placeDetails.openingHours && placeDetails.openingHours.length > 0) {
    rowsContents.push({
      id: 'mwz-openingHours-row',
      title: openingStatus, //TODO add openingHours
      imageSrc: Icons.CLOCK,
      available: true,
      data: buildOpeningHours(placeDetails.openingHours, language, uses24),
    })
  } else {
    rowsContents.push({
      id: 'mwz-openingHours-row',
      title: lang_opening_hours_not_available(language),
      imageSrc: Icons.CLOCK,
      available: false,
    })
  }
  if (placeDetails.calendarEvents) {
    rowsContents.push({
      id: 'mwz-calendarEvents-row',
      title: calendarStatus, //TODO add openingHours
      imageSrc: Icons.CALENDAR,
      available: true,
      data: placeDetails.calendarEvents,
    })
  } else {
    rowsContents.push({
      id: 'mwz-calendarEvents-row',
      title: lang_schedule_not_available(language),
      imageSrc: Icons.CALENDAR,
      available: false,
    })
  }
  rowsContents.sort((a, b) => (b.available ? 1 : 0) - (a.available ? 1 : 0))
  return rowsContents
}

const getCalendarStatus = (
  placeDetails: FormattedPlaceDetails,
  language: string
) => {
  let status
  if (placeDetails.calendarEvents) {
    status = isOccupied(new Date(), placeDetails.calendarEvents)
      ? lang_currently_occupied(language)
      : lang_currently_available(language)
  }
  return status
}

export default PlaceDetailsUI
